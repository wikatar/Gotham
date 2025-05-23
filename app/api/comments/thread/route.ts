import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/comments/thread?entityType=mission&entityId=abc123
// Skapar thread om den inte finns, returnerar alla kommentarer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    // Validera entityType
    const validEntityTypes = ['mission', 'agent', 'incident', 'anomaly', 'execution'];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    try {
      // Försök hitta befintlig thread eller skapa en ny
      let thread = await prisma.commentThread.findUnique({
        where: {
          entityType_entityId: {
            entityType,
            entityId,
          },
        },
        include: {
          comments: {
            where: {
              deleted: false, // Visa bara icke-raderade kommentarer
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      // Om thread inte finns, skapa en ny
      if (!thread) {
        thread = await prisma.commentThread.create({
          data: {
            entityType,
            entityId,
          },
          include: {
            comments: {
              where: {
                deleted: false,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        thread: {
          id: thread.id,
          entityType: thread.entityType,
          entityId: thread.entityId,
          createdAt: thread.createdAt,
          commentCount: thread.comments.length,
          comments: thread.comments,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback för development mode
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          thread: {
            id: 'dev_thread_' + Date.now(),
            entityType,
            entityId,
            createdAt: new Date(),
            commentCount: 0,
            comments: [],
          },
          message: 'Development mode - no database connection',
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching comment thread:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment thread' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 