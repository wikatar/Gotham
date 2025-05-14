import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { registerModel } from '@/src/api/models/register';
import { z } from 'zod';

const prisma = new PrismaClient();

// Register a model
export async function POST(request: NextRequest) {
  console.log('stub: POST /api/models/register');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      accountId: z.string().uuid(),
      name: z.string(),
      version: z.string(),
      endpoint: z.string().url(),
      createdById: z.string().uuid(),
      description: z.string().optional(),
      inputSchema: z.record(z.any()).optional(),
      outputSchema: z.record(z.any()).optional(),
      metadata: z.record(z.any()).optional(),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { 
      accountId, 
      name, 
      version, 
      endpoint, 
      createdById,
      description,
      inputSchema,
      outputSchema,
      metadata 
    } = result.data;
    
    const model = await registerModel(
      name,
      version,
      endpoint,
      accountId,
      createdById,
      description,
      inputSchema,
      outputSchema,
      metadata
    );
    
    // Log model registration
    await prisma.log.create({
      data: {
        accountId,
        type: 'model_registration',
        action: `Model ${name} v${version} registered`,
        resourceId: model.id,
        resourceType: 'model',
        metadata: {
          endpoint,
          createdById
        },
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      model: {
        id: model.id,
        name: model.name,
        version: model.version,
        endpoint: model.endpoint
      }
    });
  } catch (error) {
    console.error('Error registering model:', error);
    return NextResponse.json({ 
      error: 'Failed to register model',
      message: (error as Error).message
    }, { status: 500 });
  }
} 