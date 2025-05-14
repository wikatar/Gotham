// Model metadata module
// Provides functionality for managing model metadata

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for model performance metrics
const modelPerformanceSchema = z.object({
  accountId: z.string().uuid(),
  modelId: z.string().uuid(),
  metrics: z.object({
    accuracy: z.number().min(0).max(1).optional(),
    precision: z.number().min(0).max(1).optional(),
    recall: z.number().min(0).max(1).optional(),
    f1Score: z.number().min(0).max(1).optional(),
    roc_auc: z.number().min(0).max(1).optional(),
    rmse: z.number().optional(),
    mae: z.number().optional(),
    r2: z.number().optional(),
    latencyMs: z.number().int().positive().optional(),
    throughput: z.number().positive().optional(),
    customMetrics: z.record(z.number()).optional(),
  }),
  datasetId: z.string().optional(),
  testSetSize: z.number().int().positive().optional(),
  timestamp: z.string().datetime().optional(),
});

// Validation schema for model input/output schema
const ioSchemaSchema = z.object({
  accountId: z.string().uuid(),
  modelId: z.string().uuid(),
  inputSchema: z.record(z.any()),
  outputSchema: z.record(z.any()),
  examples: z.array(z.object({
    input: z.record(z.any()),
    output: z.record(z.any()),
    description: z.string().optional(),
  })).optional(),
});

/**
 * Update model performance metrics
 */
export async function updateModelPerformance(data: z.infer<typeof modelPerformanceSchema>) {
  console.log('stub: updateModelPerformance');
  
  try {
    const validatedData = modelPerformanceSchema.parse(data);
    const { accountId, modelId, metrics } = validatedData;
    
    // Check if model exists and belongs to the account
    const model = await prisma.model.findFirst({
      where: {
        id: modelId,
        accountId,
      },
    });
    
    if (!model) {
      return { success: false, error: 'Model not found or does not belong to the account' };
    }
    
    // Get current metadata
    const currentMetadata = model.metadata as Record<string, any> || {};
    
    // Update with new performance metrics
    const updatedMetadata = {
      ...currentMetadata,
      performance: {
        ...currentMetadata.performance,
        ...metrics,
        lastUpdated: new Date().toISOString(),
        ...(validatedData.datasetId ? { datasetId: validatedData.datasetId } : {}),
        ...(validatedData.testSetSize ? { testSetSize: validatedData.testSetSize } : {}),
        ...(validatedData.timestamp ? { timestamp: validatedData.timestamp } : {}),
      },
    };
    
    // Update the model with new metadata
    const updatedModel = await prisma.model.update({
      where: { id: modelId },
      data: {
        metadata: updatedMetadata,
      },
    });
    
    return { success: true, model: updatedModel };
  } catch (error) {
    console.error('Error updating model performance:', error);
    throw error;
  }
}

/**
 * Update model input/output schema
 */
export async function updateModelSchema(data: z.infer<typeof ioSchemaSchema>) {
  console.log('stub: updateModelSchema');
  
  try {
    const validatedData = ioSchemaSchema.parse(data);
    const { accountId, modelId, inputSchema, outputSchema, examples } = validatedData;
    
    // Check if model exists and belongs to the account
    const model = await prisma.model.findFirst({
      where: {
        id: modelId,
        accountId,
      },
    });
    
    if (!model) {
      return { success: false, error: 'Model not found or does not belong to the account' };
    }
    
    // Get current metadata
    const currentMetadata = model.metadata as Record<string, any> || {};
    
    // Update with new schema information
    const updatedMetadata = {
      ...currentMetadata,
      inputSchema,
      outputSchema,
      ...(examples ? { examples } : {}),
      schemaLastUpdated: new Date().toISOString(),
    };
    
    // Update the model with new metadata
    const updatedModel = await prisma.model.update({
      where: { id: modelId },
      data: {
        metadata: updatedMetadata,
      },
    });
    
    return { success: true, model: updatedModel };
  } catch (error) {
    console.error('Error updating model schema:', error);
    throw error;
  }
}

/**
 * Add tags to a model
 */
export async function addModelTags(accountId: string, modelId: string, tags: string[]) {
  console.log('stub: addModelTags');
  
  try {
    // Check if model exists and belongs to the account
    const model = await prisma.model.findFirst({
      where: {
        id: modelId,
        accountId,
      },
    });
    
    if (!model) {
      return { success: false, error: 'Model not found or does not belong to the account' };
    }
    
    // Get current metadata
    const currentMetadata = model.metadata as Record<string, any> || {};
    
    // Get current tags or initialize as empty array
    const currentTags = currentMetadata.tags || [];
    
    // Add new tags (ensure uniqueness)
    const updatedTags = Array.from(new Set([...currentTags, ...tags]));
    
    // Update metadata with new tags
    const updatedMetadata = {
      ...currentMetadata,
      tags: updatedTags,
    };
    
    // Update the model
    const updatedModel = await prisma.model.update({
      where: { id: modelId },
      data: {
        metadata: updatedMetadata,
      },
    });
    
    return { success: true, model: updatedModel };
  } catch (error) {
    console.error('Error adding model tags:', error);
    throw error;
  }
}

/**
 * Remove tags from a model
 */
export async function removeModelTags(accountId: string, modelId: string, tags: string[]) {
  console.log('stub: removeModelTags');
  
  try {
    // Check if model exists and belongs to the account
    const model = await prisma.model.findFirst({
      where: {
        id: modelId,
        accountId,
      },
    });
    
    if (!model) {
      return { success: false, error: 'Model not found or does not belong to the account' };
    }
    
    // Get current metadata
    const currentMetadata = model.metadata as Record<string, any> || {};
    
    // Get current tags or initialize as empty array
    const currentTags = currentMetadata.tags || [];
    
    // Remove tags
    const updatedTags = currentTags.filter((tag: string) => !tags.includes(tag));
    
    // Update metadata with new tags
    const updatedMetadata = {
      ...currentMetadata,
      tags: updatedTags,
    };
    
    // Update the model
    const updatedModel = await prisma.model.update({
      where: { id: modelId },
      data: {
        metadata: updatedMetadata,
      },
    });
    
    return { success: true, model: updatedModel };
  } catch (error) {
    console.error('Error removing model tags:', error);
    throw error;
  }
}

/**
 * Get model metadata
 */
export async function getModelMetadata(accountId: string, modelId: string) {
  console.log('stub: getModelMetadata');
  
  try {
    // Check if model exists and belongs to the account
    const model = await prisma.model.findFirst({
      where: {
        id: modelId,
        accountId,
      },
    });
    
    if (!model) {
      return { success: false, error: 'Model not found or does not belong to the account' };
    }
    
    // Get metadata
    const metadata = model.metadata || {};
    
    return { success: true, metadata };
  } catch (error) {
    console.error('Error getting model metadata:', error);
    throw error;
  }
} 