import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// Sample incidents for development when database is not available
const getSampleIncidents = () => [
  {
    id: 'sample-1',
    title: 'Anomali i kunddatabase',
    description: 'Abnormalt höga värden upptäckta i sektor APAC',
    sourceType: 'anomaly',
    sourceId: 'anomaly-1',
    missionId: null,
    status: 'open',
    severity: 'high',
    tags: 'churn,APAC,customer-risk',
    createdBy: 'system',
    readToken: nanoid(),
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    mission: null,
    anomaly: null
  },
  {
    id: 'sample-2',
    title: 'Agent misslyckades med notifiering',
    description: 'Slack-agent kunde inte skicka varning till #alerts kanalen',
    sourceType: 'agent',
    sourceId: 'agent-1',
    missionId: 'mission-1',
    status: 'investigating',
    severity: 'medium',
    tags: 'slack,notification,alert',
    createdBy: 'alice@gotham.se',
    readToken: nanoid(),
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-15T09:20:00Z'),
    mission: null,
    anomaly: null
  },
  {
    id: 'sample-3',
    title: 'Kritisk dataförlust upptäckt',
    description: 'Manuellt rapporterad incident gällande förlorade transaktionsdata',
    sourceType: 'manual',
    sourceId: null,
    missionId: 'mission-2',
    status: 'resolved',
    severity: 'critical',
    tags: 'data-loss,transaction,backup',
    createdBy: 'bob@gotham.se',
    readToken: nanoid(),
    createdAt: new Date('2024-01-13T08:15:00Z'),
    updatedAt: new Date('2024-01-14T17:30:00Z'),
    mission: null,
    anomaly: null
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const severity = searchParams.get('severity')
    const sourceType = searchParams.get('sourceType')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')

    try {
      const whereConditions: any = {}

      if (status) {
        whereConditions.status = status
      }

      if (severity) {
        whereConditions.severity = severity
      }

      if (sourceType) {
        whereConditions.sourceType = sourceType
      }

      if (search) {
        whereConditions.OR = [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      }

      if (tags) {
        whereConditions.tags = { contains: tags }
      }

      const incidents = await prisma.incidentReport.findMany({
        where: whereConditions,
        include: {
          mission: true,
          anomaly: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json(incidents)
    } catch (dbError) {
      console.error('Database error, returning sample data:', dbError)
      
      if (process.env.NODE_ENV === 'development') {
        let sampleIncidents = getSampleIncidents()

        // Apply filters to sample data
        if (status) {
          sampleIncidents = sampleIncidents.filter(i => i.status === status)
        }
        if (severity) {
          sampleIncidents = sampleIncidents.filter(i => i.severity === severity)
        }
        if (sourceType) {
          sampleIncidents = sampleIncidents.filter(i => i.sourceType === sourceType)
        }
        if (search) {
          sampleIncidents = sampleIncidents.filter(i => 
            i.title.toLowerCase().includes(search.toLowerCase()) ||
            i.description.toLowerCase().includes(search.toLowerCase())
          )
        }
        if (tags) {
          sampleIncidents = sampleIncidents.filter(i => 
            i.tags.includes(tags)
          )
        }

        return NextResponse.json(sampleIncidents)
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 