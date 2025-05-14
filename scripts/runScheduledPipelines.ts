// Script to run scheduled pipelines
// This can be executed by a cron job or serverless function on a regular schedule

import { PrismaClient } from '@prisma/client';
import { cronMatches } from '@/src/utils/cronUtils';

const prisma = new PrismaClient();

/**
 * Run all scheduled pipelines that match the current time
 */
export async function runScheduledPipelines() {
  console.log('Running scheduled pipelines at', new Date().toISOString());
  
  try {
    const now = new Date();
    
    // Find all active pipeline schedules
    const schedules = await prisma.pipelineSchedule.findMany({
      where: { 
        active: true 
      },
      include: {
        pipeline: true
      }
    });
    
    console.log(`Found ${schedules.length} active schedules`);
    
    // Process each schedule
    for (const schedule of schedules) {
      try {
        // Check if this schedule should run now based on its cron expression
        if (cronMatches(schedule.cron, now)) {
          console.log(`Schedule ${schedule.id} for pipeline ${schedule.pipeline.name} matches current time`);
          
          // Log the execution
          await prisma.log.create({
            data: {
              accountId: schedule.accountId,
              type: 'pipeline_schedule_trigger',
              action: `Scheduled execution of pipeline "${schedule.pipeline.name}"`,
              resourceId: schedule.pipelineId,
              resourceType: 'pipeline',
              metadata: {
                scheduleId: schedule.id,
                cron: schedule.cron
              }
            }
          });
          
          // Update last run time
          await prisma.pipelineSchedule.update({
            where: { 
              id: schedule.id 
            },
            data: { 
              lastRunAt: now 
            }
          });
          
          // Execute the pipeline
          // In a real implementation, this would call the pipeline execution API
          // For now, we're just logging it
          console.log(`Executing pipeline ${schedule.pipeline.name} (${schedule.pipelineId})`);
          
          // Make API call to execute pipeline
          const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/api/pipeline/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pipeline: schedule.pipeline,
              input: {}, // Empty input data (would be populated from a data source in a real implementation)
              accountId: schedule.accountId
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Pipeline execution failed: ${errorData.message || response.statusText}`);
          }
          
          console.log(`Pipeline ${schedule.pipeline.name} executed successfully`);
        }
      } catch (error) {
        console.error(`Error processing schedule ${schedule.id}:`, error);
        
        // Log the error
        await prisma.log.create({
          data: {
            accountId: schedule.accountId,
            type: 'pipeline_schedule_error',
            action: `Error executing scheduled pipeline "${schedule.pipeline.name}"`,
            resourceId: schedule.pipelineId,
            resourceType: 'pipeline',
            metadata: {
              scheduleId: schedule.id,
              error: (error as Error).message
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error running scheduled pipelines:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// If this script is run directly
if (require.main === module) {
  runScheduledPipelines()
    .then(() => {
      console.log('Finished running scheduled pipelines');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error running scheduled pipelines:', error);
      process.exit(1);
    });
} 