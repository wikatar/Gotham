// User scopes/permissions module
// Provides functionality for managing user permissions

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Define available permissions
export const PERMISSIONS = {
  // Entity permissions
  ENTITY_CREATE: 'entity:create',
  ENTITY_READ: 'entity:read',
  ENTITY_UPDATE: 'entity:update',
  ENTITY_DELETE: 'entity:delete',
  
  // Relation permissions
  RELATION_CREATE: 'relation:create',
  RELATION_READ: 'relation:read',
  RELATION_UPDATE: 'relation:update',
  RELATION_DELETE: 'relation:delete',
  
  // Mission permissions
  MISSION_CREATE: 'mission:create',
  MISSION_READ: 'mission:read',
  MISSION_UPDATE: 'mission:update',
  MISSION_DELETE: 'mission:delete',
  
  // Model permissions
  MODEL_CREATE: 'model:create',
  MODEL_READ: 'model:read',
  MODEL_UPDATE: 'model:update',
  MODEL_DELETE: 'model:delete',
  MODEL_EXECUTE: 'model:execute',
  
  // Agent permissions
  AGENT_CREATE: 'agent:create',
  AGENT_READ: 'agent:read',
  AGENT_UPDATE: 'agent:update',
  AGENT_DELETE: 'agent:delete',
  AGENT_EXECUTE: 'agent:execute',
  
  // Feed permissions
  FEED_CREATE: 'feed:create',
  FEED_READ: 'feed:read',
  FEED_UPDATE: 'feed:update',
  FEED_DELETE: 'feed:delete',
  FEED_UPLOAD: 'feed:upload',
  
  // Admin permissions
  USER_MANAGE: 'user:manage',
  ACCOUNT_MANAGE: 'account:manage',
};

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: Object.values(PERMISSIONS),
  
  analyst: [
    // Entity
    PERMISSIONS.ENTITY_READ,
    PERMISSIONS.ENTITY_CREATE,
    PERMISSIONS.ENTITY_UPDATE,
    
    // Relation
    PERMISSIONS.RELATION_READ,
    PERMISSIONS.RELATION_CREATE,
    PERMISSIONS.RELATION_UPDATE,
    
    // Mission
    PERMISSIONS.MISSION_READ,
    PERMISSIONS.MISSION_CREATE,
    PERMISSIONS.MISSION_UPDATE,
    
    // Model
    PERMISSIONS.MODEL_READ,
    PERMISSIONS.MODEL_CREATE,
    PERMISSIONS.MODEL_EXECUTE,
    
    // Agent
    PERMISSIONS.AGENT_READ,
    PERMISSIONS.AGENT_EXECUTE,
    
    // Feed
    PERMISSIONS.FEED_READ,
    PERMISSIONS.FEED_UPLOAD,
  ],
  
  viewer: [
    // Entity
    PERMISSIONS.ENTITY_READ,
    
    // Relation
    PERMISSIONS.RELATION_READ,
    
    // Mission
    PERMISSIONS.MISSION_READ,
    
    // Model
    PERMISSIONS.MODEL_READ,
    
    // Agent
    PERMISSIONS.AGENT_READ,
    
    // Feed
    PERMISSIONS.FEED_READ,
  ],
};

// Validation schema for permission assignment
const assignPermissionsSchema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
  permissions: z.array(z.string()),
  replace: z.boolean().default(false),
});

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: string): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a user has a permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  console.log('stub: hasPermission');
  
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return false;
    }
    
    // Get role permissions
    const rolePermissions = getPermissionsForRole(user.role);
    
    // Get user's custom permissions
    const userMetadata = user.metadata as Record<string, any> || {};
    const customPermissions = userMetadata.permissions || [];
    
    // Get user's denied permissions
    const deniedPermissions = userMetadata.deniedPermissions || [];
    
    // Check if permission is denied
    if (deniedPermissions.includes(permission)) {
      return false;
    }
    
    // Check if user has permission via role or custom permissions
    return rolePermissions.includes(permission) || customPermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Assign custom permissions to a user
 */
