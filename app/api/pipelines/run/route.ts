import { NextRequest, NextResponse } from 'next/server'
import { executePipeline } from '@/app/lib/pipelineExecutor'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pipelineId, input } = body

    if (!pipelineId) {
      return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 })
    }

    // Execute the pipeline
    const result = await executePipeline(pipelineId, input || {})

    return NextResponse.json({ 
      status: 'ok',
      result 
    })
  } catch (error) {
    console.error('Error executing pipeline:', error)
    return NextResponse.json({ 
      error: 'Failed to execute pipeline',
      message: (error as Error).message
    }, { status: 500 })
  }
} 