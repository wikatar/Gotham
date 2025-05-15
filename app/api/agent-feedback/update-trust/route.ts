import { NextRequest, NextResponse } from 'next/server';
import { updateAgentTrust } from '@/app/lib/agentTrust';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/agent-feedback/update-trust
 * Updates an agent's trust score based on all feedback
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract agentId from request
    const { agentId } = body;
    
    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: agentId' },
        { status: 400 }
      );
    }
    
    // Verify that the agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Update the agent's trust score
    const trustScore = await updateAgentTrust(agentId);
    
    return NextResponse.json({
      success: true,
      data: {
        agentId,
        trustScore
      }
    });
  } catch (error) {
    console.error('Error updating agent trust score:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 