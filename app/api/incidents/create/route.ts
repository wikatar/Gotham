import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// Graceful error handling - if DB is not available, use sample data
const handleDatabaseError = (error: any) => {
  console.error('Database error:', error)
  
  // Return sample data if in development mode
  if (process.env.NODE_ENV === 'development') {
    return {
      id: nanoid(),
      title: "Sample Incident",
      description: "This is sample data - database is not connected",
      sourceType: "manual",
      sourceId: null,
      missionId: null,
      status: "open",
      severity: "medium",
      tags: "sample,development",
      createdBy: "system",
      readToken: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  throw error
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      sourceType,
      sourceId,
      missionId,
      severity,
      tags,
      createdBy
    } = body

    // Generate a unique read token for public sharing
    const readToken = nanoid()

    try {
      const incident = await prisma.incidentReport.create({
        data: {
          title,
          description,
          sourceType,
          sourceId,
          missionId,
          status: 'open', // Default status
          severity,
          tags: Array.isArray(tags) ? tags.join(',') : tags,
          createdBy,
          readToken,
        },
        include: {
          mission: true,
          anomaly: true,
        },
      })

      return NextResponse.json(incident)
    } catch (dbError) {
      const sampleIncident = handleDatabaseError(dbError)
      return NextResponse.json(sampleIncident)
    }
  } catch (error) {
    console.error('Error creating incident:', error)
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 