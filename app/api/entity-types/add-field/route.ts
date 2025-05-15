import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

// Validation schema for adding a field to an EntityType
const fieldMapSchema = z.object({
  entityTypeId: z.string().min(1, "EntityType ID is required"),
  cleanedFieldName: z.string().min(1, "Cleaned field name is required"),
  semanticName: z.string().min(1, "Semantic name is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request body
    const validation = fieldMapSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: validation.error.format(),
      }, { status: 400 })
    }
    
    const { entityTypeId, cleanedFieldName, semanticName } = validation.data
    
    // Check if EntityType exists
    const entityType = await db.entityType.findUnique({
      where: { id: entityTypeId }
    })
    
    if (!entityType) {
      return NextResponse.json({
        success: false,
        error: 'EntityType not found'
      }, { status: 404 })
    }
    
    // Check if field mapping already exists
    const existingFieldMap = await db.entityFieldMap.findFirst({
      where: {
        entityTypeId,
        cleanedFieldName
      }
    })
    
    if (existingFieldMap) {
      return NextResponse.json({
        success: false,
        error: 'Field mapping already exists',
        details: {
          fieldMap: existingFieldMap
        }
      }, { status: 409 })
    }
    
    // Create the field mapping
    const fieldMap = await db.entityFieldMap.create({
      data: {
        entityTypeId,
        cleanedFieldName,
        semanticName
      }
    })
    
    return NextResponse.json({
      success: true,
      data: fieldMap
    })
    
  } catch (error) {
    console.error('Error adding field to EntityType:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add field to EntityType',
      message: (error as Error).message
    }, { status: 500 })
  }
} 