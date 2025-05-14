/**
 * API endpoint for importing and storing structured CSV data into the internal data lake.
 * Input: JSON with filename, field mapping, and raw data
 * Output: Confirms import and saves dataset as versioned resource
 *
 * Design philosophy:
 * - High-fidelity ingestion with field traceability
 * - Clean separation between data ingestion and semantic modeling
 * - Fully extensible for versioning, type inference, data quality checks, and audit logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/lib/db'
import { z } from 'zod'

// Define schema for incoming request
const importSchema = z.object({
  filename: z.string(),
  mapping: z.record(z.string(), z.string()),
  data: z.array(z.record(z.string(), z.string().nullable())),
  accountId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parse = importSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json({ 
        error: 'Invalid data format',
        details: parse.error.format()
      }, { status: 400 })
    }

    const { filename, mapping, data } = parse.data
    const accountId = parse.data.accountId || 'demo-account' // TODO: replace with auth context

    // Step 1: Save data source metadata (versioned)
    const source = await db.dataSource.create({
      data: {
        name: filename,
        mapping,
        recordCount: data.length,
        importedAt: new Date(),
        accountId,
      },
    })

    // Step 2: Save raw rows into internal storage (JSON)
    await db.dataRow.createMany({
      data: data.map((row) => ({
        sourceId: source.id,
        row,
      })),
    })

    // Step 3: Log the import
    await db.log.create({
      data: {
        accountId,
        type: 'data_import',
        action: `Imported data source: ${filename}`,
        resourceId: source.id,
        resourceType: 'dataSource',
        metadata: {
          recordCount: data.length,
          fieldCount: Object.keys(mapping).length
        }
      }
    })

    // Step 4: Return success
    return NextResponse.json({ 
      status: 'ok', 
      sourceId: source.id,
      recordCount: data.length,
      importedAt: source.importedAt
    })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json({ 
      error: 'Failed to import data',
      message: (error as Error).message
    }, { status: 500 })
  }
} 