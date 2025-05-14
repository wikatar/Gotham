/**
 * Setup Sample Cleaning Pipelines
 * 
 * This script creates sample data cleaning pipelines for the ETL system demo.
 * 
 * Usage: 
 *   npx ts-node -r tsconfig-paths/register scripts/setup-cleaning-pipelines.ts
 */

import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('🚀 Setting up sample cleaning pipelines')
  
  try {
    const prisma = new PrismaClient()
    
    // Check if we already have pipelines
    const existingPipelines = await prisma.dataCleaningPipeline.findMany({
      take: 1,
    })
    
    if (existingPipelines.length > 0) {
      console.log('✅ Sample pipelines already exist')
      return
    }
    
    // Get sample data sources
    const dataSources = await prisma.dataSource.findMany({
      take: 10,
    })
    
    if (dataSources.length === 0) {
      console.log('❌ No data sources found. Please create data sources first.')
      return
    }
    
    // Create user data cleaning pipeline
    const userPipeline = await prisma.dataCleaningPipeline.create({
      data: {
        sourceId: dataSources[0].id,
        name: 'Basic User Data Cleaning',
        steps: [
          {
            type: 'extractFields',
            fields: ['id', 'name', 'email', 'age', 'active', 'createdAt']
          },
          {
            type: 'renameFields',
            mapping: {
              name: 'fullName'
            }
          },
          {
            type: 'formatDate',
            fields: ['createdAt']
          }
        ]
      }
    })
    console.log(`✅ Created user data cleaning pipeline: ${userPipeline.id}`)
    
    // Create transaction data cleaning pipeline
    const transactionPipeline = await prisma.dataCleaningPipeline.create({
      data: {
        sourceId: dataSources[0].id,
        name: 'Transaction Data Formatting',
        steps: [
          {
            type: 'extractFields',
            fields: ['id', 'userId', 'amount', 'currency', 'status', 'timestamp']
          },
          {
            type: 'formatDate',
            fields: ['timestamp']
          },
          {
            type: 'calculateFields',
            calculations: [
              {
                type: 'concat',
                target: 'transactionRef',
                fields: ['id', 'userId'],
                separator: '-'
              }
            ]
          }
        ]
      }
    })
    console.log(`✅ Created transaction data cleaning pipeline: ${transactionPipeline.id}`)
    
    // Create location data cleaning pipeline
    const locationPipeline = await prisma.dataCleaningPipeline.create({
      data: {
        sourceId: dataSources[0].id,
        name: 'Location Data Normalization',
        steps: [
          {
            type: 'extractFields',
            fields: ['id', 'name', 'latitude', 'longitude', 'type', 'createdAt']
          },
          {
            type: 'renameFields',
            mapping: {
              latitude: 'lat',
              longitude: 'lng'
            }
          },
          {
            type: 'formatDate',
            fields: ['createdAt']
          }
        ]
      }
    })
    console.log(`✅ Created location data cleaning pipeline: ${locationPipeline.id}`)
    
    console.log('✅ All sample cleaning pipelines created successfully')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error setting up sample pipelines:', error)
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
}) 