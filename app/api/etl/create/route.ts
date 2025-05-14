import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'
import { syncService } from '@/app/lib/services/SyncService'

// Schema validation for ETL task creation
const schema = z.object({
  dataSourceId: z.string(),
  accountId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  // Sync configuration
  interval: z.number().min(1), // Interval in minutes
  cleaningPipelineId: z.string().optional(),
  config: z.object({}).passthrough() // Allow any config object
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

    const { dataSourceId, interval, cleaningPipelineId, ...rest } = parsed.data

    // Create ETL task using the SyncService
    const etlTask = await syncService.upsertSync({
      sourceId: dataSourceId,
      syncType: 'interval',
      interval,
      runPipeline: !!cleaningPipelineId,
      pipelineId: cleaningPipelineId,
      active: true,
      ...rest
    })

    return NextResponse.json({
      success: true,
      task: etlTask
    })
  } catch (error) {
    console.error('Error creating ETL task:', error)
    return NextResponse.json({ 
      error: 'Failed to create ETL task',
      message: (error as Error).message
    }, { status: 500 })
  }
} 