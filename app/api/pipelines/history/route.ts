import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pipelineId = searchParams.get('pipelineId')
    const accountId = searchParams.get('accountId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    
    // Build the where clause based on provided parameters
    const whereClause: any = {}
    
    if (pipelineId) {
      whereClause.pipelineId = pipelineId
    }
    
    if (accountId) {
      whereClause.accountId = accountId
    }
    
    // Get executions with filtering
    const executions = await db.pipelineExecution.findMany({
      where: whereClause,
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