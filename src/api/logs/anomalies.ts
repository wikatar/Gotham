import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Report a new anomaly
export async function reportAnomaly(
  accountId: string,
  type: string,
  severity: string,
  description: string,
  resourceId?: string,
  resourceType?: string,
  metadata?: any
) {
  console.log('stub: reportAnomaly');
  
  try {
    const anomaly = await prisma.anomaly.create({
      data: {
        accountId,
        type,
        severity,
        description,
        resourceId,
        resourceType,
        metadata,
        resolved: false,
      },
    });
    
    return anomaly;
  } catch (error) {
    console.error('Error reporting anomaly:', error);
    throw error;
  }
}

// Resolve an anomaly
export async function resolveAnomaly(id: string, accountId: string) {
  console.log('stub: resolveAnomaly');
  
  try {
    const anomaly = await prisma.anomaly.update({
      where: {
        id,
        accountId,
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
    
    return anomaly;
  } catch (error) {
    console.error('Error resolving anomaly:', error);
    throw error;
  }
}

// Get account anomalies
export async function getAccountAnomalies(
  accountId: string,
  type?: string,
  severity?: string,
  resolved?: boolean,
  resourceId?: string,
  resourceType?: string,
  limit: number = 100,
  offset: number = 0
) {
  console.log('stub: getAccountAnomalies');
  
  try {
    const whereClause: any = { accountId };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (severity) {
      whereClause.severity = severity;
    }
    
    if (resolved !== undefined) {
      whereClause.resolved = resolved;
    }
    
    if (resourceId) {
      whereClause.resourceId = resourceId;
    }
    
    if (resourceType) {
      whereClause.resourceType = resourceType;
    }
    
    const anomalies = await prisma.anomaly.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    return anomalies;
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    throw error;
  }
} 