import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dummy orchestrator: på riktigt ska här ligga din regelmotor
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { accountId, missionId, input } = body;

  // Här: hämta mission, regler, feedstatus, KPI etc.
  console.log('Orchestrator received:', { accountId, missionId, input });

  // Dummy return
  return NextResponse.json({
    action: 'trigger_model',
    modelId: 'abc123',
    triggerReason: 'churn > 20%',
  });
} 