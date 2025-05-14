/**
 * API endpoint for retrieving metadata about a specific data source
 * Returns information about the source without fetching the actual rows
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sourceId = params.id
    
    // Fetch the data source information
    const source = await db.dataSource.findUnique({
      where: { id: sourceId },
      select: {
        id: true,
        name: true,
        recordCount: true,
        importedAt: true,
        accountId: true,
        mapping: true
      }
    })

    if (!source) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ source })
  } catch (error) {
    console.error('Error fetching data source info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data source info', message: (error as Error).message },
      { status: 500 }
    )
  }
} 