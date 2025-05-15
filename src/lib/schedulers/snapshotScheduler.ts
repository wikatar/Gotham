import { updateControlPanelSnapshot } from '../snapshots/updateControlPanelSnapshot';

/**
 * Initializes the snapshot scheduler to run every 10 minutes
 */
export function initSnapshotScheduler() {
  console.log('Initializing control panel snapshot scheduler');
  
  // Run immediately on startup
  updateControlPanelSnapshot().catch(err => {
    console.error('Initial snapshot update failed:', err);
  });
  
  // Schedule to run every 10 minutes (600000 ms)
  const intervalId = setInterval(() => {
    updateControlPanelSnapshot().catch(err => {
      console.error('Scheduled snapshot update failed:', err);
    });
  }, 10 * 60 * 1000);
  
  // Return the interval ID so it can be cleared if needed
  return intervalId;
}

/**
 * Stops the snapshot scheduler
 */
export function stopSnapshotScheduler(intervalId: NodeJS.Timeout) {
  console.log('Stopping control panel snapshot scheduler');
  clearInterval(intervalId);
} 