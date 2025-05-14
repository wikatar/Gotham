import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const execution = await db.pipelineExecution.findUnique({
      where: { id: params.id },
      include: {
        // Include related pipeline data for more context
        // This is commented out because we don't have the relation set up yet
        // pipeline: true 
      }
    })

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      status: 'ok',
      execution 
    })
  } catch (error) {
    console.error('Error fetching execution details:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch execution details',
      message: (error as Error).message
    }, { status: 500 })
  }
} 