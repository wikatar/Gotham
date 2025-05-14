// Taxonomy management module
// Provides metadata about concepts for AI model understanding

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// We'll store taxonomy entries as Entity objects with type="taxonomy_term"
const TAXONOMY_ENTITY_TYPE = 'taxonomy_term';

// Validation schemas
const createTaxonomyTermSchema = z.object({
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  description: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  parentId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateTaxonomyTermSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  synonyms: z.array(z.string()).optional(),
  parentId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Create a new taxonomy term
 */
export async function createTaxonomyTerm(data: z.infer<typeof createTaxonomyTermSchema>) {
  console.log('stub: createTaxonomyTerm');
  
  try {
    const validated = createTaxonomyTermSchema.parse(data);
    const { category, description, synonyms, parentId, ...rest } = validated;
    
    // Check if parent exists and belongs to the account
    if (parentId) {
      const parentTerm = await prisma.entity.findFirst({
        where: {
          id: parentId,
          accountId: validated.accountId,
          type: TAXONOMY_ENTITY_TYPE,
        },
      });
      
      if (!parentTerm) {
        return { success: false, error: 'Parent taxonomy term not found' };
      }
    }
    
    // Create the taxonomy term as an entity
    const taxonomyTerm = await prisma.entity.create({
      data: {
        ...rest,
        type: TAXONOMY_ENTITY_TYPE,
        metadata: {
          category,
          description,
          synonyms,
          parentId,
          ...rest.metadata,
        },
      },
    });
    
    // If there's a parent, create a relation to it
    if (parentId) {
      await prisma.relation.create({
        data: {
          accountId: validated.accountId,
          sourceId: taxonomyTerm.id,
          targetId: parentId,
          type: 'child_of',
        },
      });
    }
    
    return { 
      success: true, 
      taxonomyTerm: {
        ...taxonomyTerm,
        category,
        description,
        synonyms,
        parentId,
      },
    };
  } catch (error) {
    console.error('Error creating taxonomy term:', error);
    throw error;
  }
}

/**
 * Get taxonomy term by ID
 */
export async function getTaxonomyTermById(accountId: string, id: string) {
  console.log('stub: getTaxonomyTermById');
  
  try {
    const entity = await prisma.entity.findFirst({
      where: {
        id,
        accountId,
        type: TAXONOMY_ENTITY_TYPE,
      },
    });
    
    if (!entity) {
      return { success: false, error: 'Taxonomy term not found' };
    }
    
    // Get parent relation if exists
    const parentRelation = await prisma.relation.findFirst({
      where: {
        accountId,
        sourceId: id,
        type: 'child_of',
      },
      include: {
        target: true,
      },
    });
    
    // Get child relations if any
    const childRelations = await prisma.relation.findMany({
      where: {
        accountId,
        targetId: id,
        type: 'child_of',
      },
      include: {
        source: true,
      },
    });
    
    // Extract term data from entity
    const { metadata, ...termBase } = entity;
    const category = metadata?.category as string || '';
    const description = metadata?.description as string || '';
    const synonyms = metadata?.synonyms as string[] || [];
    const parentId = parentRelation?.targetId;
    
    const taxonomyTerm = {
      ...termBase,
      category,
      description,
      synonyms,
      parentId,
      parent: parentRelation?.target,
      children: childRelations.map(r => r.source),
    };
    
    return { success: true, taxonomyTerm };
  } catch (error) {
    console.error('Error getting taxonomy term:', error);
    throw error;
  }
}

/**
 * Update a taxonomy term
 */
export async function updateTaxonomyTerm(data: z.infer<typeof updateTaxonomyTermSchema>) {
  console.log('stub: updateTaxonomyTerm');
  
  try {
    const validated = updateTaxonomyTermSchema.parse(data);
    const { id, accountId, category, description, synonyms, parentId, ...updateBase } = validated;
    
    // Make sure term exists and belongs to the account
    const existingTerm = await prisma.entity.findFirst({
      where: {
        id,
        accountId,
        type: TAXONOMY_ENTITY_TYPE,
      },
    });
    
    if (!existingTerm) {
      return { success: false, error: 'Taxonomy term not found' };
    }
    
    // Get current metadata
    const currentMetadata = existingTerm.metadata as Record<string, any> || {};
    
    // Prepare updated metadata
    const updatedMetadata = {
      ...currentMetadata,
      ...(category !== undefined ? { category } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(synonyms !== undefined ? { synonyms } : {}),
      ...(parentId !== undefined ? { parentId } : {}),
    };
    
    // Update the entity
    const taxonomyTerm = await prisma.entity.update({
      where: { id },
      data: {
        ...updateBase,
        metadata: updatedMetadata,
      },
    });
    
    // Handle parent relation update if needed
    if (parentId !== undefined) {
      // Delete existing parent relation if any
      await prisma.relation.deleteMany({
        where: {
          accountId,
          sourceId: id,
          type: 'child_of',
        },
      });
      
      // Create new parent relation if a parent is specified
      if (parentId) {
        // Check if parent exists
        const parentTerm = await prisma.entity.findFirst({
          where: {
            id: parentId,
            accountId,
            type: TAXONOMY_ENTITY_TYPE,
          },
        });
        
        if (!parentTerm) {
          return { success: false, error: 'Parent taxonomy term not found' };
        }
        
        await prisma.relation.create({
          data: {
            accountId,
            sourceId: id,
            targetId: parentId,
            type: 'child_of',
          },
        });
      }
    }
    
    // Return updated term
    return { 
      success: true, 
      taxonomyTerm: {
        ...taxonomyTerm,
        category: updatedMetadata.category,
        description: updatedMetadata.description,
        synonyms: updatedMetadata.synonyms,
        parentId: updatedMetadata.parentId,
      },
    };
  } catch (error) {
    console.error('Error updating taxonomy term:', error);
    throw error;
  }
}

/**
 * Delete a taxonomy term
 */
export async function deleteTaxonomyTerm(accountId: string, id: string) {
  console.log('stub: deleteTaxonomyTerm');
  
  try {
    // Make sure term exists and belongs to the account
    const existingTerm = await prisma.entity.findFirst({
      where: {
        id,
        accountId,
        type: TAXONOMY_ENTITY_TYPE,
      },
    });
    
    if (!existingTerm) {
      return { success: false, error: 'Taxonomy term not found' };
    }
    
    // Check if term has children
    const childrenCount = await prisma.relation.count({
      where: {
        accountId,
        targetId: id,
        type: 'child_of',
      },
    });
    
    if (childrenCount > 0) {
      return { 
        success: false, 
        error: 'Cannot delete taxonomy term because it has children',
        childrenCount,
      };
    }
    
    // Delete relations where this term is involved
    await prisma.relation.deleteMany({
      where: {
        accountId,
        OR: [
          { sourceId: id },
          { targetId: id },
        ],
      },
    });
    
    // Delete the term
    await prisma.entity.delete({
      where: { id },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting taxonomy term:', error);
    throw error;
  }
}

/**
 * List taxonomy terms with optional filtering
 */
export async function listTaxonomyTerms({
  accountId,
  category,
  search,
  parentId,
  page = 1,
  limit = 20,
}: {
  accountId: string;
  category?: string;
  search?: string;
  parentId?: string;
  page?: number;
  limit?: number;
}) {
  console.log('stub: listTaxonomyTerms');
  
  try {
    const skip = (page - 1) * limit;
    
    // Build base where clause
    const where: any = { 
      accountId,
      type: TAXONOMY_ENTITY_TYPE,
    };
    
    // Add search if provided
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    // Get terms and total count
    const [entities, total] = await Promise.all([
      prisma.entity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.entity.count({ where }),
    ]);
    
    // Process entities to extract taxonomy term data
    const taxonomyTerms = entities.map(entity => {
      const { metadata, ...termBase } = entity;
      const termMetadata = metadata as Record<string, any> || {};
      
      return {
        ...termBase,
        category: termMetadata.category || '',
        description: termMetadata.description || '',
        synonyms: termMetadata.synonyms || [],
        parentId: termMetadata.parentId || null,
      };
    });
    
    // Filter by category if provided
    const filteredTerms = category
      ? taxonomyTerms.filter(term => term.category === category)
      : taxonomyTerms;
    
    // Filter by parentId if provided
    const finalTerms = parentId !== undefined
      ? filteredTerms.filter(term => 
          parentId ? term.parentId === parentId : !term.parentId
        )
      : filteredTerms;
    
    return {
      success: true,
      taxonomyTerms: finalTerms,
      pagination: {
        page,
        limit,
        total: finalTerms.length,
        totalPages: Math.ceil(finalTerms.length / limit),
      },
    };
  } catch (error) {
    console.error('Error listing taxonomy terms:', error);
    throw error;
  }
} 