import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/activity-log/add
// Body: { entityType, entityId, action, actor, actorName?, description?, metadata? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, action, actor, actorName, description, metadata } = body;

    // Validera required fields
    if (!entityType || !entityId || !action || !actor) {
      return NextResponse.json(
        { error: 'entityType, entityId, action, and actor are required' },
        { status: 400 }
      );
    }

    // Validera entityType
    const validEntityTypes = ['mission', 'agent', 'incident', 'anomaly', 'execution', 'comment'];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    try {
      // Skapa activity log entry
      const activityLog = await prisma.activityLog.create({
        data: {
          entityType,
          entityId,
          action,
          actor,
          actorName: actorName || actor,
          description: description || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return NextResponse.json({
        success: true,
        activityLog: {
          id: activityLog.id,
          entityType: activityLog.entityType,
          entityId: activityLog.entityId,
          action: activityLog.action,
          actor: activityLog.actor,
          actorName: activityLog.actorName,
          description: activityLog.description,
          metadata: activityLog.metadata ? JSON.parse(activityLog.metadata) : null,
          createdAt: activityLog.createdAt,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback för development mode
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          activityLog: {
            id: 'dev_activity_' + Date.now(),
            entityType,
            entityId,
            action,
            actor,
            actorName: actorName || actor,
            description: description || null,
            metadata: metadata || null,
            createdAt: new Date(),
          },
          message: 'Development mode - no database connection',
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error adding activity log:', error);
    return NextResponse.json(
      { error: 'Failed to add activity log' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 