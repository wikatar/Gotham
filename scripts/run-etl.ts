/**
 * Manual ETL Runner Script
 * 
 * This script can be used to manually trigger ETL jobs from the command line.
 * 
 * Usage: 
 *   npx ts-node -r tsconfig-paths/register scripts/run-etl.ts
 */

import { PrismaClient } from '@prisma/client'
import { syncService } from '../app/lib/services/SyncService'

async function main() {
  console.log('🚀 Starting manual ETL run')
  
  try {
    // Run all scheduled syncs
    await syncService.executeScheduledSyncs()
    
    console.log('✅ Manual ETL run completed')
  } catch (error) {
    console.error('❌ Error during manual ETL run:', error)
  } finally {
    // Clean up any resources
    const prisma = new PrismaClient()
    await prisma.$disconnect()
    process.exit(0)
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
}) 