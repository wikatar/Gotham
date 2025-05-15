import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

// Validation schema for adding a relation between EntityTypes
const relationSchema = z.object({
  fromEntityTypeId: z.string().min(1, "Source EntityType ID is required"),
  toEntityTypeId: z.string().min(1, "Target EntityType ID is required"),
  relationType: z.enum(['hasMany', 'hasOne', 'belongsTo'], {
    errorMap: () => ({ message: "Relation type must be one of: hasMany, hasOne, belongsTo" })
  }),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request body
    const validation = relationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: validation.error.format(),
      }, { status: 400 })
    }
    
    const { fromEntityTypeId, toEntityTypeId, relationType, description } = validation.data
    
    // Check if source EntityType exists
    const sourceEntityType = await db.entityType.findUnique({
      where: { id: fromEntityTypeId }
    })
    
    if (!sourceEntityType) {
      return NextResponse.json({
        success: false,
        error: 'Source EntityType not found'
      }, { status: 404 })
    }
    
    // Check if target EntityType exists
    const targetEntityType = await db.entityType.findUnique({
      where: { id: toEntityTypeId }
    })
    
    if (!targetEntityType) {
      return NextResponse.json({
        success: false,
        error: 'Target EntityType not found'
      }, { status: 404 })
    }
    
    // Check if the same relation already exists
    const existingRelation = await db.entityRelation.findFirst({
      where: {
        fromEntityTypeId,
        toEntityTypeId,
        relationType
      }
    })
    
    if (existingRelation) {
      return NextResponse.json({
        success: false,
        error: 'Relation already exists',
        details: {
          relation: existingRelation
        }
      }, { status: 409 })
    }
    
    // Create the relation
    const relation = await db.entityRelation.create({
      data: {
        fromEntityTypeId,
        toEntityTypeId,
        relationType,
        description
      }
    })
    
    return NextResponse.json({
      success: true,
      data: relation
    })
    
  } catch (error) {
    console.error('Error adding relation between EntityTypes:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add relation',
      message: (error as Error).message
    }, { status: 500 })
  }
} 