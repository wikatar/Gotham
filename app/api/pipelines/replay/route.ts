import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { executePipeline } from '@/app/lib/pipelineExecutor'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pipelineId, input } = body

    if (!pipelineId) {
      return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 })
    }

    const pipeline = await db.pipeline.findUnique({
      where: { id: pipelineId },
    })

    if (!pipeline) {
      return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 })
    }

    // Execute the pipeline with the provided input
    const result = await executePipeline(pipelineId, input)

    return NextResponse.json({ 
      status: 'executed', 
      result 
    })
  } catch (error) {
    console.error('Error replaying pipeline:', error)
    return NextResponse.json({ 
      error: 'Failed to replay pipeline',
      message: (error as Error).message
    }, { status: 500 })
  }
} 