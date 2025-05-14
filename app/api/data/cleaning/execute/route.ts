import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  sourceId: z.string(),
  pipelineId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: parsed.error.format() 
      }, { status: 400 })
    }

    const { sourceId, pipelineId } = parsed.data

    // Fetch the pipeline to get its steps
    const pipeline = await db.dataCleaningPipeline.findUnique({ 
      where: { id: pipelineId } 
    })

    if (!pipeline) {
      return NextResponse.json({ 
        error: 'Pipeline not found' 
      }, { status: 404 })
    }

    // Fetch the data rows for this source
    const rows = await db.dataRow.findMany({ 
      where: { sourceId } 
    })

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: 'No data rows found for this source' 
      }, { status: 404 })
    }

    // Apply the cleaning steps to each row
    const cleaned = rows
      .map(r => apply(r.row, pipeline.steps))
      .filter(r => r !== null)

    if (cleaned.length === 0) {
      return NextResponse.json({ 
        error: 'No rows remaining after cleaning' 
      }, { status: 400 })
    }

    // Delete existing cleaned rows for this source/pipeline combination
    await db.cleanedRow.deleteMany({
      where: {
        sourceId,
        pipelineId,
      }
    })

    // Save the cleaned rows
    await db.cleanedRow.createMany({
      data: cleaned.map(row => ({
        sourceId,
        pipelineId,
        row,
      })),
    })

    // Log the execution
    await db.log.create({
      data: {
        accountId: 'demo-account', // TODO: Replace with actual account ID
        type: 'cleaning_pipeline_execution',
        action: `Executed cleaning pipeline: ${pipeline.name}`,
        resourceId: pipeline.id,
        resourceType: 'dataCleaningPipeline',
        metadata: {
          sourceId,
          pipelineId,
          inputRowCount: rows.length,
          outputRowCount: cleaned.length
        }
      }
    })

    return NextResponse.json({ 
      saved: cleaned.length,
      original: rows.length
    })
  } catch (error) {
    console.error('Error executing cleaning pipeline:', error)
    return NextResponse.json({ 
      error: 'Failed to execute cleaning pipeline',
      message: (error as Error).message
    }, { status: 500 })
  }
}

// Utility function to apply cleaning steps to a row
function apply(row: any, steps: any[]): any | null {
  let result = { ...row }
  for (const step of steps) {
    if (step.type === 'trim') {
      result[step.column] = result[step.column]?.trim?.()
    } else if (step.type === 'lowercase') {
      result[step.column] = result[step.column]?.toLowerCase?.()
    } else if (step.type === 'dropNulls' && (result[step.column] == null || result[step.column] === '')) {
      return null
    } else if (step.type === 'rename') {
      result[step.to] = result[step.from]
      delete result[step.from]
    }
  }
  return result
} 