import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entityId = searchParams.get('entityId')
    const pipelineId = searchParams.get('pipelineId')
    const timeRange = searchParams.get('timeRange') || '7d' // 7d, 30d, 90d

    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate
      }
    }
    if (entityId) where.entityId = entityId
    if (pipelineId) where.pipelineId = pipelineId

    // Get basic counts
    const [
      totalSteps,
      uniquePipelines,
      uniqueSources,
      uniqueAgents,
      successSteps,
      failedSteps,
      lastActivity
    ] = await Promise.all([
      // Total steps
      db.lineageLog.count({ where }),
      
      // Unique pipelines
      db.lineageLog.findMany({
        where,
        select: { pipelineId: true },
        distinct: ['pipelineId']
      }),
      
      // Unique sources
      db.lineageLog.findMany({
        where,
        select: { source: true },
        distinct: ['source']
      }),
      
      // Unique agents
      db.lineageLog.findMany({
        where,
        select: { agentId: true },
        distinct: ['agentId']
      }),
      
      // Success steps
      db.lineageLog.count({
        where: {
          ...where,
          OR: [
            { step: { contains: 'success' } },
            { step: { contains: 'complete' } },
            { step: { contains: 'finished' } }
          ]
        }
      }),
      
      // Failed steps
      db.lineageLog.count({
        where: {
          ...where,
          OR: [
            { step: { contains: 'failed' } },
            { step: { contains: 'error' } },
            { step: { contains: 'exception' } }
          ]
        }
      }),
      
      // Last activity
      db.lineageLog.findFirst({
        where,
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ])

    // Calculate success rate
    const successRate = totalSteps > 0 ? (successSteps / totalSteps) * 100 : 0

    // Get step type distribution
    const stepTypes = await db.lineageLog.groupBy({
      by: ['step'],
      where,
      _count: {
        step: true
      },
      orderBy: {
        _count: {
          step: 'desc'
        }
      },
      take: 10
    })

    // Get daily activity for the time range
    const dailyActivity = await db.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM lineage_logs 
      WHERE createdAt >= ${startDate}
        ${entityId ? `AND entityId = ${entityId}` : ''}
        ${pipelineId ? `AND pipelineId = ${pipelineId}` : ''}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    ` as Array<{ date: string; count: number }>

    // Get source distribution
    const sourceDistribution = await db.lineageLog.groupBy({
      by: ['source'],
      where,
      _count: {
        source: true
      },
      orderBy: {
        _count: {
          source: 'desc'
        }
      }
    })

    // Get pipeline performance
    const pipelinePerformance = await db.lineageLog.groupBy({
      by: ['pipelineId'],
      where,
      _count: {
        pipelineId: true
      },
      orderBy: {
        _count: {
          pipelineId: 'desc'
        }
      },
      take: 10
    })

    const stats = {
      totalSteps,
      pipelineCount: uniquePipelines.filter(p => p.pipelineId).length,
      sourceCount: uniqueSources.filter(s => s.source).length,
      agentCount: uniqueAgents.filter(a => a.agentId).length,
      successRate: Math.round(successRate * 100) / 100,
      successSteps,
      failedSteps,
      lastActivity: lastActivity?.createdAt || null,
      timeRange,
      
      // Detailed analytics
      stepTypes: stepTypes.map(st => ({
        step: st.step,
        count: st._count.step
      })),
      
      dailyActivity: dailyActivity.map(da => ({
        date: da.date,
        count: Number(da.count)
      })),
      
      sourceDistribution: sourceDistribution.map(sd => ({
        source: sd.source || 'Unknown',
        count: sd._count.source
      })),
      
      pipelinePerformance: pipelinePerformance.map(pp => ({
        pipelineId: pp.pipelineId || 'Unknown',
        count: pp._count.pipelineId
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching lineage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lineage statistics' },
      { status: 500 }
    )
  }
} 