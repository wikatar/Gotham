import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// Sample incident for development
const getSampleIncident = (id: string) => ({
  id,
  title: 'Sample Incident - Database Not Connected',
  description: 'Detta är testdata eftersom databasen inte är ansluten. SQLite-databasen borde nu fungera.',
  sourceType: 'manual',
  sourceId: null,
  missionId: null,
  status: 'open',
  severity: 'medium',
  tags: 'sample,development',
  createdBy: 'system',
  readToken: nanoid(),
  createdAt: new Date(),
  updatedAt: new Date(),
  mission: null,
  anomaly: null
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    try {
      const incident = await prisma.incidentReport.findUnique({
        where: { id },
        include: {
          mission: true,
          anomaly: true,
        },
      })

      if (!incident) {
        return NextResponse.json({ 
          error: 'Incident not found' 
        }, { status: 404 })
      }

      return NextResponse.json(incident)
    } catch (dbError) {
      console.error('Database error, returning sample data:', dbError)
      
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(getSampleIncident(id))
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error fetching incident:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch incident' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 