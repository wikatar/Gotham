import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAccountLogs } from '@/src/api/logs/actions';
import { getAccountAnomalies, reportAnomaly, resolveAnomaly } from '@/src/api/logs/anomalies';
import { z } from 'zod';

const prisma = new PrismaClient();

// Get logs 
export async function GET(request: NextRequest) {
  console.log('stub: GET /api/logs');
  
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }
    
    const type = searchParams.get('type') || undefined;
    const resourceId = searchParams.get('resourceId') || undefined;
    const resourceType = searchParams.get('resourceType') || undefined;
    const anomaliesOnly = searchParams.get('anomaliesOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (anomaliesOnly) {
      const resolved = searchParams.get('resolved') === 'true';
      const severity = searchParams.get('severity') || undefined;
      
      const anomalies = await getAccountAnomalies(
        accountId,
        type,
        severity,
        resolved,
        resourceId,
        resourceType,
        limit,
        offset
      );
      
      return NextResponse.json({ anomalies });
    } else {
      const logs = await getAccountLogs(
        accountId,
        type,
        resourceId,
        resourceType,
        limit,
        offset
      );
      
      return NextResponse.json({ logs });
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

// Create log or report anomaly
export async function POST(request: NextRequest) {
  console.log('stub: POST /api/logs');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      accountId: z.string().uuid(),
      type: z.string(),
      isAnomaly: z.boolean().optional(),
      action: z.string().optional(),
      severity: z.string().optional(),
      description: z.string().optional(),
      resourceId: z.string().optional(),
      resourceType: z.string().optional(),
      metadata: z.any().optional(),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { 
      accountId,
      type,
      isAnomaly,
      action,
      severity,
      description,
      resourceId,
      resourceType,
      metadata
    } = result.data;
    
    if (isAnomaly) {
      if (!severity || !description) {
        return NextResponse.json({ 
          error: 'severity and description are required for anomalies' 
        }, { status: 400 });
      }
      
      const anomaly = await reportAnomaly(
        accountId,
        type,
        severity,
        description,
        resourceId,
        resourceType,
        metadata
      );
      
      return NextResponse.json({ anomaly });
    } else {
      if (!action) {
        return NextResponse.json({ 
          error: 'action is required for logs' 
        }, { status: 400 });
      }
      
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
      
      return NextResponse.json({ log });
    }
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}

// Resolve anomaly
export async function PATCH(request: NextRequest) {
  console.log('stub: PATCH /api/logs');
  
  try {
    const body = await request.json();
    
    // Validate input schema
    const schema = z.object({
      accountId: z.string().uuid(),
      anomalyId: z.string().uuid(),
    });
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { accountId, anomalyId } = result.data;
    
    const anomaly = await resolveAnomaly(anomalyId, accountId);
    
    return NextResponse.json({ anomaly });
  } catch (error) {
    console.error('Error resolving anomaly:', error);
    return NextResponse.json({ error: 'Failed to resolve anomaly' }, { status: 500 });
  }
} 