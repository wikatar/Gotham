import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

// POST /api/comments/add
// Body: { entityType, entityId, author, authorName?, content }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, author, authorName, content } = body;

    // Validera required fields
    if (!entityType || !entityId || !author || !content) {
      return NextResponse.json(
        { error: 'entityType, entityId, author, and content are required' },
        { status: 400 }
      );
    }

    // Validera content length
    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Comment content too long (max 5000 characters)' },
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
      // Hitta eller skapa comment thread
      let thread = await prisma.commentThread.findUnique({
        where: {
          entityType_entityId: {
            entityType,
            entityId,
          },
        },
      });

      if (!thread) {
        thread = await prisma.commentThread.create({
          data: {
            entityType,
            entityId,
          },
        });
      }

      // Skapa kommentaren
      const comment = await prisma.comment.create({
        data: {
          threadId: thread.id,
          author,
          authorName: authorName || author,
          content: content.trim(),
        },
      });

      // Logga aktivitet
      await prisma.activityLog.create({
        data: {
          entityType,
          entityId,
          action: 'commented',
          actor: author,
          actorName: authorName || author,
          description: `Lade till kommentar: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        },
      });

      return NextResponse.json({
        success: true,
        comment: {
          id: comment.id,
          threadId: comment.threadId,
          author: comment.author,
          authorName: comment.authorName,
          content: comment.content,
          createdAt: comment.createdAt,
          editedAt: comment.editedAt,
          edited: comment.edited,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback för development mode
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          comment: {
            id: 'dev_comment_' + nanoid(),
            threadId: 'dev_thread_' + Date.now(),
            author,
            authorName: authorName || author,
            content: content.trim(),
            createdAt: new Date(),
            editedAt: null,
            edited: false,
          },
          message: 'Development mode - no database connection',
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 