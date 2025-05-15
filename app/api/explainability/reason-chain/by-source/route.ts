import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/explainability/reason-chain/by-source?sourceType=X&sourceId=Y
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const sourceType = searchParams.get('sourceType');
    const sourceId = searchParams.get('sourceId');
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    
    // Validate required parameters
    if (!sourceType || !sourceId) {
      return NextResponse.json(
        { success: false, error: 'sourceType and sourceId are required' },
        { status: 400 }
      );
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get reason chains and total count
    const [reasonChains, total] = await Promise.all([
      prisma.reasonChain.findMany({
        where: {
          sourceType,
          sourceId,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reasonChain.count({
        where: {
          sourceType,
          sourceId,
        },
      }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: reasonChains,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching ReasonChains by source:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 