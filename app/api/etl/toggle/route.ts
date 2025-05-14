import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { syncService } from '@/app/lib/services/SyncService'

// Schema validation for ETL task toggling
const schema = z.object({
  id: z.string(),
  isActive: z.boolean()
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

    const { id, isActive } = parsed.data

    // Toggle ETL task active state using the SyncService
    const updatedTask = await syncService.toggleSyncActive(id, isActive)

    return NextResponse.json({
      success: true,
      task: updatedTask
    })
  } catch (error) {
    console.error('Error toggling ETL task:', error)
    return NextResponse.json({ 
      error: 'Failed to toggle ETL task',
      message: (error as Error).message
    }, { status: 500 })
  }
} 