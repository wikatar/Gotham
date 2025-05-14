// /api/pipelines/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, missionId, description, nodes, edges } = body

    if (!id || !name || !missionId || !nodes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const pipeline = await prisma.pipeline.create({
      data: {
        id,
        name,
        missionId,
        description: description ?? '',
        nodes: nodes,
        edges: edges || [],
        accountId: 'demo-account', // TODO: koppla till inloggad användare
      },
    })

    // Log the pipeline creation
    await prisma.log.create({
      data: {
        accountId: pipeline.accountId,
        type: 'pipeline_created',
        action: `Pipeline "${name}" created`,
        resourceId: id,
        resourceType: 'pipeline',
        metadata: {
          missionId,
          nodeCount: nodes.length,
          edgeCount: edges?.length || 0
        }
      }
    })

    return NextResponse.json({ status: 'ok', pipeline })
  } catch (error) {
    console.error('Error creating pipeline:', error)
    return NextResponse.json({ 
      error: 'Failed to create pipeline',
      message: (error as Error).message
    }, { status: 500 })
  }
}

// Get all pipelines for a mission
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const missionId = searchParams.get('missionId')
    const accountId = searchParams.get('accountId')
    const category = searchParams.get('category')

    if (!missionId || !accountId) {
      return NextResponse.json({ error: 'missionId and accountId are required' }, { status: 400 })
    }

    const whereClause: any = {
      missionId,
      accountId
    }

    if (category) {
      whereClause.category = category
    }

    const pipelines = await prisma.pipeline.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ status: 'ok', pipelines })
  } catch (error) {
    console.error('Error fetching pipelines:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch pipelines',
      message: (error as Error).message
    }, { status: 500 })
  }
} 