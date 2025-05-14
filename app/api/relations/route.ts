import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Get relations
export async function GET(request: NextRequest) {
  console.log('stub: GET /api/relations');
  
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }
    
    const sourceId = searchParams.get('sourceId') || undefined;
    const targetId = searchParams.get('targetId') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const whereClause: any = { accountId };
    
    if (sourceId) {
      whereClause.sourceId = sourceId;
    }
    
    if (targetId) {
      whereClause.targetId = targetId;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    const relations = await prisma.relation.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      include: {
        source: true,
        target: true,
      },
    });
    
    return NextResponse.json({ relations });
  } catch (error) {
    console.error('Error fetching relations:', error);
    return NextResponse.json({ error: 'Failed to fetch relations' }, { status: 500 });
  }
}

// Create relation
export async function POST(request: NextRequest) {
  console.log('stub: POST /api/relations');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      accountId: z.string().uuid(),
      sourceId: z.string().uuid(),
      targetId: z.string().uuid(),
      type: z.string(),
      metadata: z.record(z.any()).optional(),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { accountId, sourceId, targetId, type, metadata } = result.data;
    
    // Verify source and target entities exist and belong to account
    const source = await prisma.entity.findUnique({
      where: {
        id: sourceId,
        accountId,
      },
    });
    
    const target = await prisma.entity.findUnique({
      where: {
        id: targetId,
        accountId,
      },
    });
    
    if (!source || !target) {
      return NextResponse.json({ 
        error: 'Source or target entity not found or does not belong to account' 
      }, { status: 404 });
    }
    
    const relation = await prisma.relation.create({
      data: {
        accountId,
        sourceId,
        targetId,
        type,
        metadata,
      },
      include: {
        source: true,
        target: true,
      },
    });
    
    return NextResponse.json({ relation });
  } catch (error) {
    console.error('Error creating relation:', error);
    return NextResponse.json({ error: 'Failed to create relation' }, { status: 500 });
  }
}

// Update relation
export async function PUT(request: NextRequest) {
  console.log('stub: PUT /api/relations');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      id: z.string().uuid(),
      accountId: z.string().uuid(),
      type: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { id, accountId, type, metadata } = result.data;
    
    // Only update fields that are provided
    const updateData: any = {};
    
    if (type !== undefined) updateData.type = type;
    if (metadata !== undefined) updateData.metadata = metadata;
    
    const relation = await prisma.relation.update({
      where: {
        id,
        accountId, // Ensure relation belongs to specified account
      },
      data: updateData,
      include: {
        source: true,
        target: true,
      },
    });
    
    return NextResponse.json({ relation });
  } catch (error) {
    console.error('Error updating relation:', error);
    return NextResponse.json({ error: 'Failed to update relation' }, { status: 500 });
  }
}

// Delete relation
export async function DELETE(request: NextRequest) {
  console.log('stub: DELETE /api/relations');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const accountId = searchParams.get('accountId');
    
    if (!id || !accountId) {
      return NextResponse.json({ 
        error: 'id and accountId are required' 
      }, { status: 400 });
    }
    
    // First check if relation exists and belongs to account
    const relation = await prisma.relation.findUnique({
      where: {
        id,
        accountId,
      },
    });
    
    if (!relation) {
      return NextResponse.json({ 
        error: 'Relation not found or does not belong to account' 
      }, { status: 404 });
    }
    
    // Delete relation
    await prisma.relation.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting relation:', error);
    return NextResponse.json({ error: 'Failed to delete relation' }, { status: 500 });
  }
} 