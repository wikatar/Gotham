// KPI management module
// Provides functionality for defining and managing Key Performance Indicators

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// KPI validation schema
export const kpiSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  target: z.number().optional(),
  unit: z.string().optional(),
  threshold: z.object({
    warning: z.number().optional(),
    critical: z.number().optional(),
  }).optional(),
  dataSourceId: z.string().uuid().optional(),
  formula: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Add KPIs to a mission
 */
export async function addKpisToMission(
  accountId: string,
  missionId: string,
  kpis: z.infer<typeof kpiSchema>[]
) {
  console.log('stub: addKpisToMission');
  
  try {
    // Validate KPIs
    const validatedKpis = kpis.map(kpi => kpiSchema.parse(kpi));
    
    // Check if mission exists and belongs to the account
    const mission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        accountId,
      },
    });
    
    if (!mission) {
      return { success: false, error: 'Mission not found or does not belong to the account' };
    }
    
    // Get existing KPIs
    const existingKpis = mission.kpis as z.infer<typeof kpiSchema>[] || [];
    
    // Update mission with new KPIs
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        kpis: [...existingKpis, ...validatedKpis],
      },
    });
    
    return { success: true, mission: updatedMission };
  } catch (error) {
    console.error('Error adding KPIs to mission:', error);
    throw error;
  }
}

/**
 * Remove KPIs from a mission
 */
export async function removeKpisFromMission(
  accountId: string,
  missionId: string,
  kpiNames: string[]
) {
  console.log('stub: removeKpisFromMission');
  
  try {
    // Check if mission exists and belongs to the account
    const mission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        accountId,
      },
    });
    
    if (!mission) {
      return { success: false, error: 'Mission not found or does not belong to the account' };
    }
    
    // Get existing KPIs
    const existingKpis = mission.kpis as z.infer<typeof kpiSchema>[] || [];
    
    // Filter out KPIs to remove
    const updatedKpis = existingKpis.filter(kpi => !kpiNames.includes(kpi.name));
    
    // Update mission with filtered KPIs
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        kpis: updatedKpis,
      },
    });
    
    return { success: true, mission: updatedMission };
  } catch (error) {
    console.error('Error removing KPIs from mission:', error);
    throw error;
  }
}

/**
 * Update KPIs in a mission
 */
export async function updateKpisInMission(
  accountId: string,
  missionId: string,
  updatedKpis: z.infer<typeof kpiSchema>[]
) {
  console.log('stub: updateKpisInMission');
  
  try {
    // Validate KPIs
    const validatedKpis = updatedKpis.map(kpi => kpiSchema.parse(kpi));
    
    // Check if mission exists and belongs to the account
    const mission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        accountId,
      },
    });
    
    if (!mission) {
      return { success: false, error: 'Mission not found or does not belong to the account' };
    }
    
    // Get existing KPIs
    const existingKpis = mission.kpis as z.infer<typeof kpiSchema>[] || [];
    
    // Create a map of existing KPIs for quick lookup
    const kpiMap = new Map(existingKpis.map(kpi => [kpi.name, kpi]));
    
    // Replace or add updated KPIs
    validatedKpis.forEach(kpi => {
      kpiMap.set(kpi.name, kpi);
    });
    
    // Convert map back to array
    const mergedKpis = Array.from(kpiMap.values());
    
    // Update mission with merged KPIs
    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        kpis: mergedKpis,
      },
    });
    
    return { success: true, mission: updatedMission };
  } catch (error) {
    console.error('Error updating KPIs in mission:', error);
    throw error;
  }
}

/**
 * Get all KPIs for a mission
 */
export async function getMissionKpis(accountId: string, missionId: string) {
  console.log('stub: getMissionKpis');
  
  try {
    // Check if mission exists and belongs to the account
    const mission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        accountId,
      },
    });
    
    if (!mission) {
      return { success: false, error: 'Mission not found or does not belong to the account' };
    }
    
    // Get KPIs
    const kpis = mission.kpis as z.infer<typeof kpiSchema>[] || [];
    
    return { success: true, kpis };
  } catch (error) {
    console.error('Error getting mission KPIs:', error);
    throw error;
  }
}

/**
 * Evaluate KPI status for a given value
 */
export function evaluateKpiStatus(kpi: z.infer<typeof kpiSchema>, value: number) {
  console.log('stub: evaluateKpiStatus');
  
  // If no thresholds defined, use target as threshold
  if (!kpi.threshold && kpi.target === undefined) {
    return { status: 'unknown', value };
  }
  
  const thresholds = kpi.threshold || {};
  const criticalThreshold = thresholds.critical !== undefined 
    ? thresholds.critical 
    : kpi.target !== undefined ? kpi.target * 0.6 : undefined;
  
  const warningThreshold = thresholds.warning !== undefined 
    ? thresholds.warning 
    : kpi.target !== undefined ? kpi.target * 0.8 : undefined;
  
  // Determine status
  let status = 'good';
  
  if (criticalThreshold !== undefined && value < criticalThreshold) {
    status = 'critical';
  } else if (warningThreshold !== undefined && value < warningThreshold) {
    status = 'warning';
  }
  
  return {
    status,
    value,
    target: kpi.target,
    percentOfTarget: kpi.target ? Math.round((value / kpi.target) * 100) : undefined,
    thresholds: {
      warning: warningThreshold,
      critical: criticalThreshold,
    },
  };
} 