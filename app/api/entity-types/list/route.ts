import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get all EntityTypes with their fields and relations
    const entityTypes = await db.entityType.findMany({
      include: {
        fieldMaps: true,
        sourceRelations: {
          include: {
            toEntityType: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        targetRelations: {
          include: {
            fromEntityType: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    // Transform the data to make it more frontend-friendly
    const formattedEntityTypes = entityTypes.map(entityType => {
      // Combine source and target relations into a single array
      const outgoingRelations = entityType.sourceRelations.map(relation => ({
        id: relation.id,
        type: relation.relationType,
        direction: 'outgoing',
        description: relation.description,
        targetEntity: relation.toEntityType,
        createdAt: relation.createdAt
      }))
      
      const incomingRelations = entityType.targetRelations.map(relation => ({
        id: relation.id,
        type: relation.relationType,
        direction: 'incoming',
        description: relation.description,
        sourceEntity: relation.fromEntityType,
        createdAt: relation.createdAt
      }))
      
      return {
        id: entityType.id,
        name: entityType.name,
        description: entityType.description,
        fields: entityType.fieldMaps,
        relations: [...outgoingRelations, ...incomingRelations],
        createdAt: entityType.createdAt,
        updatedAt: entityType.updatedAt
      }
    })
    
    return NextResponse.json({
      success: true,
      data: formattedEntityTypes
    })
    
  } catch (error) {
    console.error('Error listing EntityTypes:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to list EntityTypes',
      message: (error as Error).message
    }, { status: 500 })
  }
} 