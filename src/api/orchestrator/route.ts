import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyRules } from './rules';

// Input schema validation
const orchestratorInputSchema = z.object({
  accountId: z.string().uuid(),
  missionId: z.string().uuid(),
  context: z.record(z.any()),
  data: z.array(z.any())
});

export async function POST(req: NextRequest) {
  console.log('stub: orchestrator route handler');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedInput = orchestratorInputSchema.parse(body);
    
    // Process the request with rule engine
    const { accountId, missionId, context, data } = validatedInput;
    const result = await applyRules(accountId, missionId, context, data);
    
    // Return the orchestrated response
    return NextResponse.json({ 
      success: true, 
      decision: result.decision,
      actions: result.actions,
      insights: result.insights
    });
  } catch (error) {
    console.error('Error in orchestrator:', error);
    
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