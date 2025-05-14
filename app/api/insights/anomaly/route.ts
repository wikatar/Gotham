import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  sourceId: z.string().optional(),
  pipelineId: z.string().optional(),
  field: z.string().optional(), // Specific field to analyze 
  method: z.enum(['iqr', 'zscore', 'percent', 'auto']).default('auto')
})

// Detects outliers/anomalies in cleaned data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: parsed.error.format() 
      }, { status: 400 })
    }

    const { sourceId, pipelineId, field, method } = parsed.data

    // Build the query
    const where: any = {}
    if (sourceId) where.sourceId = sourceId
    if (pipelineId) where.pipelineId = pipelineId

    // Fetch cleaned rows
    const rows = await db.cleanedRow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit for performance
      include: {
        dataSource: {
          select: { name: true }
        },
        pipeline: {
          select: { name: true }
        }
      }
    })

    if (rows.length === 0) {
      return NextResponse.json({ 
        anomalies: [],
        message: 'No data found',
        count: 0
      })
    }

    // Extract the field values for analysis
    // If no specific field was requested, we'll analyze all numeric fields
    const anomalies = []
    
    // Identify all fields if no specific field provided
    let fieldsToAnalyze: string[] = []
    if (field) {
      fieldsToAnalyze = [field]
    } else {
      // Take the first row as a sample to identify numeric fields
      const sampleRow = rows[0].row as any
      fieldsToAnalyze = Object.keys(sampleRow).filter(key => {
        const val = sampleRow[key]
        // Check if the value is numeric or can be converted to a number
        return typeof val === 'number' || 
               (typeof val === 'string' && !isNaN(parseFloat(val)))
      })
    }

    // Analyze each field
    for (const fieldName of fieldsToAnalyze) {
      const values = rows.map(row => {
        const rowData = row.row as any
        const val = rowData[fieldName]
        if (typeof val === 'number') return val
        if (typeof val === 'string') {
          const num = parseFloat(val)
          return isNaN(num) ? null : num
        }
        return null
      }).filter(val => val !== null) as number[]
      
      if (values.length < 5) {
        // Not enough data for meaningful anomaly detection
        continue
      }

      // Determine anomaly detection method
      let anomalyRows
      
      switch (method) {
        case 'iqr':
          anomalyRows = detectAnomaliesIQR(rows, values, fieldName)
          break
        case 'zscore':
          anomalyRows = detectAnomaliesZScore(rows, values, fieldName)
          break
        case 'percent':
          anomalyRows = detectAnomaliesPercentile(rows, values, fieldName)
          break
        case 'auto':
        default:
          // Choose method based on data distribution
          anomalyRows = detectAnomaliesIQR(rows, values, fieldName)
      }
      
      anomalies.push({
        field: fieldName,
        anomalies: anomalyRows.map(row => ({
          id: row.id,
          sourceId: row.sourceId,
          pipelineId: row.pipelineId,
          value: (row.row as any)[fieldName],
          sourceName: row.dataSource.name,
          pipelineName: row.pipeline.name,
          createdAt: row.createdAt,
          row: row.row
        })),
        count: anomalyRows.length,
        method: method
      })
    }

    return NextResponse.json({
      anomalies,
      totalAnomalies: anomalies.reduce((sum, field) => sum + field.anomalies.length, 0),
      fieldsAnalyzed: fieldsToAnalyze.length
    })
  } catch (error) {
    console.error('Error detecting anomalies:', error)
    return NextResponse.json({ 
      error: 'Failed to detect anomalies',
      message: (error as Error).message
    }, { status: 500 })
  }
}

// Interquartile Range method (IQR)
function detectAnomaliesIQR(rows: any[], values: number[], fieldName: string) {
  // Sort values for quantile calculation
  const sortedValues = [...values].sort((a, b) => a - b)
  
  // Calculate quartiles
  const q1Index = Math.floor(sortedValues.length * 0.25)
  const q3Index = Math.floor(sortedValues.length * 0.75)
  const q1 = sortedValues[q1Index]
  const q3 = sortedValues[q3Index]
  
  // Calculate IQR and bounds
  const iqr = q3 - q1
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr
  
  // Find anomalies
  return rows.filter(row => {
    const val = (row.row as any)[fieldName]
    const numVal = typeof val === 'number' ? val : parseFloat(val)
    return !isNaN(numVal) && (numVal < lowerBound || numVal > upperBound)
  })
}

// Z-Score method
function detectAnomaliesZScore(rows: any[], values: number[], fieldName: string) {
  // Calculate mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  
  // Calculate standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  // Threshold for anomalies (common value is 3)
  const threshold = 3
  
  // Find anomalies
  return rows.filter(row => {
    const val = (row.row as any)[fieldName]
    const numVal = typeof val === 'number' ? val : parseFloat(val)
    if (isNaN(numVal)) return false
    
    const zScore = Math.abs((numVal - mean) / stdDev)
    return zScore > threshold
  })
}

// Percentile method (detect values in the extreme percentiles)
function detectAnomaliesPercentile(rows: any[], values: number[], fieldName: string) {
  // Sort values
  const sortedValues = [...values].sort((a, b) => a - b)
  
  // Calculate extreme percentile indices (e.g., top and bottom 5%)
  const percentile = 0.05
  const lowerIndex = Math.floor(sortedValues.length * percentile)
  const upperIndex = Math.floor(sortedValues.length * (1 - percentile))
  
  const lowerBound = sortedValues[lowerIndex]
  const upperBound = sortedValues[upperIndex]
  
  // Find anomalies
  return rows.filter(row => {
    const val = (row.row as any)[fieldName]
    const numVal = typeof val === 'number' ? val : parseFloat(val)
    return !isNaN(numVal) && (numVal <= lowerBound || numVal >= upperBound)
  })
} 