import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { executePipeline } from '@/app/lib/pipelineExecutor'
// Import session handling or use a mock for now
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/app/lib/auth"

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

    // Get user session - in a real app, you would use something like:
    // const session = await getServerSession(authOptions)
    // const userId = session?.user?.id
    
    // For now, we're using a mock user ID
    const userId = 'demo-user'

    // Execute the pipeline with the provided input and user information
    const result = await executePipeline(pipelineId, input, { userId })

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