import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Log an action
export async function logAction(
  accountId: string,
  type: string, 
  action: string,
  resourceId?: string,
  resourceType?: string,
  metadata?: any
) {
  console.log('stub: logAction');
  
  try {
    const log = await prisma.log.create({
      data: {
        accountId,
        type,
        action,
        resourceId,
        resourceType,
        metadata,
      },
    });
    
    return log;
  } catch (error) {
    console.error('Error logging action:', error);
    throw error;
  }
}

// Get logs for an account
export async function getAccountLogs(
  accountId: string,
  type?: string,
  resourceId?: string,
  resourceType?: string,
  limit: number = 100,
  offset: number = 0
) {
  console.log('stub: getAccountLogs');
  
  try {
    const whereClause: any = { accountId };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (resourceId) {
      whereClause.resourceId = resourceId;
    }
    
    if (resourceType) {
      whereClause.resourceType = resourceType;
    }
    
    const logs = await prisma.log.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
} 