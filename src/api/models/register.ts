// Model registration module
// Provides functionality for registering and managing AI/ML models

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const registerModelSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  endpoint: z.string().url().optional(),
  version: z.string().min(1),
  createdById: z.string().uuid(),
  metadata: z.object({
    modelType: z.enum(['classification', 'regression', 'clustering', 'nlp', 'computer_vision', 'anomaly_detection', 'reinforcement_learning', 'custom']).optional(),
    framework: z.string().optional(),
    inputSchema: z.record(z.any()).optional(),
    outputSchema: z.record(z.any()).optional(),
    performance: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

const updateModelSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  endpoint: z.string().url().optional(),
  version: z.string().min(1).optional(),
  metadata: z.object({
    modelType: z.enum(['classification', 'regression', 'clustering', 'nlp', 'computer_vision', 'anomaly_detection', 'reinforcement_learning', 'custom']).optional(),
    framework: z.string().optional(),
    inputSchema: z.record(z.any()).optional(),
    outputSchema: z.record(z.any()).optional(),
    performance: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * Register a new model
 */
export async function registerModel(
  name: string,
  version: string,
  endpoint: string,
  accountId: string,
  createdById: string,
  description?: string,
  inputSchema?: any,
  outputSchema?: any,
  metadata?: any
) {
  console.log('stub: registerModel');

  try {
    const model = await prisma.model.create({
      data: {
        accountId,
        name,
        version,
        endpoint,
        createdById,
        description,
        metadata: {
          ...(metadata || {}),
          inputSchema,
          outputSchema,
        },
      },
    });

    return model;
  } catch (error) {
    console.error('Error registering model:', error);
    throw error;
  }
}

/**
 * Get a model by ID
 */
export async function getModelById(accountId: string, id: string) {
  console.log('stub: getModelById');
  
  try {
    const model = await prisma.model.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!model) {
      return { success: false, error: 'Model not found' };
    }
    
    return { success: true, model };
  } catch (error) {
    console.error('Error getting model:', error);
    throw error;
  }
}

/**
 * Update a model
 */
export async function updateModel(data: z.infer<typeof updateModelSchema>) {
  console.log('stub: updateModel');
  
  try {
    const validatedData = updateModelSchema.parse(data);
    const { id, accountId, ...updateData } = validatedData;
    
    // Check if model exists and belongs to the account
    const existingModel = await prisma.model.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingModel) {
      return { success: false, error: 'Model not found or does not belong to the account' };
    }
    
    // Update the model
    const model = await prisma.model.update({
      where: { id },
      data: updateData,
    });
    
    return { success: true, model };
  } catch (error) {
    console.error('Error updating model:', error);
    throw error;
  }
}

/**
 * Delete a model
 */
export async function deleteModel(accountId: string, id: string) {
  console.log('stub: deleteModel');
  
  try {
    // Check if model exists and belongs to the account
    const existingModel = await prisma.model.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingModel) {
      return { success: false, error: 'Model not found or does not belong to the account' };
    }
    
    // Check if model has any executions
    const executionsCount = await prisma.modelExecution.count({
      where: { modelId: id },
    });
    
    if (executionsCount > 0) {
      return { 
        success: false, 
        error: 'Cannot delete model because it has executions',
        executionsCount,
      };
    }
    
    // Delete the model
    await prisma.model.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting model:', error);
    throw error;
  }
}

/**
 * List models
 */
export async function listModels({
  accountId,
  createdById,
  modelType,
  search,
  page = 1,
  limit = 20,
}: {
  accountId: string;
  createdById?: string;
  modelType?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  console.log('stub: listModels');
  
  try {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { accountId };
    
    if (createdById) {
      where.createdById = createdById;
    }
    
    // Handle model type filter via metadata
    let metadataFilter = undefined;
    if (modelType) {
      metadataFilter = {
        path: ['modelType'],
        equals: modelType,
      };
    }
    
    // Add search condition if provided
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Get models and total count
    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.model.count({ where }),
    ]);
    
    // Filter by model type if specified (since we can't filter JSON fields in the primary query in some databases)
    const filteredModels = modelType
      ? models.filter(model => 
          model.metadata && 
          typeof model.metadata === 'object' && 
          (model.metadata as any).modelType === modelType
        )
      : models;
    
    return {
      success: true,
      models: filteredModels,
      pagination: {
        page,
        limit,
        total: filteredModels.length === models.length ? total : filteredModels.length,
        totalPages: filteredModels.length === models.length 
          ? Math.ceil(total / limit) 
          : Math.ceil(filteredModels.length / limit),
      },
    };
  } catch (error) {
    console.error('Error listing models:', error);
    throw error;
  }
}

// Get models for an account
export async function getAccountModels(
  accountId: string,
  name?: string,
  version?: string,
  limit: number = 100,
  offset: number = 0
) {
  console.log('stub: getAccountModels');

  try {
    const whereClause: any = { accountId };

    if (name) {
      whereClause.name = name;
    }

    if (version) {
      whereClause.version = version;
    }

    const models = await prisma.model.findMany({
      where: whereClause,
      orderBy: [
        { name: 'asc' },
        { version: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    return models;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

// Example usage:
// 
// // Create new model version
// await registerModel(
//   'Churn Predictor',
//   'v1.0.0',
//   'https://yourmodelservice.com/churn/v1',
//   accountId,
//   'system',
//   'Predicts customer churn probability',
//   { /* input schema */ },
//   { /* output schema */ }
// );
// 
// When running the model, log execution:
// await prisma.modelExecution.create({
//   data: {
//     modelId: '...',
//     accountId: '...',
//     input: { /* real data */ },
//     output: { /* prediction */ },
//     status: 'success',
//   },
// }); 