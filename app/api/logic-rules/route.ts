import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (isActive !== null) where.isActive = isActive === 'true'

    const [rules, total] = await Promise.all([
      db.logicRule.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.logicRule.count({ where })
    ])

    // Parse JSON strings back to objects for easier frontend consumption
    const rulesWithParsedJson = rules.map(rule => ({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions)
    }))

    return NextResponse.json({
      rules: rulesWithParsedJson,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching logic rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logic rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      entityType,
      entityId,
      conditions,
      actions,
      logicType = 'AND',
      isActive = true,
      priority = 0,
      createdBy
    } = body

    // Validate required fields
    if (!name || !conditions || !actions) {
      return NextResponse.json(
        { error: 'Missing required fields: name, conditions, actions' },
        { status: 400 }
      )
    }

    // Validate conditions array
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return NextResponse.json(
        { error: 'Conditions must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate actions array
    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: 'Actions must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate each condition has required fields
    for (const condition of conditions) {
      if (!condition.field || !condition.operator || condition.value === undefined) {
        return NextResponse.json(
          { error: 'Each condition must have field, operator, and value' },
          { status: 400 }
        )
      }
    }

    // Validate each action has required fields
    for (const action of actions) {
      if (!action.type) {
        return NextResponse.json(
          { error: 'Each action must have a type' },
          { status: 400 }
        )
      }
    }

    const rule = await db.logicRule.create({
      data: {
        name,
        description,
        entityType,
        entityId,
        conditions: JSON.stringify(conditions),
        actions: JSON.stringify(actions),
        logicType,
        isActive,
        priority,
        createdBy,
      },
    })

    // Return with parsed JSON for consistency
    return NextResponse.json({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions)
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating logic rule:', error)
    return NextResponse.json(
      { error: 'Failed to create logic rule' },
      { status: 500 }
    )
  }
} 