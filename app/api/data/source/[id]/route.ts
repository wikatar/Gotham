/**
 * API endpoint for retrieving data from a specific data source
 * Returns up to 1000 rows from the specified data source ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(
  _: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const sourceId = params.id
    
    // Fetch up to 1000 rows for the data source
    const rows = await db.dataRow.findMany({
      where: { sourceId },
      take: 1000, // Limit to 1000 rows for performance
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ rows })
  } catch (error) {
    console.error('Error fetching data source rows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data source', message: (error as Error).message },
      { status: 500 }
    )
  }
} 