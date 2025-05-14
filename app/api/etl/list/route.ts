import { NextRequest, NextResponse } from 'next/server'
import { syncService } from '@/app/lib/services/SyncService'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const accountId = url.searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ 
        error: 'Account ID is required'
      }, { status: 400 })
    }

    // Get all ETL tasks using the SyncService
    const tasks = await syncService.getAllSyncs(accountId)

    // Map to a more friendly format for the frontend
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      name: task.name,
      description: task.description || '',
      dataSourceId: task.sourceId,
      dataSourceName: task.dataSource?.name || 'Unknown',
      interval: task.syncType === 'interval' ? task.interval : null,
      cron: task.syncType === 'cron' ? task.cron : null,
      syncType: task.syncType,
      isActive: task.active,
      lastRunAt: task.lastSyncAt,
      nextRunAt: task.nextSyncAt,
      runCleaningPipeline: task.runPipeline,
      cleaningPipelineId: task.pipelineId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }))

    return NextResponse.json({
      success: true,
      tasks: formattedTasks
    })
  } catch (error) {
    console.error('Error listing ETL tasks:', error)
    return NextResponse.json({ 
      error: 'Failed to list ETL tasks',
      message: (error as Error).message
    }, { status: 500 })
  }
} 