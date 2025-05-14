import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_RULES, evaluateRules } from './rules';

// Dummy orchestrator: på riktigt ska här ligga din regelmotor
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { accountId, missionId, input } = body;

  const matched = evaluateRules(input, SAMPLE_RULES, missionId);

  if (matched.length === 0) {
    return NextResponse.json({ status: 'ok', result: 'no rules matched' });
  }

  return NextResponse.json({
    status: 'actionable',
    actions: matched.map((m) => m.action),
  });
} 