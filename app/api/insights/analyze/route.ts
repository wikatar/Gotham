import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  sourceId: z.string().optional(),
  pipelineId: z.string().optional(),
  type: z.enum(['trends', 'correlations', 'summary', 'recommendations']).default('summary')
})

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

    const { sourceId, pipelineId, type } = parsed.data

    // Build the query
    const where: any = {}
    if (sourceId) where.sourceId = sourceId
    if (pipelineId) where.pipelineId = pipelineId

    // Fetch cleaned rows
    const rows = await db.cleanedRow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500, // Limit for performance
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
        insights: [],
        message: 'No data available for analysis',
        count: 0
      })
    }

    // Extract field names and their types from first row
    const firstRow = rows[0].row as any
    const fields = Object.keys(firstRow).map(key => {
      const value = firstRow[key]
      let fieldType = 'unknown'
      
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)))) {
        fieldType = 'numeric'
      } else if (typeof value === 'string') {
        // Check if it's a date
        if (!isNaN(Date.parse(value))) {
          fieldType = 'date'
        } else {
          fieldType = 'string'
        }
      } else if (typeof value === 'boolean') {
        fieldType = 'boolean'
      }
      
      return { name: key, type: fieldType }
    })

    // Generate insights based on the type requested
    let insights = []
    
    switch (type) {
      case 'trends':
        insights = generateTrendInsights(rows, fields)
        break
      case 'correlations':
        insights = generateCorrelationInsights(rows, fields)
        break
      case 'recommendations':
        insights = generateRecommendations(rows, fields)
        break
      case 'summary':
      default:
        insights = generateDataSummary(rows, fields)
    }

    return NextResponse.json({
      insights,
      count: insights.length,
      datasource: rows[0].dataSource.name,
      pipeline: rows[0].pipeline.name,
      analysisTime: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json({ 
      error: 'Failed to generate insights',
      message: (error as Error).message
    }, { status: 500 })
  }
}

// Generates summary statistics for the dataset
function generateDataSummary(rows: any[], fields: any[]) {
  const insights = []
  
  // Get numeric fields
  const numericFields = fields.filter(field => field.type === 'numeric')
  
  // For each numeric field, calculate stats
  for (const field of numericFields) {
    const values = rows.map(row => {
      const val = (row.row as any)[field.name]
      return typeof val === 'number' ? val : parseFloat(val)
    }).filter(val => !isNaN(val))
    
    if (values.length > 0) {
      // Calculate basic statistics
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length
      const min = Math.min(...values)
      const max = Math.max(...values)
      
      // Calculate median
      const sortedValues = [...values].sort((a, b) => a - b)
      const median = sortedValues[Math.floor(sortedValues.length / 2)]
      
      insights.push({
        title: `Summary of ${field.name}`,
        content: `The average ${field.name} is ${avg.toFixed(2)}, with values ranging from ${min.toFixed(2)} to ${max.toFixed(2)}. The median value is ${median.toFixed(2)}.`,
        field: field.name,
        stats: { avg, min, max, median, count: values.length },
        confidence: 95,
        type: 'summary'
      })
    }
  }
  
  // Add categorical field insights
  const categoricalFields = fields.filter(field => field.type === 'string')
  
  for (const field of categoricalFields) {
    // Count frequencies of each value
    const frequencies: {[key: string]: number} = {}
    
    rows.forEach(row => {
      const value = (row.row as any)[field.name]
      if (value) {
        frequencies[value] = (frequencies[value] || 0) + 1
      }
    })
    
    // Get top 3 most common values
    const topValues = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    if (topValues.length > 0) {
      insights.push({
        title: `Distribution of ${field.name}`,
        content: `The most common values for ${field.name} are: ${topValues.map(([value, count]) => 
          `"${value}" (${Math.round(count/rows.length*100)}%)`).join(', ')}.`,
        field: field.name,
        topValues,
        confidence: 90,
        type: 'distribution'
      })
    }
  }
  
  return insights
}

