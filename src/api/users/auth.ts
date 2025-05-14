// Authentication module
// Handles user authentication and session management

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// JWT secret - in a real implementation this would be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Input validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  accountId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['admin', 'analyst', 'viewer']).default('viewer'),
});

/**
 * Hash a password
 */
function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  
  return { salt, hash };
}

/**
 * Verify a password
 */
function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  
  return storedHash === hash;
}

/**
 * Generate a JWT token for a user
 */
function generateToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    accountId: user.accountId,
    role: user.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Login a user
 */
export async function login(data: z.infer<typeof loginSchema>) {
  console.log('stub: login');
  
  try {
    const { email, password } = loginSchema.parse(data);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Get password hash and salt
    const passwordData = user.metadata as Record<string, any> || {};
    const { hash, salt } = passwordData.password || {};
    
    if (!hash || !salt) {
      return { success: false, error: 'Invalid user account' };
    }
    
    // Verify password
    if (!verifyPassword(password, salt, hash)) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Generate token
    const token = generateToken(user);
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountId: user.accountId,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function register(data: z.infer<typeof registerSchema>) {
  console.log('stub: register');
  
  try {
    const validatedData = registerSchema.parse(data);
    const { accountId, email, name, password, role } = validatedData;
    
    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    
    if (!account) {
      return { success: false, error: 'Account not found' };
    }
    
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return { success: false, error: 'Email is already in use' };
    }
    
    // Hash password
    const { salt, hash } = hashPassword(password);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        accountId,
        email,
        name,
        role,
        metadata: {
          password: { salt, hash }, // In a real implementation, this would be a separate table
        },
      },
    });
    
    // Generate token
    const token = generateToken(user);
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountId: user.accountId,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Get user information from a token
 */
export async function getUserFromToken(token: string) {
  console.log('stub: getUserFromToken');
  
  try {
    // Verify token
    const payload = verifyToken(token);
    
    if (!payload) {
      return { success: false, error: 'Invalid token' };
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountId: user.accountId,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    throw error;
  }
}

/**
 * Change user password
 */
export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  console.log('stub: changePassword');
  
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Get password hash and salt
    const passwordData = user.metadata as Record<string, any> || {};
    const { hash, salt } = passwordData.password || {};
    
    if (!hash || !salt) {
      return { success: false, error: 'Invalid user account' };
    }
    
    // Verify old password
    if (!verifyPassword(oldPassword, salt, hash)) {
      return { success: false, error: 'Incorrect old password' };
    }
    
    // Hash new password
    const newPasswordData = hashPassword(newPassword);
    
    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        metadata: {
          ...user.metadata as Record<string, any>,
          password: {
            salt: newPasswordData.salt,
            hash: newPasswordData.hash,
          },
        },
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
} 