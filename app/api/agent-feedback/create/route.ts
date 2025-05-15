import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/agent-feedback/create
 * Creates feedback for agent execution
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract feedback data from request
    const { 
      executionLogId, 
      accountId,
      rating, 
      comment, 
      wasActionEffective, 
      measuredImpact 
    } = body;
    
    // Validate required fields
    if (!executionLogId || !rating || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: executionLogId, rating, and accountId are required' },
        { status: 400 }
      );
    }
    
    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Verify that the execution log exists
    const executionLog = await prisma.agentExecutionLog.findUnique({
      where: { id: executionLogId }
    });
    
    if (!executionLog) {
      return NextResponse.json(
        { success: false, error: 'Agent execution log not found' },
        { status: 404 }
      );
    }
    
    // Create new feedback
    const feedback = await prisma.agentFeedback.create({
      data: {
        executionLogId,
        accountId,
        rating,
        comment,
        wasActionEffective,
        measuredImpact: measuredImpact || undefined
      }
    });
    
    return NextResponse.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error creating agent feedback:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 