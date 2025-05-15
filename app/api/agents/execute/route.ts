import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { runAgent } from '@/src/lib/agents/runAgent';

const prisma = new PrismaClient();

// Input validation schema
const executeAgentSchema = z.object({
  accountId: z.string().uuid(),
  agentId: z.string().uuid(),
  inputContext: z.record(z.any()).optional().default({}),
});

// POST /api/agents/execute
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { accountId, agentId, inputContext } = executeAgentSchema.parse(body);
    
    // Check if agent exists and belongs to the account
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        accountId,
      },
    });
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Check if agent is active
    if (agent.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Agent is not active' },
        { status: 400 }
      );
    }
    
    // Execute the agent
    const result = await runAgent(agent, inputContext);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to execute agent' 
        },
        { status: 500 }
      );
    }
    
    // Return successful response with execution details
    return NextResponse.json({
      success: true,
      data: {
        executionId: result.executionId,
        response: result.response,
        actionTaken: result.actionTaken,
        executionTime: result.executionTime,
      }
    });
    
  } catch (error) {
    console.error('Error executing agent:', error);
    
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