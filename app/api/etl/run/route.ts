import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { etlService } from '@/app/lib/services/ETLService'

// Schema validation
const schema = z.object({
  taskId: z.string()
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

    const { taskId } = parsed.data

    // Run the ETL task
    const result = await etlService.runETLForTask(taskId)

    return NextResponse.json({
      success: result.success,
      result,
    })
  } catch (error) {
    console.error('Error running ETL task:', error)
    return NextResponse.json({ 
      error: 'Failed to run ETL task',
      message: (error as Error).message
    }, { status: 500 })
  }
} 