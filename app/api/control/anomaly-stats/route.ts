import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/control/anomaly-stats
 * Retrieves statistics about anomalies including total active anomalies,
 * anomalies by category, and latest anomalies
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Get all active (unresolved) anomalies
    const activeAnomalies = await prisma.anomaly.findMany({
      where: {
        accountId,
        resolved: false,
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
    
    // Count anomalies by type
    const anomalyTypeCounts = await prisma.$queryRaw`
      SELECT type, COUNT(*) as count 
      FROM "Anomaly" 
      WHERE "accountId" = ${accountId} AND resolved = false 
      GROUP BY type
    `;
    
    // Count anomalies by severity
    const anomalySeverityCounts = await prisma.$queryRaw`
      SELECT severity, COUNT(*) as count 
      FROM "Anomaly" 
      WHERE "accountId" = ${accountId} AND resolved = false 
      GROUP BY severity
    `;
    
    // Get the latest anomalies regardless of resolved status
    const latestAnomalies = await prisma.anomaly.findMany({
      where: {
        accountId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        type: true,
        severity: true,
        description: true,
        resolved: true,
        createdAt: true,
        resourceType: true,
        resourceId: true,
      },
    });
    
    // Construct the detail view URLs for each anomaly
    const anomaliesWithUrls = latestAnomalies.map(anomaly => ({
      ...anomaly,
      detailUrl: `/anomaly-center/detail/${anomaly.id}`,
      resourceUrl: anomaly.resourceType && anomaly.resourceId 
        ? `/${anomaly.resourceType.toLowerCase()}-center/detail/${anomaly.resourceId}`
        : null,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        totalActive: activeAnomalies.length,
        byType: anomalyTypeCounts,
        bySeverity: anomalySeverityCounts,
        latestAnomalies: anomaliesWithUrls,
        stats: {
          critical: activeAnomalies.filter(a => a.severity === 'critical').length,
          high: activeAnomalies.filter(a => a.severity === 'high').length,
          medium: activeAnomalies.filter(a => a.severity === 'medium').length,
          low: activeAnomalies.filter(a => a.severity === 'low').length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching anomaly statistics:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 