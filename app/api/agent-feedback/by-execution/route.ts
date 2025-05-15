import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/agent-feedback/by-execution?executionLogId=X
 * Retrieves feedback for a specific agent execution
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const executionLogId = searchParams.get('executionLogId');
    
    if (!executionLogId) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: executionLogId' },
        { status: 400 }
      );
    }
    
    // Fetch the feedback for the execution
    const feedback = await prisma.agentFeedback.findFirst({
      where: {
        executionLogId: executionLogId
      }
    });
    
    if (!feedback) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No feedback found for this execution'
      });
    }
    
    return NextResponse.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback for execution:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 