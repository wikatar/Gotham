import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schemas
const createMissionSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
  kpis: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    target: z.number().optional(),
    unit: z.string().optional(),
    threshold: z.object({
      warning: z.number().optional(),
      critical: z.number().optional(),
    }).optional(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateMissionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  kpis: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    target: z.number().optional(),
    unit: z.string().optional(),
    threshold: z.object({
      warning: z.number().optional(),
      critical: z.number().optional(),
    }).optional(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
});

// GET /api/missions
export async function GET(req: NextRequest) {
  console.log('stub: GET missions');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const status = searchParams.get('status');
    const ownerId = searchParams.get('ownerId');
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
    
    if (status) {
      where.status = status;
    }
    
    if (ownerId) {
      where.ownerId = ownerId;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get missions and total count
    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.mission.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      missions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing missions:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/missions
export async function POST(req: NextRequest) {
  console.log('stub: POST mission');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = createMissionSchema.parse(body);
    
    // Check if owner exists and belongs to the account
    if (validatedData.ownerId) {
      const owner = await prisma.user.findFirst({
        where: {
          id: validatedData.ownerId,
          accountId: validatedData.accountId,
        },
      });
      
      if (!owner) {
        return NextResponse.json(
          { success: false, error: 'Owner not found or does not belong to the account' },
          { status: 400 }
        );
      }
    }
    
    // Create the mission
    const mission = await prisma.mission.create({
      data: validatedData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({ success: true, mission });
  } catch (error) {
    console.error('Error creating mission:', error);
    
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

// PATCH /api/missions
export async function PATCH(req: NextRequest) {
  console.log('stub: PATCH mission');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateMissionSchema.parse(body);
    const { id, accountId, ...updateData } = validatedData;
    
    // Check if mission exists and belongs to the account
    const existingMission = await prisma.mission.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingMission) {
      return NextResponse.json(
        { success: false, error: 'Mission not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Check if owner exists and belongs to the account if provided
    if (updateData.ownerId) {
      const owner = await prisma.user.findFirst({
        where: {
          id: updateData.ownerId,
          accountId,
        },
      });
      
      if (!owner) {
        return NextResponse.json(
          { success: false, error: 'Owner not found or does not belong to the account' },
          { status: 400 }
        );
      }
    }
    
    // Update the mission
    const mission = await prisma.mission.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({ success: true, mission });
  } catch (error) {
    console.error('Error updating mission:', error);
    
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

// DELETE /api/missions
export async function DELETE(req: NextRequest) {
  console.log('stub: DELETE mission');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const accountId = searchParams.get('accountId');
    
    // Validate parameters
    if (!id || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Mission ID and Account ID are required' },
        { status: 400 }
      );
    }
    
    // Check if mission exists and belongs to the account
    const existingMission = await prisma.mission.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingMission) {
      return NextResponse.json(
        { success: false, error: 'Mission not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Delete the mission
    await prisma.mission.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mission:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 