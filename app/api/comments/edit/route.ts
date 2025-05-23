import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/comments/edit
// Body: { commentId, newContent, author }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, newContent, author } = body;

    // Validera required fields
    if (!commentId || !newContent || !author) {
      return NextResponse.json(
        { error: 'commentId, newContent, and author are required' },
        { status: 400 }
      );
    }

    // Validera content length
    if (newContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    if (newContent.length > 5000) {
      return NextResponse.json(
        { error: 'Comment content too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    try {
      // Hitta kommentaren först
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          thread: true,
        },
      });

      if (!existingComment) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        );
      }

      if (existingComment.deleted) {
        return NextResponse.json(
          { error: 'Cannot edit deleted comment' },
          { status: 400 }
        );
      }

      // Kontrollera att endast författaren kan redigera
      if (existingComment.author !== author) {
        return NextResponse.json(
          { error: 'Only the author can edit this comment' },
          { status: 403 }
        );
      }

      // Uppdatera kommentaren
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          content: newContent.trim(),
          editedAt: new Date(),
          edited: true,
        },
      });

      // Logga aktivitet
      await prisma.activityLog.create({
        data: {
          entityType: existingComment.thread.entityType,
          entityId: existingComment.thread.entityId,
          action: 'edited_comment',
          actor: author,
          actorName: existingComment.authorName || author,
          description: `Redigerade kommentar: "${newContent.substring(0, 50)}${newContent.length > 50 ? '...' : ''}"`,
        },
      });

      return NextResponse.json({
        success: true,
        comment: {
          id: updatedComment.id,
          threadId: updatedComment.threadId,
          author: updatedComment.author,
          authorName: updatedComment.authorName,
          content: updatedComment.content,
          createdAt: updatedComment.createdAt,
          editedAt: updatedComment.editedAt,
          edited: updatedComment.edited,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback för development mode
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          comment: {
            id: commentId,
            threadId: 'dev_thread',
            author,
            authorName: author,
            content: newContent.trim(),
            createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            editedAt: new Date(),
            edited: true,
          },
          message: 'Development mode - no database connection',
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error editing comment:', error);
    return NextResponse.json(
      { error: 'Failed to edit comment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 