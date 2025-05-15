import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schema
const createReasonChainSchema = z.object({
  sourceType: z.enum(['agent', 'rule', 'anomaly']),
  sourceId: z.string(),
  conclusion: z.string(),
  explanationSteps: z.array(z.object({
    step: z.number(),
    reasoning: z.string(),
    evidence: z.string().optional(),
  })),
  inputContext: z.record(z.any()),
});

// POST /api/explainability/reason-chain/create
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const { sourceType, sourceId, conclusion, explanationSteps, inputContext } = 
      createReasonChainSchema.parse(body);
    
    // Create new ReasonChain
    const reasonChain = await prisma.reasonChain.create({
      data: {
        sourceType,
        sourceId,
        conclusion,
        explanationSteps,
        inputContext,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: reasonChain,
    });
  } catch (error) {
    console.error('Error creating ReasonChain:', error);
    
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