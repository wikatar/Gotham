// Relations management module
// Manage connections between entities (user belongs to team, etc.)

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createRelationSchema = z.object({
  accountId: z.string().uuid(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.string().min(1).max(50),
  metadata: z.record(z.any()).optional(),
});

const updateRelationSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  type: z.string().min(1).max(50).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Create a new relation between entities
 */
export async function createRelation(data: z.infer<typeof createRelationSchema>) {
  console.log('stub: createRelation');
  
  try {
    const validated = createRelationSchema.parse(data);
    
    // Ensure both source and target entities exist and belong to the account
    const [sourceEntity, targetEntity] = await Promise.all([
      prisma.entity.findFirst({
        where: {
          id: validated.sourceId,
          accountId: validated.accountId,
        },
      }),
      prisma.entity.findFirst({
        where: {
          id: validated.targetId,
          accountId: validated.accountId,
        },
      }),
    ]);
    
    if (!sourceEntity) {
      return { success: false, error: 'Source entity not found' };
    }
    
    if (!targetEntity) {
      return { success: false, error: 'Target entity not found' };
    }
    
    // Check if the relation already exists
    const existingRelation = await prisma.relation.findFirst({
      where: {
        sourceId: validated.sourceId,
        targetId: validated.targetId,
        type: validated.type,
        accountId: validated.accountId,
      },
    });
    
    if (existingRelation) {
      return { 
        success: false, 
        error: 'Relation already exists',
        existingRelation,
      };
    }
    
    // Create the relation
    const relation = await prisma.relation.create({
      data: validated,
    });
    
    return { success: true, relation };
  } catch (error) {
    console.error('Error creating relation:', error);
    throw error;
  }
}

/**
 * Get relation by ID
 */
export async function getRelationById(accountId: string, id: string) {
  console.log('stub: getRelationById');
  
  try {
    const relation = await prisma.relation.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        source: true,
        target: true,
      },
    });
    
    if (!relation) {
      return { success: false, error: 'Relation not found' };
    }
    
    return { success: true, relation };
  } catch (error) {
    console.error('Error getting relation:', error);
    throw error;
  }
}

/**
 * Update a relation
 */
export async function updateRelation(data: z.infer<typeof updateRelationSchema>) {
  console.log('stub: updateRelation');
  
  try {
    const validated = updateRelationSchema.parse(data);
    const { id, accountId, ...updateData } = validated;
    
    // Make sure relation exists and belongs to the account
    const existingRelation = await prisma.relation.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingRelation) {
      return { success: false, error: 'Relation not found' };
    }
    
    const relation = await prisma.relation.update({
      where: { id },
      data: updateData,
    });
    
    return { success: true, relation };
  } catch (error) {
    console.error('Error updating relation:', error);
    throw error;
  }
}

/**
 * Delete a relation
 */
export async function deleteRelation(accountId: string, id: string) {
  console.log('stub: deleteRelation');
  
  try {
    // Make sure relation exists and belongs to the account
    const existingRelation = await prisma.relation.findFirst({
      where: {
        id,
        accountId,
      },
    });
    
    if (!existingRelation) {
      return { success: false, error: 'Relation not found' };
    }
    
    // Delete the relation
    await prisma.relation.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting relation:', error);
    throw error;
  }
}

/**
 * Find all relations for an entity (both as source and target)
 */
export async function getEntityRelations(accountId: string, entityId: string) {
  console.log('stub: getEntityRelations');
  
  try {
    const relations = await prisma.relation.findMany({
      where: {
        accountId,
        OR: [
          { sourceId: entityId },
          { targetId: entityId },
        ],
      },
      include: {
        source: true,
        target: true,
      },
    });
    
    return { 
      success: true, 
      relations,
      asSource: relations.filter(r => r.sourceId === entityId),
      asTarget: relations.filter(r => r.targetId === entityId),
    };
  } catch (error) {
    console.error('Error getting entity relations:', error);
    throw error;
  }
}

/**
 * List relations with optional filtering
 */
export async function listRelations({
  accountId,
  type,
  sourceId,
  targetId,
  page = 1,
  limit = 20,
}: {
  accountId: string;
  type?: string;
  sourceId?: string;
  targetId?: string;
  page?: number;
  limit?: number;
}) {
  console.log('stub: listRelations');
  
  try {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { accountId };
    
    if (type) {
      where.type = type;
    }
    
    if (sourceId) {
      where.sourceId = sourceId;
    }
    
    if (targetId) {
      where.targetId = targetId;
    }
    
    // Get relations and total count
    const [relations, total] = await Promise.all([
      prisma.relation.findMany({
        where,
        skip,
        take: limit,
        include: {
          source: true,
          target: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.relation.count({ where }),
    ]);
    
    return {
      success: true,
      relations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error listing relations:', error);
    throw error;
  }
} 