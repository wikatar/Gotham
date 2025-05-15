import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

// Validation schema for deleting an EntityType
const deleteSchema = z.object({
  id: z.string().min(1, "EntityType ID is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request body
    const validation = deleteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: validation.error.format(),
      }, { status: 400 })
    }
    
    const { id } = validation.data
    
    // Check if EntityType exists
    const entityType = await db.entityType.findUnique({
      where: { id },
      include: {
        fieldMaps: true,
        sourceRelations: true,
        targetRelations: true
      }
    })
    
    if (!entityType) {
      return NextResponse.json({
        success: false,
        error: 'EntityType not found'
      }, { status: 404 })
    }
    
    // Start a transaction to delete the EntityType and all related data
    const result = await db.$transaction(async (tx) => {
      // Delete all field mappings first
      if (entityType.fieldMaps.length > 0) {
        await tx.entityFieldMap.deleteMany({
          where: { entityTypeId: id }
        })
      }
      
      // Delete all source relations
      if (entityType.sourceRelations.length > 0) {
        await tx.entityRelation.deleteMany({
          where: { fromEntityTypeId: id }
        })
      }
      
      // Delete all target relations
      if (entityType.targetRelations.length > 0) {
        await tx.entityRelation.deleteMany({
          where: { toEntityTypeId: id }
        })
      }
      
      // Finally, delete the EntityType itself
      const deletedEntityType = await tx.entityType.delete({
        where: { id }
      })
      
      return {
        entityType: deletedEntityType,
        fieldCount: entityType.fieldMaps.length,
        relationCount: entityType.sourceRelations.length + entityType.targetRelations.length
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        deletedEntityType: result.entityType,
        deletedFieldCount: result.fieldCount,
        deletedRelationCount: result.relationCount
      }
    })
    
  } catch (error) {
    console.error('Error deleting EntityType:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete EntityType',
      message: (error as Error).message
    }, { status: 500 })
  }
} 