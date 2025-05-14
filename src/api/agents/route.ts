import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { executeAgent } from './execute';

const prisma = new PrismaClient();

// Input validation schemas
const createAgentSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  triggerType: z.enum(['event', 'schedule', 'manual', 'model', 'api']),
  actionType: z.enum(['slack', 'email', 'webhook', 'zapier', 'custom']),
  parameters: z.record(z.any()).optional(),
  createdById: z.string().uuid(),
  status: z.enum(['active', 'inactive']).default('inactive'),
});

const updateAgentSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  triggerType: z.enum(['event', 'schedule', 'manual', 'model', 'api']).optional(),
  actionType: z.enum(['slack', 'email', 'webhook', 'zapier', 'custom']).optional(),
  parameters: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

const executeAgentRequestSchema = z.object({
  accountId: z.string().uuid(),
  agentId: z.string().uuid(),
  payload: z.record(z.any()),
  options: z.object({
    async: z.boolean().default(false),
    timeout: z.number().int().positive().default(30000), // milliseconds
  }).optional(),
});

// GET /api/agents
export async function GET(req: NextRequest) {
  console.log('stub: GET agents');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const triggerType = searchParams.get('triggerType');
    const actionType = searchParams.get('actionType');
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
    
    if (triggerType) {
      where.triggerType = triggerType;
    }
    
    if (actionType) {
      where.actionType = actionType;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get agents and total count
    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.agent.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      agents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/agents
export async function POST(req: NextRequest) {
  console.log('stub: POST agent');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = createAgentSchema.parse(body);
    
    // Check if user exists and belongs to the account
    const user = await prisma.user.findFirst({
      where: {
        id: validatedData.createdById,
        accountId: validatedData.accountId,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found or does not belong to the account' },
        { status: 400 }
      );
    }
    
    // Create the agent
    const agent = await prisma.agent.create({
      data: validatedData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    
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

// PATCH /api/agents
export async function PATCH(req: NextRequest) {
  console.log('stub: PATCH agent');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateAgentSchema.parse(body);
    const { id, accountId, ...updateData } = validatedData;
    
    // Check if agent exists and belongs to the account
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Update the agent
    const agent = await prisma.agent.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({ success: true, agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    
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

// DELETE /api/agents
export async function DELETE(req: NextRequest) {
  console.log('stub: DELETE agent');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const accountId = searchParams.get('accountId');
    
    // Validate parameters
    if (!id || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID and Account ID are required' },
        { status: 400 }
      );
    }
    
    // Check if agent exists and belongs to the account
    const existingAgent = await prisma.agent.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found or does not belong to the account' },
        { status: 404 }
      );
    }
    
    // Delete the agent
    await prisma.agent.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/agents/execute - Execute an agent
export async function execute(req: NextRequest) {
  console.log('stub: execute agent');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = executeAgentRequestSchema.parse(body);
    const { accountId, agentId, payload, options = {} } = validatedData;
    
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
    
    // Create a log entry
    const log = await prisma.log.create({
      data: {
        accountId,
        type: 'agent_execution',
        action: 'execute',
        resourceId: agentId,
        resourceType: 'agent',
        metadata: {
          payload,
          options,
        },
      },
    });
    
    // If async execution requested, return immediately
    if (options.async) {
      // In a real implementation, we would trigger a background job to execute the agent
      // For now, just log the async request
      console.log(`Async agent execution requested: ${log.id}`);
      
      return NextResponse.json({ 
        success: true, 
        execution: {
          id: log.id,
          status: 'pending',
        }, 
        async: true 
      });
    }
    
    // Execute the agent
    const result = await executeAgent(accountId, agent, payload, options);
    
    // Update the log entry with the result
    await prisma.log.update({
      where: { id: log.id },
      data: {
        metadata: {
          ...log.metadata as Record<string, any>,
          result,
        },
      },
    });
    
    return NextResponse.json({ 
      success: result.success, 
      execution: {
        id: log.id,
        result,
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