import { db } from '@/app/lib/db'
import axios from 'axios'
import { parse as csvParse } from 'csv-parse/sync'
import { PrismaClient } from '@prisma/client'
import { setTimeout } from 'timers/promises'
import cron from 'node-cron'

// Types
export type SyncConfig = {
  api?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
    dataPath?: string; // JSONPath to extract data array
  };
  database?: {
    connectionString?: string;
    host?: string;
    port?: string;
    username?: string;
    password?: string;
    database?: string;
    query: string;
  };
  file?: {
    type: 'csv' | 'json' | 'xml';
    path?: string;
    delimiter?: string;
    hasHeader?: boolean;
  };
};

export interface SyncResult {
  success: boolean;
  recordCount: number;
  error?: string;
  details?: any;
}

// Main Service class
export class SyncService {
  private db: PrismaClient;
  private activeJobs: Map<string, boolean> = new Map();

  constructor(dbInstance?: PrismaClient) {
    this.db = dbInstance || db;
  }

  // Get all sync configurations
  async getAllSyncs(accountId: string) {
    try {
      return this.db.dataSourceSync.findMany({
        where: { accountId },
        include: {
          dataSource: true,
        },
      });
    } catch (error) {
      // In development mode, return empty array if database is not available
      if (process.env.NODE_ENV === 'development') {
        console.log('📝 Database not available, returning empty sync list for development');
        return [];
      }
      throw error;
    }
  }

