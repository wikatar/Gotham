import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  sourceId: z.string(),
  name: z.string(),
  steps: z.array(z.any()),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 })
    }

    const { sourceId, name, steps } = parsed.data

    const saved = await db.dataCleaningPipeline.create({
      data: {
        sourceId,
        name,
        steps,
      },
    })

    // Log the pipeline creation
    await db.log.create({
      data: {
        accountId: 'demo-account', // TODO: Replace with actual account ID
        type: 'cleaning_pipeline_creation',
        action: `Created cleaning pipeline: ${name}`,
        resourceId: saved.id,
        resourceType: 'dataCleaningPipeline',
        metadata: {
          sourceId,
          stepCount: steps.length
        }
      }
    })

    return NextResponse.json({ 
      id: saved.id,
      name: saved.name,
      createdAt: saved.createdAt
    })
  } catch (error) {
    console.error('Error creating cleaning pipeline:', error)
    return NextResponse.json({ 
      error: 'Failed to create cleaning pipeline',
      message: (error as Error).message
    }, { status: 500 })
  }
} 