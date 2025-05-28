import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entityId = searchParams.get('entityId')
    const pipelineId = searchParams.get('pipelineId')
    const agentId = searchParams.get('agentId')
    const source = searchParams.get('source')
    const step = searchParams.get('step')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}
    if (entityId) where.entityId = entityId
    if (pipelineId) where.pipelineId = pipelineId
    if (agentId) where.agentId = agentId
    if (source) where.source = source
    if (step) where.step = { contains: step }

    // Get total count for pagination
    const totalCount = await db.lineageLog.count({ where })

    // Fetch lineage logs with pagination
    const steps = await db.lineageLog.findMany({
      where,
      include: {
        entity: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      },
      take: limit,
      skip: offset
    })

    const hasMore = offset + limit < totalCount

    return NextResponse.json({
      steps,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore
      }
    })
  } catch (error) {
    console.error('Error fetching lineage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lineage data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      entityId,
      pipelineId,
      agentId,
      input,
      output,
      step,
      source = 'API'
    } = body

    // Validate required fields
    if (!input || !output || !step) {
      return NextResponse.json(
        { error: 'Missing required fields: input, output, step' },
        { status: 400 }
      )
    }

    // Serialize input and output to JSON strings
    const inputJson = typeof input === 'string' ? input : JSON.stringify(input)
    const outputJson = typeof output === 'string' ? output : JSON.stringify(output)

    // Create lineage log entry
    const lineageLog = await db.lineageLog.create({
      data: {
        entityId,
        pipelineId,
        agentId,
        input: inputJson,
        output: outputJson,
        step,
        source
      },
      include: {
        entity: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      lineageLog
    })
  } catch (error) {
    console.error('Error creating lineage log:', error)
    return NextResponse.json(
      { error: 'Failed to create lineage log' },
      { status: 500 }
    )
  }
} 