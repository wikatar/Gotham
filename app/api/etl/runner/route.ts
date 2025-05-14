import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { etlRunner } from '@/app/lib/etl/runner'

// Schema validation
const schema = z.object({
  action: z.enum(['start', 'stop', 'status']),
  intervalMs: z.number().min(1000).optional() // Optional interval in milliseconds (minimum 1 second)
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

    const { action, intervalMs } = parsed.data

    switch (action) {
      case 'start':
        etlRunner.start(intervalMs);
        return NextResponse.json({
          success: true,
          message: `ETL Runner started${intervalMs ? ` with ${intervalMs}ms interval` : ''}`
        });
        
      case 'stop':
        etlRunner.stop();
        return NextResponse.json({
          success: true,
          message: 'ETL Runner stopped'
        });
        
      case 'status':
        // For now, we don't have a proper status check, so we'll just return success
        return NextResponse.json({
          success: true,
          running: !!etlRunner['intervalId'] // Access the private property for status
        });
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error controlling ETL runner:', error)
    return NextResponse.json({ 
      error: 'Failed to control ETL runner',
      message: (error as Error).message
    }, { status: 500 })
  }
} 