import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/activity-log/by-entity?entityType=mission&entityId=abc123&limit=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
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

    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 50; // Max 100 items
    const offset = offsetParam ? parseInt(offsetParam) : 0;

    try {
      // Hämta aktivitetsloggar
      const activities = await prisma.activityLog.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      // Räkna totalt antal för pagination
      const totalCount = await prisma.activityLog.count({
        where: {
          entityType,
          entityId,
        },
      });

      // Parse metadata för varje aktivitet
      const activitiesWithParsedMetadata = activities.map(activity => ({
        id: activity.id,
        entityType: activity.entityType,
        entityId: activity.entityId,
        action: activity.action,
        actor: activity.actor,
        actorName: activity.actorName,
        description: activity.description,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
        createdAt: activity.createdAt,
      }));

      return NextResponse.json({
        success: true,
        activities: activitiesWithParsedMetadata,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback för development mode
      if (process.env.NODE_ENV === 'development') {
        const sampleActivities = [
          {
            id: 'dev_activity_1',
            entityType,
            entityId,
            action: 'created',
            actor: 'admin@gotham.se',
            actorName: 'System Admin',
            description: `Skapade ${entityType} med ID ${entityId}`,
            metadata: null,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          },
          {
            id: 'dev_activity_2',
            entityType,
            entityId,
            action: 'updated',
            actor: 'user@gotham.se',
            actorName: 'Test User',
            description: `Uppdaterade ${entityType}`,
            metadata: { field: 'status', oldValue: 'draft', newValue: 'active' },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
        ];

        return NextResponse.json({
          success: true,
          activities: sampleActivities,
          pagination: {
            total: 2,
            limit,
            offset,
            hasMore: false,
          },
          message: 'Development mode - no database connection',
        });
      }

      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 