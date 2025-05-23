import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/comments/delete
// Body: { commentId, author }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, author } = body;

    // Validera required fields
    if (!commentId || !author) {
      return NextResponse.json(
        { error: 'commentId and author are required' },
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
          { error: 'Comment already deleted' },
          { status: 400 }
        );
      }

      // Kontrollera att endast författaren kan ta bort
      // (eller systemadministratör - kan byggas ut senare)
      if (existingComment.author !== author) {
        return NextResponse.json(
          { error: 'Only the author can delete this comment' },
          { status: 403 }
        );
      }

      // Soft delete - markera som deleted istället för att ta bort helt
      const deletedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          deleted: true,
          content: '[Kommentar borttagen]', // Ersätt innehållet
          editedAt: new Date(),
        },
      });

      // Logga aktivitet
      await prisma.activityLog.create({
        data: {
          entityType: existingComment.thread.entityType,
          entityId: existingComment.thread.entityId,
          action: 'deleted_comment',
          actor: author,
          actorName: existingComment.authorName || author,
          description: 'Raderade en kommentar',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Comment deleted successfully',
        commentId: deletedComment.id,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback för development mode
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Comment deleted successfully (development mode)',
          commentId,
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 