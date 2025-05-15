import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateControlPanelSnapshot } from '@/src/lib/snapshots/updateControlPanelSnapshot';

const prisma = new PrismaClient();

/**
 * GET /api/snapshots/control-panel
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
    
    return NextResponse.json({
      success: true,
      data: latestSnapshot,
    });
  } catch (error) {
    console.error('Error fetching latest control panel snapshot:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/snapshots/control-panel
 * Manually triggers a control panel snapshot update
 */
export async function POST() {
  try {
    // Update the snapshot
    const snapshot = await updateControlPanelSnapshot();
    
    return NextResponse.json({
      success: true,
      data: snapshot,
      message: 'Control panel snapshot updated successfully',
    });
  } catch (error) {
    console.error('Error updating control panel snapshot:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 