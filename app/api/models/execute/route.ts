import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { executeModel } from '@/src/api/models/run';
import { z } from 'zod';

const prisma = new PrismaClient();

// Execute a model
export async function POST(request: NextRequest) {
  console.log('stub: POST /api/models/execute');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      accountId: z.string().uuid(),
      modelId: z.string().uuid(),
      input: z.record(z.any()),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { accountId, modelId, input } = result.data;
    
    const { execution, model } = await executeModel(modelId, accountId, input);
    
    return NextResponse.json({ 
      success: true, 
      executionId: execution.id,
      model: {
        id: model.id,
        name: model.name,
        version: model.version
      },
      output: execution.output
    });
  } catch (error) {
    console.error('Error executing model:', error);
    return NextResponse.json({ 
      error: 'Failed to execute model',
      message: (error as Error).message
    }, { status: 500 });
  }
} 