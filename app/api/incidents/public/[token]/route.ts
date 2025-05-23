import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// Sample incident for public viewing
const getSamplePublicIncident = (token: string) => ({
  id: 'sample-public',
  title: 'Sample Public Incident',
  description: 'Detta är en publik vy av en incident för demonstration. SQLite-databasen borde nu fungera.',
  sourceType: 'manual',
  sourceId: null,
  missionId: null,
  status: 'investigating',
  severity: 'medium',
  tags: 'sample,public,development',
  createdBy: 'system',
  readToken: token,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
  mission: null,
  anomaly: null
})

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    try {
      const incident = await prisma.incidentReport.findUnique({
        where: { readToken: token },
        include: {
          mission: true,
          anomaly: true,
        },
      })

      if (!incident) {
        return NextResponse.json(
          { error: 'Incident not found or token invalid' },
          { status: 404 }
        )
      }

      return NextResponse.json(incident)
    } catch (dbError) {
      console.error('Database error, returning sample data:', dbError)
      
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(getSamplePublicIncident(token))
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error fetching public incident:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 