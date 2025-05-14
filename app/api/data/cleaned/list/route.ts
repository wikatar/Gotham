import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  sourceId: z.string(),
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

    const { sourceId, pipelineId } = parsed.data

    // Fetch cleaned rows for this source and pipeline
    const rows = await db.cleanedRow.findMany({
      where: { 
        sourceId,
        pipelineId 
      },
      orderBy: { createdAt: 'asc' },
      take: 1000, // Limit to 1000 rows for performance
    })

    // Fetch info about the pipeline and source
    const pipeline = await db.dataCleaningPipeline.findUnique({
      where: { id: pipelineId },
      select: { name: true }
    })

    const source = await db.dataSource.findUnique({
      where: { id: sourceId },
      select: { name: true }
    })

    return NextResponse.json({ 
      rows,
      pipelineName: pipeline?.name,
      sourceName: source?.name,
      count: rows.length
    })
  } catch (error) {
    console.error('Error fetching cleaned rows:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch cleaned rows',
      message: (error as Error).message
    }, { status: 500 })
  }
} 