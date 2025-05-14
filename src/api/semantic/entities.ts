// Entity management module
// Provides CRUD operations for semantic entities

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createEntitySchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  metadata: z.record(z.any()).optional(),
});

const updateEntitySchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  type: z.string().min(1).max(50).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Create a new entity
 */
export async function createEntity(data: z.infer<typeof createEntitySchema>) {
  console.log('stub: createEntity');
  
  try {
    const validated = createEntitySchema.parse(data);
    
    const entity = await prisma.entity.create({
      data: validated,
    });
    
    return { success: true, entity };
  } catch (error) {
    console.error('Error creating entity:', error);
    throw error;
  }
}

/**
 * Get entity by ID
 */
export async function getEntityById(accountId: string, id: string) {
  console.log('stub: getEntityById');
  
  try {
    const entity = await prisma.entity.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!entity) {
      return { success: false, error: 'Entity not found' };
    }
    
    return { success: true, entity };
  } catch (error) {
    console.error('Error getting entity:', error);
    throw error;
  }
}

/**
 * Update an entity
 */
export async function updateEntity(data: z.infer<typeof updateEntitySchema>) {
  console.log('stub: updateEntity');
  
  try {
    const validated = updateEntitySchema.parse(data);
    const { id, accountId, ...updateData } = validated;
    
    // Make sure entity exists and belongs to the account
    const existingEntity = await prisma.entity.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingEntity) {
      return { success: false, error: 'Entity not found' };
    }
    
    const entity = await prisma.entity.update({
      where: { id },
      data: updateData,
    });
    
    return { success: true, entity };
  } catch (error) {
    console.error('Error updating entity:', error);
    throw error;
  }
}

/**
 * Delete an entity
 */
export async function deleteEntity(accountId: string, id: string) {
  console.log('stub: deleteEntity');
  
  try {
    // Make sure entity exists and belongs to the account
    const existingEntity = await prisma.entity.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingEntity) {
      return { success: false, error: 'Entity not found' };
    }
    
    // Check if entity is used in relations
    const relationsCount = await prisma.relation.count({
      where: {
        OR: [
          { sourceId: id },
          { targetId: id },
        ],
      },
    });
    
    if (relationsCount > 0) {
      return { 
        success: false, 
        error: 'Cannot delete entity because it is used in relations',
        relationsCount
      };
    }
    
    // Delete the entity
    await prisma.entity.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting entity:', error);
    throw error;
  }
}

/**
 * List entities with optional filtering
 */
export async function listEntities({
  accountId,
  type,
  search,
  page = 1,
  limit = 20,
}: {
  accountId: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  console.log('stub: listEntities');
  
  try {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { accountId };
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    // Get entities and total count
    const [entities, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.entity.count({ where }),
    ]);
    
    return {
      success: true,
      entities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error listing entities:', error);
    throw error;
  }
} 