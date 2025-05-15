import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get all data cleaning pipelines with their data sources
    const pipelines = await db.dataCleaningPipeline.findMany({
      include: {
        dataSource: {
          select: {
            id: true,
            name: true,
            sourceType: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    // For each pipeline, get a sample of cleaned data to extract schema
    const pipelinesWithSchemas = await Promise.all(
      pipelines.map(async (pipeline) => {
        // Get a sample row to extract schema
        const sampleRow = await db.cleanedRow.findFirst({
          where: {
            pipelineId: pipeline.id
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
        
        if (!sampleRow) {
          return {
            ...pipeline,
            schema: [],
            hasData: false
          }
        }
        
        // Extract field names and types from the sample data
        const rowData = sampleRow.row as any
        const schema = Object.entries(rowData).map(([fieldName, value]) => {
          let fieldType = 'unknown'
          
          if (typeof value === 'number') {
            fieldType = 'number'
          } else if (typeof value === 'string') {
            // Check if it's a date
            if (!isNaN(Date.parse(value as string))) {
              fieldType = 'date'
            } else {
              fieldType = 'string'
            }
          } else if (typeof value === 'boolean') {
            fieldType = 'boolean'
          } else if (Array.isArray(value)) {
            fieldType = 'array'
          } else if (typeof value === 'object' && value !== null) {
            fieldType = 'object'
          }
          
          return {
            name: fieldName,
            type: fieldType,
            sample: value
          }
        })
        
        return {
          id: pipeline.id,
          name: pipeline.name,
          dataSource: pipeline.dataSource,
          schema,
          hasData: true
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      data: pipelinesWithSchemas.filter(p => p.hasData)
    })
    
  } catch (error) {
    console.error('Error fetching cleaned data schemas:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cleaned data schemas',
      message: (error as Error).message
    }, { status: 500 })
  }
} 