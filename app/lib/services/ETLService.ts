import { db } from '@/app/lib/db'
import { SyncService } from './SyncService'
import axios from 'axios'

/**
 * Service to handle ETL operations
 */
export class ETLService {
  private syncService: SyncService;
  
  constructor() {
    this.syncService = new SyncService(db);
  }
  
  /**
   * Run ETL for a specific task
   */
  async runETLForTask(taskId: string): Promise<{
    success: boolean;
    recordCount: number;
    cleanedCount?: number;
    error?: string;
  }> {
    try {
      // Get the task
      const task = await db.dataSourceSync.findUnique({
        where: { id: taskId },
        include: {
          dataSource: true,
        },
      });

      if (!task) {
        throw new Error(`ETL task with ID ${taskId} not found`);
      }

      console.log(`🔄 Running ETL for task: ${task.name}`);

      // Get the data source
      const dataSource = task.dataSource;
      if (!dataSource) {
        throw new Error(`Data source not found for task ${taskId}`);
      }

      // Run the fetch operation using the SyncService
      const result = await this.syncService.executeSync(taskId, 'manual');

      // Check if we should run the cleaning pipeline
      if (result.success && task.runPipeline && task.pipelineId) {
        try {
          const cleaningResult = await this.runCleaningPipeline(dataSource.id, task.pipelineId);
          console.log(`✅ Cleaning pipeline completed: ${cleaningResult.recordCount} records cleaned`);
          
          return {
            ...result,
            cleanedCount: cleaningResult.recordCount,
          };
        } catch (cleaningError) {
          console.error('Error running cleaning pipeline:', cleaningError);
          return {
            ...result,
            error: `Data fetched successfully but cleaning failed: ${(cleaningError as Error).message}`,
          };
        }
      }

      return result;
    } catch (error) {
      console.error('Error running ETL task:', error);
      return {
        success: false,
        recordCount: 0,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Run a cleaning pipeline on data rows
   */
  async runCleaningPipeline(sourceId: string, pipelineId: string): Promise<{
    success: boolean;
    recordCount: number;
    error?: string;
  }> {
    try {
      // Get the pipeline
      const pipeline = await db.dataCleaningPipeline.findUnique({
        where: { id: pipelineId },
      });

      if (!pipeline) {
        throw new Error(`Cleaning pipeline with ID ${pipelineId} not found`);
      }

      console.log(`🧹 Running cleaning pipeline: ${pipeline.name}`);

      // Get the most recent data rows for this source
      // Limit to the most recent 1000 for performance
      const rows = await db.dataRow.findMany({
        where: { sourceId },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      });

      if (rows.length === 0) {
        console.log(`No data rows found for source ${sourceId}`);
        return {
          success: true,
          recordCount: 0,
        };
      }

      console.log(`Found ${rows.length} data rows to clean`);

      // Parse the pipeline steps
      const steps = pipeline.steps as any[];
      
      // Process each row through the pipeline
      const cleanedRows = [];
      
      for (const row of rows) {
        try {
          let data = row.row as any;
          
          // Apply each step to the data
          for (const step of steps) {
            data = this.executeCleaningStep(data, step);
          }
          
          // Create a cleaned row
          cleanedRows.push({
            sourceId,
            pipelineId,
            row: data,
          });
        } catch (rowError) {
          console.error(`Error cleaning row ${row.id}:`, rowError);
          // Continue with other rows even if one fails
        }
      }
      
      // Save the cleaned rows in batches to avoid transaction size limits
      const batchSize = 100;
      let savedCount = 0;
      
      for (let i = 0; i < cleanedRows.length; i += batchSize) {
        const batch = cleanedRows.slice(i, i + batchSize);
        
        const created = await db.$transaction(
          batch.map(row => 
            db.cleanedRow.create({
              data: row,
            })
          )
        );
        
        savedCount += created.length;
      }
      
      console.log(`✅ Saved ${savedCount} cleaned rows`);
      
      return {
        success: true,
        recordCount: savedCount,
      };
    } catch (error) {
      console.error('Error running cleaning pipeline:', error);
      return {
        success: false,
        recordCount: 0,
        error: (error as Error).message,
      };
    }
  }
  
  /**
   * Execute a single cleaning step on the data
   */
  private executeCleaningStep(data: any, step: any): any {
    switch (step.type) {
      case 'extractFields':
        // Extract only specified fields
        const result: any = {};
        for (const field of step.fields) {
          if (data[field]) {
            result[field] = data[field];
          }
        }
        return result;
        
      case 'renameFields':
        // Rename fields according to mapping
        const renamedData = { ...data };
        for (const [oldName, newName] of Object.entries(step.mapping)) {
          if (renamedData[oldName] !== undefined) {
            renamedData[newName as string] = renamedData[oldName];
            delete renamedData[oldName];
          }
        }
        return renamedData;
        
      case 'formatDate':
        // Format date fields
        const formattedData = { ...data };
        for (const field of step.fields) {
          if (formattedData[field]) {
            try {
              const date = new Date(formattedData[field]);
              formattedData[field] = date.toISOString();
            } catch (e) {
              // If date parsing fails, leave the field as-is
            }
          }
        }
        return formattedData;
        
      case 'calculateFields':
        // Add calculated fields
        const calculatedData = { ...data };
        for (const calc of step.calculations) {
          try {
            // Simple implementation for demonstration
            // In a real system, you'd want a safer way to execute calculations
            if (calc.type === 'sum') {
              calculatedData[calc.target] = calc.fields.reduce(
                (sum: number, field: string) => sum + (Number(calculatedData[field]) || 0), 
                0
              );
            } else if (calc.type === 'concat') {
              calculatedData[calc.target] = calc.fields
                .map((field: string) => calculatedData[field] || '')
                .join(calc.separator || '');
            }
          } catch (e) {
            console.error(`Error in calculation ${calc.target}:`, e);
          }
        }
        return calculatedData;
        
      default:
        // For unknown step types, just pass the data through
        return data;
    }
  }
}

// Create singleton instance
export const etlService = new ETLService(); 