import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Get entities
export async function GET(request: NextRequest) {
  console.log('stub: GET /api/entities');
  
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }
    
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const whereClause: any = { accountId };
    
    if (type) {
      whereClause.type = type;
    }
    
    const entities = await prisma.entity.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
    });
    
    return NextResponse.json({ entities });
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
  }
}

// Create entity
export async function POST(request: NextRequest) {
  console.log('stub: POST /api/entities');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      accountId: z.string().uuid(),
      name: z.string(),
      type: z.string(),
      metadata: z.record(z.any()).optional(),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { accountId, name, type, metadata } = result.data;
    
    const entity = await prisma.entity.create({
      data: {
        accountId,
        name,
        type,
        metadata,
      },
    });
    
    return NextResponse.json({ entity });
  } catch (error) {
    console.error('Error creating entity:', error);
    return NextResponse.json({ error: 'Failed to create entity' }, { status: 500 });
  }
}

// Update entity
export async function PUT(request: NextRequest) {
  console.log('stub: PUT /api/entities');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      id: z.string().uuid(),
      accountId: z.string().uuid(),
      name: z.string().optional(),
      type: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { id, accountId, name, type, metadata } = result.data;
    
    // Only update fields that are provided
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (metadata !== undefined) updateData.metadata = metadata;
    
    const entity = await prisma.entity.update({
      where: {
        id,
        accountId, // Ensure entity belongs to specified account
      },
      data: updateData,
    });
    
    return NextResponse.json({ entity });
  } catch (error) {
    console.error('Error updating entity:', error);
    return NextResponse.json({ error: 'Failed to update entity' }, { status: 500 });
  }
}

// Delete entity
export async function DELETE(request: NextRequest) {
  console.log('stub: DELETE /api/entities');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const accountId = searchParams.get('accountId');
    
    if (!id || !accountId) {
      return NextResponse.json({ 
        error: 'id and accountId are required' 
      }, { status: 400 });
    }
    
    // First check if entity exists and belongs to account
    const entity = await prisma.entity.findUnique({
      where: {
        id,
        accountId,
      },
    });
    
    if (!entity) {
      return NextResponse.json({ 
        error: 'Entity not found or does not belong to account' 
      }, { status: 404 });
    }
    
    // Delete entity
    await prisma.entity.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entity:', error);
    return NextResponse.json({ error: 'Failed to delete entity' }, { status: 500 });
  }
} 