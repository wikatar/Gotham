import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, severity, title, description, tags } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'Incident ID is required' 
      }, { status: 400 })
    }

    try {
      const updateData: any = {
        updatedAt: new Date()
      }

      if (status !== undefined) updateData.status = status
      if (severity !== undefined) updateData.severity = severity
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (tags !== undefined) {
        updateData.tags = Array.isArray(tags) ? tags.join(',') : tags
      }

      const incident = await prisma.incidentReport.update({
        where: { id },
        data: updateData,
        include: {
          mission: true,
          anomaly: true,
        },
      })

      return NextResponse.json(incident)
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      
      if (process.env.NODE_ENV === 'development') {
        // Return sample updated incident in development mode
        return NextResponse.json({
          id,
          title: title || 'Updated Sample Incident',
          description: description || 'This incident has been updated in development mode',
          sourceType: 'manual',
          sourceId: null,
          missionId: null,
          status: status || 'investigating',
          severity: severity || 'medium',
          tags: Array.isArray(tags) ? tags.join(',') : tags || 'sample,updated',
          createdBy: 'system',
          readToken: nanoid(),
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          updatedAt: new Date(),
          mission: null,
          anomaly: null
        })
      }
      
      if (dbError.code === 'P2025') {
        return NextResponse.json({ 
          error: 'Incident not found' 
        }, { status: 404 })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error('Error updating incident:', error)
    return NextResponse.json({ 
      error: 'Failed to update incident' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 