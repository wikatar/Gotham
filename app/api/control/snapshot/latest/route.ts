import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/control/snapshot/latest
 * Retrieves the latest control panel snapshot
 */
export async function GET() {
  try {
    // Get the latest snapshot
    const latestSnapshot = await prisma.controlPanelSnapshot.findFirst({
      orderBy: {
        timestamp: 'desc',
      },
    });
    
    if (!latestSnapshot) {
      return NextResponse.json(
        { success: false, error: 'No snapshots available' },
        { status: 404 }
      );
    }
    
    // Calculate time since last snapshot
    const now = new Date();
    const snapshotTime = new Date(latestSnapshot.timestamp);
    const timeSinceSnapshot = Math.floor((now.getTime() - snapshotTime.getTime()) / 1000); // in seconds
    
    return NextResponse.json({
      success: true,
      data: {
        ...latestSnapshot,
        timeSinceUpdate: timeSinceSnapshot,
        formattedTimestamp: snapshotTime.toLocaleString(),
      },
    });
  } catch (error) {
    console.error('Error fetching latest control panel snapshot:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 