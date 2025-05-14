// API endpoint for managing pipeline schedules

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for creating a schedule
const CreateScheduleSchema = z.object({
  pipelineId: z.string().uuid(),
  accountId: z.string().uuid(),
  cron: z.string().min(9).max(100), // Basic validation for cron expression format
  active: z.boolean().default(true)
});

// Schema for updating a schedule
const UpdateScheduleSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  cron: z.string().min(9).max(100).optional(),
  active: z.boolean().optional()
});

// Create a new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateScheduleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { pipelineId, accountId, cron, active } = result.data;
    
    // Check if the pipeline exists and belongs to the account
    const pipeline = await prisma.pipeline.findUnique({
      where: {
        id: pipelineId,
        accountId
      }
    });
    
    if (!pipeline) {
      return NextResponse.json({ 
        error: 'Pipeline not found or does not belong to the account' 
      }, { status: 404 });
    }
    
    // Create the schedule
    const schedule = await prisma.pipelineSchedule.create({
      data: {
        pipelineId,
        accountId,
        cron,
        active
      }
    });
    
    // Log the schedule creation
    await prisma.log.create({
      data: {
        accountId,
        type: 'pipeline_schedule_created',
        action: `Schedule created for pipeline "${pipeline.name}"`,
        resourceId: pipelineId,
        resourceType: 'pipeline',
        metadata: {
          scheduleId: schedule.id,
          cron,
          active
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      schedule 
    });
  } catch (error) {
    console.error('Error creating pipeline schedule:', error);
    return NextResponse.json({ 
      error: 'Failed to create pipeline schedule',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// Get schedules for a pipeline
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get('pipelineId');
    const accountId = searchParams.get('accountId');
    
    if (!pipelineId || !accountId) {
      return NextResponse.json({ 
        error: 'pipelineId and accountId are required' 
      }, { status: 400 });
    }
    
    // Get schedules for the pipeline
    const schedules = await prisma.pipelineSchedule.findMany({
      where: {
        pipelineId,
        accountId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      schedules 
    });
  } catch (error) {
    console.error('Error getting pipeline schedules:', error);
    return NextResponse.json({ 
      error: 'Failed to get pipeline schedules',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// Update a schedule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = UpdateScheduleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    const { id, accountId, cron, active } = result.data;
    
    // Check if the schedule exists and belongs to the account
    const existingSchedule = await prisma.pipelineSchedule.findUnique({
      where: {
        id,
        accountId
      },
      include: {
        pipeline: true
      }
    });
    
    if (!existingSchedule) {
      return NextResponse.json({ 
        error: 'Schedule not found or does not belong to the account' 
      }, { status: 404 });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (cron !== undefined) updateData.cron = cron;
    if (active !== undefined) updateData.active = active;
    
    // Update the schedule
    const schedule = await prisma.pipelineSchedule.update({
      where: {
        id
      },
      data: updateData
    });
    
    // Log the schedule update
    await prisma.log.create({
      data: {
        accountId,
        type: 'pipeline_schedule_updated',
        action: `Schedule updated for pipeline "${existingSchedule.pipeline.name}"`,
        resourceId: existingSchedule.pipelineId,
        resourceType: 'pipeline',
        metadata: {
          scheduleId: id,
          changes: updateData
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      schedule 
    });
  } catch (error) {
    console.error('Error updating pipeline schedule:', error);
    return NextResponse.json({ 
      error: 'Failed to update pipeline schedule',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// Delete a schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const accountId = searchParams.get('accountId');
    
    if (!id || !accountId) {
      return NextResponse.json({ 
        error: 'id and accountId are required' 
      }, { status: 400 });
    }
    
    // Check if the schedule exists and belongs to the account
    const existingSchedule = await prisma.pipelineSchedule.findUnique({
      where: {
        id,
        accountId
      },
      include: {
        pipeline: true
      }
    });
    
    if (!existingSchedule) {
      return NextResponse.json({ 
        error: 'Schedule not found or does not belong to the account' 
      }, { status: 404 });
    }
    
    // Delete the schedule
    await prisma.pipelineSchedule.delete({
      where: {
        id
      }
    });
    
    // Log the schedule deletion
    await prisma.log.create({
      data: {
        accountId,
        type: 'pipeline_schedule_deleted',
        action: `Schedule deleted for pipeline "${existingSchedule.pipeline.name}"`,
        resourceId: existingSchedule.pipelineId,
        resourceType: 'pipeline',
        metadata: {
          scheduleId: id
        }
      }
    });
    
    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error deleting pipeline schedule:', error);
    return NextResponse.json({ 
      error: 'Failed to delete pipeline schedule',
      message: (error as Error).message
    }, { status: 500 });
  }
} 