import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

const schema = z.object({
  sourceId: z.string(),
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

    const { sourceId } = parsed.data

    const pipelines = await db.dataCleaningPipeline.findMany({
      where: { sourceId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ pipelines })
  } catch (error) {
    console.error('Error fetching cleaning pipelines:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch cleaning pipelines',
      message: (error as Error).message
    }, { status: 500 })
  }
} 