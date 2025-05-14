import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pipelineId = searchParams.get('pipelineId')
    const accountId = searchParams.get('accountId')
    const userId = searchParams.get('userId')
    const missionId = searchParams.get('missionId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    
    // Build the where clause based on provided parameters
    const whereClause: any = {}
    
    if (pipelineId) {
      whereClause.pipelineId = pipelineId
    }
    
    if (accountId) {
      whereClause.accountId = accountId
    }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    // If missionId is provided, we need to filter by pipelines in that mission
    if (missionId) {
      whereClause.pipeline = {
        missionId
      }
    }
    
    // Get executions with filtering, including related pipeline and user
    const executions = await db.pipelineExecution.findMany({
      where: whereClause,
      include: {
        pipeline: {
          select: {
            name: true,
            missionId: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ 
      status: 'ok',
      executions 
    })
  } catch (error) {
    console.error('Error fetching pipeline execution history:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch pipeline execution history',
      message: (error as Error).message
    }, { status: 500 })
  }
} 