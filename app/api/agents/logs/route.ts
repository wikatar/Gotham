import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/agents/logs
export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const agentId = searchParams.get('agentId');
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '10');
    
    // Validate required parameters
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Build filter conditions
    const where: any = { accountId };
    
    if (agentId) {
      where.agentId = agentId;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get logs and total count
    const [logs, total] = await Promise.all([
      prisma.agentExecutionLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              actionType: true,
            },
          },
        },
      }),
      prisma.agentExecutionLog.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 