// Identifies trends over time in the data
function generateTrendInsights(rows: any[], fields: any[]) {
  const insights = []
  
  // Look for date fields
  const dateFields = fields.filter(field => field.type === 'date')
  
  if (dateFields.length === 0) {
    // Use row creation date if no date fields in the data
    dateFields.push({ name: 'createdAt', type: 'date' })
  }
  
  // Get numeric fields to analyze trends
  const numericFields = fields.filter(field => field.type === 'numeric')
  
  for (const dateField of dateFields) {
    for (const numericField of numericFields) {
      // Get data points sorted by date
      const dataPoints = rows.map(row => {
        const dateValue = dateField.name === 'createdAt' 
          ? row.createdAt 
          : (row.row as any)[dateField.name]
        
        const numericValue = (row.row as any)[numericField.name]
        
        // Convert to proper types
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
        const value = typeof numericValue === 'number' ? 
          numericValue : parseFloat(numericValue)
        
        return { date, value }
      })
      .filter(point => !isNaN(point.value) && !isNaN(point.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      
      if (dataPoints.length < 5) continue // Not enough data for trend analysis
      
      // Simple trend detection - comparing first and last quartiles
      const q1End = Math.floor(dataPoints.length * 0.25)
      const q4Start = Math.floor(dataPoints.length * 0.75)
      
      const firstQuartileAvg = dataPoints.slice(0, q1End)
        .reduce((sum, point) => sum + point.value, 0) / q1End
      
      const lastQuartileAvg = dataPoints.slice(q4Start)
        .reduce((sum, point) => sum + point.value, 0) / (dataPoints.length - q4Start)
      
      const percentChange = ((lastQuartileAvg - firstQuartileAvg) / firstQuartileAvg) * 100
      
      // Only report significant trends
      if (Math.abs(percentChange) > 5) {
        const direction = percentChange > 0 ? 'increasing' : 'decreasing'
        
        insights.push({
          title: `Trend in ${numericField.name}`,
          content: `${numericField.name} is ${direction} over time (${Math.abs(percentChange).toFixed(1)}% ${direction} from ${firstQuartileAvg.toFixed(2)} to ${lastQuartileAvg.toFixed(2)}).`,
          field: numericField.name,
          dateField: dateField.name,
          percentChange,
          firstQuartileAvg,
          lastQuartileAvg,
          confidence: Math.min(90, 70 + Math.min(20, dataPoints.length / 10)),
          type: 'trend'
        })
      }
    }
  }
  
  return insights
}

// Identifies potential correlations between fields
function generateCorrelationInsights(rows: any[], fields: any[]) {
  const insights = []
  
  // Get numeric fields
  const numericFields = fields.filter(field => field.type === 'numeric')
  
  // Need at least 2 numeric fields for correlation
  if (numericFields.length < 2) return insights
  
  // Calculate correlations between each pair of numeric fields
  for (let i = 0; i < numericFields.length; i++) {
    for (let j = i + 1; j < numericFields.length; j++) {
      const field1 = numericFields[i]
      const field2 = numericFields[j]
      
      // Get paired values
      const pairs = rows.map(row => {
        const val1 = (row.row as any)[field1.name]
        const val2 = (row.row as any)[field2.name]
        
        const num1 = typeof val1 === 'number' ? val1 : parseFloat(val1)
        const num2 = typeof val2 === 'number' ? val2 : parseFloat(val2)
        
        if (isNaN(num1) || isNaN(num2)) return null
        
        return [num1, num2]
      }).filter(pair => pair !== null) as [number, number][]
      
      if (pairs.length < 10) continue // Not enough data
      
      // Calculate Pearson correlation coefficient
      const correlation = calculateCorrelation(pairs)
      
      // Only report significant correlations
      if (Math.abs(correlation) > 0.5) {
        const strength = Math.abs(correlation) > 0.8 ? 'strong' : 'moderate'
        const direction = correlation > 0 ? 'positive' : 'negative'
        
        insights.push({
          title: `Correlation between ${field1.name} and ${field2.name}`,
          content: `There is a ${strength} ${direction} correlation (${correlation.toFixed(2)}) between ${field1.name} and ${field2.name}.`,
          fields: [field1.name, field2.name],
          correlation,
          confidence: Math.min(90, 70 + Math.abs(correlation) * 20),
          type: 'correlation'
        })
      }
    }
  }
  
  return insights
}

// Generate actionable recommendations based on the data
function generateRecommendations(rows: any[], fields: any[]) {
  const insights = []
  
  // Placeholder for recommendations - would typically use more advanced logic or ML
  // For now, we'll generate simple recommendations based on observed patterns
  
  // Add a recommendation about anomalies if there are numeric fields
  const numericFields = fields.filter(field => field.type === 'numeric')
  if (numericFields.length > 0) {
    // Use the first numeric field for a sample recommendation
    const field = numericFields[0]
    
    insights.push({
      title: `Monitor ${field.name} Anomalies`,
      content: `Consider setting up automated alerts for anomalies in ${field.name} values, as outliers may indicate important issues or opportunities.`,
      field: field.name,
      confidence: 85,
      type: 'recommendation'
    })
  }
  
  // Add a recommendation about data quality if there are many rows
  if (rows.length > 50) {
    insights.push({
      title: 'Data Quality Enhancement',
      content: `With ${rows.length} records analyzed, consider implementing additional data validation rules in your cleaning pipeline to further improve data quality.`,
      confidence: 80,
      type: 'recommendation'
    })
  }
  
  // Check for geographic data and recommend visualization
  const hasGeoData = fields.some(field => 
    ['latitude', 'lat', 'longitude', 'lng', 'long'].includes(field.name.toLowerCase())
  )
  
  if (hasGeoData) {
    insights.push({
      title: 'Geographic Visualization',
      content: 'Your data contains geographic coordinates. Visualizing this data on the 3D globe would provide spatial insights and patterns.',
      confidence: 95,
      type: 'recommendation'
    })
  }
  
  return insights
}

// Helper function to calculate Pearson correlation coefficient
function calculateCorrelation(pairs: [number, number][]) {
  const n = pairs.length
  
  // Calculate sums
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  
  for (const [x, y] of pairs) {
    sumX += x
    sumY += y
    sumXY += x * y
    sumX2 += x * x
    sumY2 += y * y
  }
  
  // Calculate correlation coefficient
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  
  if (denominator === 0) return 0
  
  return numerator / denominator
} 