export async function assignPermissions(data: z.infer<typeof assignPermissionsSchema>) {
  console.log('stub: assignPermissions');
  
  try {
    const { accountId, userId, permissions, replace } = assignPermissionsSchema.parse(data);
    
    // Check if user exists and belongs to the account
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        accountId,
      },
    });
    
    if (!user) {
      return { success: false, error: 'User not found or does not belong to the account' };
    }
    
    // Get current metadata
    const metadata = user.metadata as Record<string, any> || {};
    
    // Update permissions
    let updatedPermissions = permissions;
    
    if (!replace && metadata.permissions) {
      // Add new permissions to existing ones (ensure uniqueness)
      updatedPermissions = Array.from(new Set([...metadata.permissions, ...permissions]));
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...metadata,
          permissions: updatedPermissions,
        },
      },
    });
    
    return { 
      success: true, 
      permissions: updatedPermissions,
    };
  } catch (error) {
    console.error('Error assigning permissions:', error);
    throw error;
  }
}

/**
 * Remove permissions from a user
 */
export async function removePermissions(accountId: string, userId: string, permissions: string[]) {
  console.log('stub: removePermissions');
  
  try {
    // Check if user exists and belongs to the account
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        accountId,
      },
    });
    
    if (!user) {
      return { success: false, error: 'User not found or does not belong to the account' };
    }
    
    // Get current metadata
    const metadata = user.metadata as Record<string, any> || {};
    
    // If user has no custom permissions, nothing to remove
    if (!metadata.permissions || !Array.isArray(metadata.permissions)) {
      return { success: true, permissions: [] };
    }
    
    // Remove permissions
    const updatedPermissions = metadata.permissions.filter(
      (p: string) => !permissions.includes(p)
    );
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...metadata,
          permissions: updatedPermissions,
        },
      },
    });
    
    return { 
      success: true, 
      permissions: updatedPermissions,
    };
  } catch (error) {
    console.error('Error removing permissions:', error);
    throw error;
  }
}

/**
 * Deny specific permissions for a user
 */
export async function denyPermissions(accountId: string, userId: string, permissions: string[]) {
  console.log('stub: denyPermissions');
  
  try {
    // Check if user exists and belongs to the account
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        accountId,
      },
    });
    
    if (!user) {
      return { success: false, error: 'User not found or does not belong to the account' };
    }
    
    // Get current metadata
    const metadata = user.metadata as Record<string, any> || {};
    
    // Get current denied permissions
    const currentDeniedPermissions = metadata.deniedPermissions || [];
    
    // Add new denied permissions (ensure uniqueness)
    const updatedDeniedPermissions = Array.from(
      new Set([...currentDeniedPermissions, ...permissions])
    );
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...metadata,
          deniedPermissions: updatedDeniedPermissions,
        },
      },
    });
    
    return { 
      success: true, 
      deniedPermissions: updatedDeniedPermissions,
    };
  } catch (error) {
    console.error('Error denying permissions:', error);
    throw error;
  }
}

/**
 * Reset permissions to role defaults
 */
export async function resetPermissions(accountId: string, userId: string) {
  console.log('stub: resetPermissions');
  
  try {
    // Check if user exists and belongs to the account
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        accountId,
      },
    });
    
    if (!user) {
      return { success: false, error: 'User not found or does not belong to the account' };
    }
    
    // Get current metadata
    const metadata = user.metadata as Record<string, any> || {};
    
    // Remove custom permissions and denied permissions
    const { permissions, deniedPermissions, ...restMetadata } = metadata;
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: restMetadata,
      },
    });
    
    return { 
      success: true, 
      rolePermissions: getPermissionsForRole(user.role),
    };
  } catch (error) {
    console.error('Error resetting permissions:', error);
    throw error;
  }
} 