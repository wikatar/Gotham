/**
 * API endpoint for retrieving all data sources
 * Lists available data sources with metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url)
    const accountId = url.searchParams.get('accountId') || 'demo-account'
    
    // Fetch data sources for the account
    const sources = await db.dataSource.findMany({
      where: { 
        accountId
      },
      orderBy: { 
        importedAt: 'desc' 
      },
      select: {
        id: true,
        name: true,
        recordCount: true,
        importedAt: true,
        accountId: true
      }
    })

    return NextResponse.json({ sources })
  } catch (error) {
    console.error('Error fetching data sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data sources', message: (error as Error).message },
      { status: 500 }
    )
  }
} 