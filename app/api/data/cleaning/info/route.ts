import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  pipelineId: z.string(),
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

    const { pipelineId } = parsed.data

    // Fetch the pipeline information
    const pipeline = await db.dataCleaningPipeline.findUnique({
      where: { id: pipelineId },
    })

    if (!pipeline) {
      return NextResponse.json({ 
        error: 'Pipeline not found' 
      }, { status: 404 })
    }

    // Count the cleaned rows for this pipeline
    const cleanedRowCount = await db.cleanedRow.count({
      where: { pipelineId }
    })

    return NextResponse.json({ 
      pipeline: {
        ...pipeline,
        cleanedRowCount
      }
    })
  } catch (error) {
    console.error('Error fetching pipeline information:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch pipeline information',
      message: (error as Error).message
    }, { status: 500 })
  }
} 