import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const missionId = searchParams.get('missionId')
    const agentId = searchParams.get('agentId')
    const decisionType = searchParams.get('decisionType')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
    if (missionId) where.missionId = missionId
    if (agentId) where.agentId = agentId
    if (decisionType) where.decisionType = decisionType
    if (status) where.status = status

    const [decisions, total] = await Promise.all([
      db.decisionExplanation.findMany({
        where,
        include: {
          mission: true,
          lineage: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.decisionExplanation.count({ where })
    ])

    return NextResponse.json({
      decisions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching decisions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decisions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      decisionType,
      outcome,
      confidence,
      agentId,
      missionId,
      lineageId,
      entityType,
      entityId,
      inputData,
      reasoning,
      alternatives,
      impactLevel,
      status = 'pending'
    } = body

    // Validate required fields
    if (!title || !decisionType || !outcome || confidence === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, decisionType, outcome, confidence' },
        { status: 400 }
      )
    }

    // Validate confidence is between 0 and 1
    if (confidence < 0 || confidence > 1) {
      return NextResponse.json(
        { error: 'Confidence must be between 0 and 1' },
        { status: 400 }
      )
    }

    const decision = await db.decisionExplanation.create({
      data: {
        title,
        description,
        decisionType,
        outcome,
        confidence,
        agentId,
        missionId,
        lineageId,
        entityType,
        entityId,
        inputData: typeof inputData === 'string' ? inputData : JSON.stringify(inputData),
        reasoning,
        alternatives: typeof alternatives === 'string' ? alternatives : JSON.stringify(alternatives),
        impactLevel,
        status,
      },
      include: {
        mission: true,
        lineage: true,
      },
    })

    return NextResponse.json(decision, { status: 201 })
  } catch (error) {
    console.error('Error creating decision:', error)
    return NextResponse.json(
      { error: 'Failed to create decision' },
      { status: 500 }
    )
  }
} 