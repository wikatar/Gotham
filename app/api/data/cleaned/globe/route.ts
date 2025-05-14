import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  sourceId: z.string().optional(),
  pipelineId: z.string().optional(),
  limit: z.number().optional().default(500)
})

// This function converts any geo-coordinate data in the cleaned rows 
// to a format suitable for globe visualization
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

    const { sourceId, pipelineId, limit } = parsed.data

    // Build the query
    const where: any = {}
    if (sourceId) where.sourceId = sourceId
    if (pipelineId) where.pipelineId = pipelineId

    // Fetch cleaned rows
    const rows = await db.cleanedRow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        dataSource: {
          select: { name: true }
        },
        pipeline: {
          select: { name: true }
        }
      }
    })

    // Process rows to extract geographic data
    const geoPoints = rows.map(row => {
      const data = row.row as any
      
      // Try to find latitude and longitude in various common field names
      const lat = data.latitude || data.lat || data.Latitude || data.LAT 
      const lng = data.longitude || data.lng || data.Longitude || data.LONG || data.LON
      
      // If we can't find coordinates, return null
      if (!lat || !lng) return null
      
      // Convert to numbers if they're strings
      const latitude = typeof lat === 'string' ? parseFloat(lat) : lat
      const longitude = typeof lng === 'string' ? parseFloat(lng) : lng
      
      // Validate coordinates are in range
      if (isNaN(latitude) || isNaN(longitude) || 
          latitude < -90 || latitude > 90 || 
          longitude < -180 || longitude > 180) {
        return null
      }
      
      // Return a globe point with metadata
      return {
        id: row.id,
        lat: latitude,
        lng: longitude,
        value: 1, // Default value weight
        sourceName: row.dataSource.name,
        pipelineName: row.pipeline.name,
        timestamp: row.createdAt,
        data
      }
    }).filter(point => point !== null)

    return NextResponse.json({
      points: geoPoints,
      total: geoPoints.length,
      rawCount: rows.length
    })
  } catch (error) {
    console.error('Error processing cleaned data for globe:', error)
    return NextResponse.json({ 
      error: 'Failed to process cleaned data',
      message: (error as Error).message
    }, { status: 500 })
  }
} 