import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/explainability/reason-chain/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get the specific reason chain
    const reasonChain = await prisma.reasonChain.findUnique({
      where: { id },
    });
    
    if (!reasonChain) {
      return NextResponse.json(
        { success: false, error: 'ReasonChain not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: reasonChain,
    });
  } catch (error) {
    console.error('Error fetching ReasonChain:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 