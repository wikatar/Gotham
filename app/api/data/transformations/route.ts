/**
 * API endpoint for saving data transformation pipelines
 * Stores the cleaning steps that can be applied to data sources
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

// Define schema for cleaning steps
const cleaningStepSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('trim'),
    column: z.string(),
  }),
  z.object({
    type: z.literal('lowercase'),
    column: z.string(),
  }),
  z.object({
    type: z.literal('dropNulls'),
    column: z.string(),
  }),
  z.object({
    type: z.literal('rename'),
    from: z.string(),
    to: z.string(),
  }),
])

// Schema for the request body
const pipelineSchema = z.object({
  sourceId: z.string(),
  steps: z.array(cleaningStepSchema),
  name: z.string(),
  accountId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parse = pipelineSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid pipeline data',
        details: parse.error.format()
      }, { status: 400 })
    }

    const { sourceId, steps, name } = parse.data
    const accountId = parse.data.accountId || 'demo-account' // TODO: replace with auth context

    // Create a new pipeline in the database
    const pipeline = await db.pipeline.create({
      data: {
        name,
        accountId,
        missionId: 'data-cleaning', // Use a fixed mission ID for data cleaning pipelines
        nodes: {
          // Define nodes for data transformation
          input: {
            id: 'input',
            type: 'dataSource',
            data: { sourceId }
          },
          transform: {
            id: 'transform',
            type: 'dataTransform',
            data: { steps }
          },
          output: {
            id: 'output',
            type: 'dataOutput',
            data: { name: `Cleaned_${sourceId}` }
          }
        },
        edges: [
          { source: 'input', target: 'transform' },
          { source: 'transform', target: 'output' }
        ],
      },
    })

    // Log the pipeline creation
    await db.log.create({
      data: {
        accountId,
        type: 'pipeline_creation',
        action: `Created data cleaning pipeline: ${name}`,
        resourceId: pipeline.id,
        resourceType: 'pipeline',
        metadata: {
          sourceId,
          stepCount: steps.length
        }
      }
    })

    return NextResponse.json({ 
      status: 'ok', 
      id: pipeline.id,
      name: pipeline.name,
      steps: steps.length
    })
  } catch (error) {
    console.error('Error saving pipeline:', error)
    return NextResponse.json({ 
      error: 'Failed to save pipeline',
      message: (error as Error).message
    }, { status: 500 })
  }
} 