  // Get sync by ID
  async getSyncById(syncId: string) {
    return this.db.dataSourceSync.findUnique({
      where: { id: syncId },
      include: {
        dataSource: true,
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  // Create or update a sync configuration
  async upsertSync(data: any) {
    const { id, sourceId, accountId, ...syncData } = data;

    // If updating, first check if it exists
    if (id) {
      const existing = await this.db.dataSourceSync.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new Error(`Sync configuration with ID ${id} not found`);
      }
    }

    // Calculate nextSyncAt based on schedule type
    let nextSyncAt: Date | null = null;
    if (syncData.syncType === 'interval' && syncData.interval) {
      nextSyncAt = new Date(Date.now() + syncData.interval * 60 * 1000);
    } else if (syncData.syncType === 'cron' && syncData.cron) {
      try {
        // Validate cron expression
        if (!cron.validate(syncData.cron)) {
          throw new Error('Invalid cron expression');
        }
        // Get next execution time
        nextSyncAt = this.getNextCronTime(syncData.cron);
      } catch (error) {
        throw new Error(`Invalid cron expression: ${syncData.cron}`);
      }
    }

    return this.db.dataSourceSync.upsert({
      where: { id: id || 'create-new' },
      update: {
        ...syncData,
        nextSyncAt,
        updatedAt: new Date(),
      },
      create: {
        sourceId,
        accountId,
        ...syncData,
        nextSyncAt,
      },
    });
  }

  // Activate or deactivate a sync
  async toggleSyncActive(syncId: string, active: boolean) {
    return this.db.dataSourceSync.update({
      where: { id: syncId },
      data: { active },
    });
  }

  // Execute a sync job
  async executeSync(syncId: string, triggeredBy: string = 'user'): Promise<SyncResult> {
    // Check if already running
    if (this.activeJobs.get(syncId)) {
      return {
        success: false,
        recordCount: 0,
        error: 'Sync is already in progress',
      };
    }

    // Mark as running
    this.activeJobs.set(syncId, true);

    try {
      // Get the sync configuration
      const sync = await this.db.dataSourceSync.findUnique({
        where: { id: syncId },
        include: { dataSource: true },
      });

      if (!sync) {
        throw new Error(`Sync configuration with ID ${syncId} not found`);
      }

      // Create a log entry
      const log = await this.db.dataSyncLog.create({
        data: {
          syncId,
          sourceId: sync.sourceId,
          status: 'pending',
          triggeredBy,
        },
      });

      let result: SyncResult;

      try {
        // Execute the sync based on the source type
        const config = sync.config as SyncConfig;
        let data: any[] = [];

        if (config.api) {
          data = await this.fetchFromApi(config.api);
        } else if (config.database) {
          data = await this.fetchFromDatabase(config.database);
        } else if (config.file) {
          data = await this.fetchFromFile(config.file);
        } else {
          throw new Error('Unsupported data source configuration');
        }

        // Save the fetched data
        await this.saveData(sync.sourceId, data);

        // If configured, run the cleaning pipeline
        if (sync.runPipeline && sync.pipelineId) {
          await this.runCleaningPipeline(sync.sourceId, sync.pipelineId);
        }

        // Update the sync record
        await this.db.dataSourceSync.update({
          where: { id: syncId },
          data: {
            lastSyncAt: new Date(),
            nextSyncAt: this.calculateNextSyncTime(sync),
          },
        });

        // Update the log with success
        await this.db.dataSyncLog.update({
          where: { id: log.id },
          data: {
            status: 'success',
            endedAt: new Date(),
            recordCount: data.length,
            details: { recordSample: data.slice(0, 2) },
          },
        });

        result = {
          success: true,
          recordCount: data.length,
          details: { syncId, logId: log.id },
        };
      } catch (error: any) {
        // Update the log with error
        await this.db.dataSyncLog.update({
          where: { id: log.id },
          data: {
            status: 'error',
            endedAt: new Date(),
            error: error.message,
          },
        });

        result = {
          success: false,
          recordCount: 0,
          error: error.message,
        };
      }

      return result;
    } finally {
      // Mark as not running
      this.activeJobs.set(syncId, false);
    }
  }

  // Run the schedule job for all active syncs
  async executeScheduledSyncs() {
    console.log('⏳ Checking for scheduled syncs...');
    
    // Skip database operations in development if no database is available
    if (process.env.NODE_ENV === 'development') {
      try {
        // Test database connection
        await this.db.$queryRaw`SELECT 1`;
      } catch (error) {
        console.log('📝 Database not available, skipping scheduled syncs in development mode');
        return;
      }
    }
    
    // Get all active syncs that are due to run
    const now = new Date();
    const dueSyncs = await this.db.dataSourceSync.findMany({
      where: {
        active: true,
        nextSyncAt: {
          lte: now,
        },
      },
      include: {
        dataSource: true,
      },
    });

    if (dueSyncs.length === 0) {
      console.log('✓ No syncs due to run at this time.');
      return;
    }

    console.log(`🔄 Found ${dueSyncs.length} syncs due to run`);

    // Execute each sync
    for (const sync of dueSyncs) {
      try {
        console.log(`⚙️ Executing scheduled sync: ${sync.id} - ${sync.name} for data source: ${sync.dataSource.name}`);
        
        // Get time before execution for logging
        const startTime = Date.now();
        const result = await this.executeSync(sync.id, 'system');
        const executionTime = Date.now() - startTime;
        
        if (result.success) {
          console.log(`✅ Successfully synced ${result.recordCount} records in ${executionTime}ms for ${sync.name}`);
          if (sync.runPipeline && sync.pipelineId) {
            console.log(`🧹 Triggered cleaning pipeline ${sync.pipelineId} for synced data`);
          }
        } else {
          console.error(`❌ Sync failed for ${sync.name}: ${result.error}`);
        }
      } catch (error) {
        console.error(`⚠️ Error executing sync ${sync.id}:`, error);
      }
    }

    console.log('✓ Completed scheduled sync check');
  }

  // Helper methods
  private async fetchFromApi(config: SyncConfig['api']): Promise<any[]> {
    if (!config) throw new Error('API configuration is missing');

    // Mock data for local development and testing
    // This allows testing without actual external API endpoints
    if (config.url === 'mock://data' || process.env.NODE_ENV === 'development' && config.url.includes('mock')) {
      console.log('🔄 Using mock data source for development');
      return this.generateMockData(config.queryParams?.type);
    }

    const { url, method, headers, queryParams, body, dataPath } = config;
    
    try {
      const response = await axios({
        method: method || 'GET',
        url,
        headers,
        params: queryParams,
        data: body,
      });

      // Extract data using dataPath if provided
      let data = response.data;
      if (dataPath) {
        // Simple path extraction (for complex paths, consider using a library like jsonpath)
        const paths = dataPath.split('.');
        for (const path of paths) {
          if (data && typeof data === 'object') {
            data = data[path];
          } else {
            throw new Error(`Invalid data path: ${dataPath}`);
          }
        }
      }

      // Ensure we have an array
      if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
          // If it's an object, convert to array of one element
          data = [data];
        } else {
          throw new Error('API response is not an array or object');
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      throw new Error(`Failed to fetch from API: ${(error as Error).message}`);
    }
  }

  // Helper method to generate mock data for development and testing
  private generateMockData(type: string = 'generic'): any[] {
    const count = Math.floor(Math.random() * 20) + 5; // 5-25 random records
    const data: any[] = [];

    switch (type) {
      case 'users':
        for (let i = 0; i < count; i++) {
          data.push({
            id: `user_${i + 1}`,
            name: `Test User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            age: Math.floor(Math.random() * 50) + 18,
            active: Math.random() > 0.2,
            createdAt: new Date().toISOString()
          });
        }
        break;

      case 'transactions':
        for (let i = 0; i < count; i++) {
          data.push({
            id: `txn_${i + 1}`,
            userId: `user_${Math.floor(Math.random() * 10) + 1}`,
            amount: +(Math.random() * 1000).toFixed(2),
            currency: 'USD',
            status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'locations':
        for (let i = 0; i < count; i++) {
          // Generate random coordinates around the world
          const lat = (Math.random() * 180) - 90;
          const lng = (Math.random() * 360) - 180;
          
          data.push({
            id: `loc_${i + 1}`,
            name: `Location ${i + 1}`,
            latitude: +lat.toFixed(6),
            longitude: +lng.toFixed(6),
            type: ['office', 'warehouse', 'store', 'partner'][Math.floor(Math.random() * 4)],
            createdAt: new Date().toISOString()
          });
        }
        break;

      default:
        // Generic data
        for (let i = 0; i < count; i++) {
          data.push({
            id: `item_${i + 1}`,
            name: `Test Item ${i + 1}`,
            value: +(Math.random() * 100).toFixed(2),
            active: Math.random() > 0.3,
            createdAt: new Date().toISOString()
          });
        }
    }

    console.log(`🔄 Generated ${data.length} mock records of type: ${type}`);
    return data;
  }

  private async fetchFromDatabase(config: SyncConfig['database']): Promise<any[]> {
    if (!config) throw new Error('Database configuration is missing');
    
    // This is a placeholder - in a real implementation, you would use 
    // a database client like mysql2, pg, etc.
    console.log('Database sync not yet implemented');
    throw new Error('Database sync not yet implemented');
    
    return [];
  }

  private async fetchFromFile(config: SyncConfig['file']): Promise<any[]> {
    if (!config) throw new Error('File configuration is missing');
    
    // This is a placeholder - in a real implementation, you would use
    // file system access or a file upload API
    console.log('File sync not yet implemented');
    throw new Error('File sync not yet implemented');
    
    return [];
  }

  private async saveData(sourceId: string, data: any[]): Promise<void> {
    // Save data in batches to avoid transaction size limits
    const batchSize = 100;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      await this.db.$transaction(
        batch.map(row => 
          this.db.dataRow.create({
            data: {
              sourceId,
              row,
            },
          })
        )
      );
    }
    
    // Update the record count
    await this.db.dataSource.update({
      where: { id: sourceId },
      data: {
        recordCount: {
          increment: data.length,
        },
      },
    });
  }

  private async runCleaningPipeline(sourceId: string, pipelineId: string): Promise<void> {
    // Import dynamically to avoid circular dependency
    const { etlService } = await import('./ETLService');
    
    console.log(`Running cleaning pipeline ${pipelineId} for source ${sourceId}`);
    
    // Use the ETLService to run the cleaning pipeline
    const result = await etlService.runCleaningPipeline(sourceId, pipelineId);
    
    if (!result.success) {
      console.error(`Failed to run cleaning pipeline: ${result.error}`);
      throw new Error(`Cleaning pipeline failed: ${result.error}`);
    }
    
    console.log(`Cleaning pipeline completed successfully, processed ${result.recordCount} records`);
  }

  private calculateNextSyncTime(sync: any): Date | null {
    if (sync.syncType === 'manual') {
      return null;
    } else if (sync.syncType === 'interval' && sync.interval) {
      return new Date(Date.now() + sync.interval * 60 * 1000);
    } else if (sync.syncType === 'cron' && sync.cron) {
      return this.getNextCronTime(sync.cron);
    }
    return null;
  }

  private getNextCronTime(cronExpression: string): Date {
    // This is a simplified implementation
    // In a production environment, use a robust library to calculate exact next cron time
    const now = new Date();
    
    // Defaults to 1 hour from now for simplicity
    return new Date(now.getTime() + 60 * 60 * 1000);
  }
}

// Create singleton instance
export const syncService = new SyncService(db);