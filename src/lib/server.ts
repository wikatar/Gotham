import { initSnapshotScheduler } from './schedulers/snapshotScheduler';

// Tracked interval IDs for clean shutdown
const schedulers: { [key: string]: NodeJS.Timeout } = {};

/**
 * Initialize all background processes and schedulers
 */
export function initializeBackgroundProcesses() {
  // Initialize control panel snapshot scheduler
  schedulers.snapshot = initSnapshotScheduler();
  
  // Log successful initialization
  console.log('All background processes initialized');
  
  // Add more schedulers here as needed
}

/**
 * Gracefully shutdown all background processes
 */
export function shutdownBackgroundProcesses() {
  // Clear all schedulers
  Object.entries(schedulers).forEach(([name, intervalId]) => {
    console.log(`Shutting down ${name} scheduler`);
    clearInterval(intervalId);
  });
  
  console.log('All background processes shut down');
} 