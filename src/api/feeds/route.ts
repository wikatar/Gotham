import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { processAndNormalizeData } from './etl';

const prisma = new PrismaClient();

// Input validation schemas
const createFeedSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  sourceType: z.enum(['api', 'database', 'file', 'stream', 'custom']),
  configuration: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive', 'error']).default('inactive'),
  metadata: z.record(z.any()).optional(),
});

const updateFeedSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  sourceType: z.enum(['api', 'database', 'file', 'stream', 'custom']).optional(),
  configuration: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive', 'error']).optional(),
  metadata: z.record(z.any()).optional(),
});

const uploadDataSchema = z.object({
  accountId: z.string().uuid(),
  feedId: z.string().uuid(),
  data: z.array(z.record(z.any())),
  options: z.object({
    normalize: z.boolean().default(true),
    index: z.boolean().default(true),
    tagSensitiveData: z.boolean().default(false),
  }).optional(),
});

// GET /api/feeds
export async function GET(req: NextRequest) {
  console.log('stub: GET feeds');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const sourceType = searchParams.get('sourceType');
    const status = searchParams.get('status');
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    
    // Validate account ID
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Build filter conditions
    const where: any = { accountId };
    
    if (sourceType) {
      where.sourceType = sourceType;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get feeds and total count
    const [feeds, total] = await Promise.all([
      prisma.feed.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.feed.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      feeds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing feeds:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/feeds
export async function POST(req: NextRequest) {
  console.log('stub: POST feed');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = createFeedSchema.parse(body);
    
    // Create the feed
    const feed = await prisma.feed.create({
      data: validatedData,
    });
    
    return NextResponse.json({ success: true, feed });
  } catch (error) {
    console.error('Error creating feed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/feeds
export async function PATCH(req: NextRequest) {
  console.log('stub: PATCH feed');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateFeedSchema.parse(body);
    const { id, accountId, ...updateData } = validatedData;
    
    // Check if feed exists and belongs to the account
    const existingFeed = await prisma.feed.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingFeed) {
      return NextResponse.json(
        { success: false, error: 'Feed not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Update the feed
    const feed = await prisma.feed.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({ success: true, feed });
  } catch (error) {
    console.error('Error updating feed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/feeds
export async function DELETE(req: NextRequest) {
  console.log('stub: DELETE feed');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const accountId = searchParams.get('accountId');
    
    // Validate parameters
    if (!id || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Feed ID and Account ID are required' },
        { status: 400 }
      );
    }
    
    // Check if feed exists and belongs to the account
    const existingFeed = await prisma.feed.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingFeed) {
      return NextResponse.json(
        { success: false, error: 'Feed not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Delete the feed
    await prisma.feed.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feed:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/feeds/data - Upload data to a feed
export async function uploadData(req: NextRequest) {
  console.log('stub: uploadData to feed');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = uploadDataSchema.parse(body);
    const { accountId, feedId, data, options } = validatedData;
    
    // Check if feed exists and belongs to the account
    const existingFeed = await prisma.feed.findFirst({
      where: {
        id: feedId,
        accountId,
      },
    });
    
    if (!existingFeed) {
      return NextResponse.json(
        { success: false, error: 'Feed not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Process the data
    const processedData = await processAndNormalizeData(
      accountId,
      feedId,
      data,
      options || {}
    );
    
    // Update feed with last synced timestamp
    await prisma.feed.update({
      where: { id: feedId },
      data: {
        lastSyncedAt: new Date(),
        status: 'active',
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      processedCount: processedData.length,
      summary: processedData.summary,
    });
  } catch (error) {
    console.error('Error uploading data to feed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 