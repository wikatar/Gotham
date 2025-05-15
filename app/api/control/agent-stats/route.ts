import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/control/agent-stats
 * Retrieves statistics about agents including status, last execution, output, 
 * failed executions, and inactive agents
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Get all agents with their latest execution log
    const agents = await prisma.agent.findMany({
      where: {
        accountId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        triggerType: true,
        actionType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        executionLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            status: true,
            actionTaken: true,
            executionTime: true,
            createdAt: true,
            response: true,
          },
        },
      },
    });
    
    // Get the date 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Get all failed executions in the last 24 hours
    const failedExecutions = await prisma.agentExecutionLog.findMany({
      where: {
        accountId,
        status: 'error',
        createdAt: {
          gte: oneDayAgo,
        },
      },
      select: {
        id: true,
        agentId: true,
        error: true,
        executionTime: true,
        createdAt: true,
        agent: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Identify agents with no activity in the last 24 hours
    const inactiveAgents = agents.filter(agent => {
      if (agent.executionLogs.length === 0) {
        return true; // Never executed
      }
      
      const lastExecutionDate = new Date(agent.executionLogs[0].createdAt);
      return lastExecutionDate < oneDayAgo;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        agents: agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          triggerType: agent.triggerType,
          actionType: agent.actionType,
          status: agent.status,
          lastExecution: agent.executionLogs[0] || null,
          hasRecentActivity: agent.executionLogs.length > 0 && 
            new Date(agent.executionLogs[0].createdAt) >= oneDayAgo,
        })),
        failedExecutions,
        inactiveAgents: inactiveAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          lastExecution: agent.executionLogs[0] || null,
        })),
        stats: {
          totalAgents: agents.length,
          activeAgents: agents.filter(a => a.status === 'active').length,
          inactiveAgentsCount: inactiveAgents.length,
          failedExecutionsCount: failedExecutions.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching agent statistics:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 