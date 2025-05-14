import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { agentId, payload } = body;

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Simulera exekvering
  console.log(`Running agent: ${agent.name}`, { parameters: agent.parameters, payload });

  // Logg exekvering
  await prisma.log.create({
    data: {
      accountId: agent.accountId,
      type: 'agent_execution',
      action: `Agent ${agent.name} executed`,
      resourceId: agent.id,
      resourceType: 'agent',
      metadata: payload,
    },
  });

  return NextResponse.json({ status: 'executed', agent: agent.name });
} 