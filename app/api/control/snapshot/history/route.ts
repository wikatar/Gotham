import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/control/snapshot/history
 * Retrieves historical snapshots for visualization
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    // Calculate the date for filtering
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch historical snapshots
    const snapshots = await prisma.controlPanelSnapshot.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        id: true,
        timestamp: true,
        totalAgents: true,
        activeAgents: true,
        failedAgents: true,
        totalAnomalies: true,
        resolvedAnomalies: true,
        criticalIncidents: true,
        systemHealthStatus: true,
      },
    });
    
    // Format the data for chart visualization
    const formattedData = {
      labels: snapshots.map(snapshot => new Date(snapshot.timestamp).toLocaleString()),
      agents: {
        active: snapshots.map(snapshot => snapshot.activeAgents),
        failed: snapshots.map(snapshot => snapshot.failedAgents),
        total: snapshots.map(snapshot => snapshot.totalAgents),
      },
      anomalies: {
        active: snapshots.map(snapshot => snapshot.totalAnomalies - snapshot.resolvedAnomalies),
        resolved: snapshots.map(snapshot => snapshot.resolvedAnomalies),
        critical: snapshots.map(snapshot => snapshot.criticalIncidents),
      },
      systemStatus: snapshots.map(snapshot => ({
        status: snapshot.systemHealthStatus,
        timestamp: snapshot.timestamp,
      })),
    };
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      rawData: snapshots,
    });
  } catch (error) {
    console.error('Error fetching snapshot history:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 