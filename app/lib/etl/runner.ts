import { syncService } from '@/app/lib/services/SyncService'
import { PrismaClient } from '@prisma/client'
import { db } from '@/app/lib/db'

/**
 * ETL Runner - Checks and executes ETL tasks based on their schedule
 */
export class ETLRunner {
  private db: PrismaClient;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private intervalMs: number = 30000; // 30 seconds

  constructor(dbInstance?: PrismaClient) {
    this.db = dbInstance || db;
  }

  /**
   * Start the ETL runner with the specified check interval
   */
  start(intervalMs?: number) {
    if (this.intervalId) {
      console.log('ETL Runner is already running');
      return;
    }

    if (intervalMs) {
      this.intervalMs = intervalMs;
    }

    console.log(`Starting ETL Runner with ${this.intervalMs}ms interval`);
    
    // Run immediately on start
    this.checkAndRunTasks();
    
    // Then set up the interval
    this.intervalId = setInterval(() => {
      this.checkAndRunTasks();
    }, this.intervalMs);
  }

  /**
   * Stop the ETL runner
   */
  stop() {
    if (this.intervalId) {
      console.log('Stopping ETL Runner');
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check for pending tasks and run them
   */
  async checkAndRunTasks() {
    if (this.isRunning) {
      console.log('ETL check is already in progress, skipping this cycle');
      return;
    }

    this.isRunning = true;
    console.log('ETL Runner: Checking for tasks to execute...');

    try {
      // Use the SyncService's executeScheduledSyncs method which already has this functionality
      await syncService.executeScheduledSyncs();
    } catch (error) {
      console.error('Error in ETL Runner:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

// Create a singleton instance
export const etlRunner = new ETLRunner(db); 