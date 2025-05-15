import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

// Validation schema for creating an EntityType
const entityTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request body
    const validation = entityTypeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: validation.error.format(),
      }, { status: 400 })
    }
    
    const { name, description } = validation.data
    
    // Create the EntityType
    const entityType = await db.entityType.create({
      data: {
        name,
        description,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: entityType
    })
    
  } catch (error) {
    console.error('Error creating EntityType:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create EntityType',
      message: (error as Error).message
    }, { status: 500 })
  }
} 