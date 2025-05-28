import { NextRequest, NextResponse } from 'next/server'
import { db } from '../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rule = await db.logicRule.findUnique({
      where: { id: params.id }
    })

    if (!rule) {
      return NextResponse.json(
        { error: 'Logic rule not found' },
        { status: 404 }
      )
    }

    // Parse JSON strings back to objects
    return NextResponse.json({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions)
    })
  } catch (error) {
    console.error('Error fetching logic rule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logic rule' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      entityType,
      entityId,
      conditions,
      actions,
      logicType,
      isActive,
      priority
    } = body

    // Validate required fields if provided
    if (conditions && (!Array.isArray(conditions) || conditions.length === 0)) {
      return NextResponse.json(
        { error: 'Conditions must be a non-empty array' },
        { status: 400 }
      )
    }

    if (actions && (!Array.isArray(actions) || actions.length === 0)) {
      return NextResponse.json(
        { error: 'Actions must be a non-empty array' },
        { status: 400 }
      )
    }

    // Build update data object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (entityType !== undefined) updateData.entityType = entityType
    if (entityId !== undefined) updateData.entityId = entityId
    if (conditions !== undefined) updateData.conditions = JSON.stringify(conditions)
    if (actions !== undefined) updateData.actions = JSON.stringify(actions)
    if (logicType !== undefined) updateData.logicType = logicType
    if (isActive !== undefined) updateData.isActive = isActive
    if (priority !== undefined) updateData.priority = priority

    const rule = await db.logicRule.update({
      where: { id: params.id },
      data: updateData,
    })

    // Return with parsed JSON for consistency
    return NextResponse.json({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions)
    })
  } catch (error) {
    console.error('Error updating logic rule:', error)
    return NextResponse.json(
      { error: 'Failed to update logic rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.logicRule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting logic rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete logic rule' },
      { status: 500 }
    )
  }
} 