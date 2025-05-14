// /api/pipeline/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PipelineSchema } from './schema'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = PipelineSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const pipeline = parsed.data

  // Log the pipeline creation
  const saved = await prisma.log.create({
    data: {
      type: 'pipeline_created',
      action: `Pipeline "${pipeline.name}" saved`,
      accountId: pipeline.missionId.split('-')[0], // Simplified - in real implementation, get from auth
      resourceType: 'pipeline',
      resourceId: pipeline.id,
      metadata: pipeline,
    },
  })

  return NextResponse.json({ 
    status: 'ok', 
    pipeline: {
      id: pipeline.id,
      name: pipeline.name,
      missionId: pipeline.missionId
    } 
  })
} 