import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Determines system health status based on various metrics
 */
function determineSystemHealth(
  failedAgents: number, 
  totalAgents: number,
  criticalIncidents: number
): 'healthy' | 'warning' | 'critical' {
  // If more than 20% of agents are failing or there are critical incidents, the system is critical
  if (failedAgents / totalAgents > 0.2 || criticalIncidents > 0) {
    return 'critical';
  }
  
  // If more than 5% of agents are failing, the system is in warning state
  if (failedAgents / totalAgents > 0.05) {
    return 'warning';
  }
  
  // Otherwise, the system is healthy
  return 'healthy';
}

/**
 * Updates the control panel snapshot with current system metrics
 */
export async function updateControlPanelSnapshot() {
  try {
    console.log('Updating control panel snapshot...');
    
    // Get total agents count
    const totalAgents = await prisma.agent.count();
    
    // Get active agents count
    const activeAgents = await prisma.agent.count({
      where: {
        status: 'active',
      },
    });
    
    // Get failed agents count (error or inactive status)
    const failedAgents = await prisma.agent.count({
      where: {
        OR: [
          { status: 'error' },
          { status: 'inactive' }
        ]
      },
    });
    
    // Get anomalies metrics
    const totalAnomalies = await prisma.anomaly.count();
    const resolvedAnomalies = await prisma.anomaly.count({
      where: {
        resolved: true,
      },
    });
    
    // Get critical incidents (high or critical severity anomalies that are unresolved)
    const criticalIncidents = await prisma.anomaly.count({
      where: {
        severity: {
          in: ['high', 'critical'],
        },
        resolved: false,
      },
    });
    
    // Get timestamp of last agent activity
    const lastAgentExecution = await prisma.agentExecutionLog.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    });
    
    // Determine system health status
    const systemHealthStatus = determineSystemHealth(
      failedAgents,
      totalAgents,
      criticalIncidents
    );
    
    // Create the snapshot
    const snapshot = await prisma.controlPanelSnapshot.create({
      data: {
        totalAgents,
        activeAgents,
        failedAgents,
        totalAnomalies,
        resolvedAnomalies,
        criticalIncidents,
        lastAgentActivityAt: lastAgentExecution?.createdAt || null,
        systemHealthStatus,
      },
    });
    
    console.log('Control panel snapshot updated:', snapshot.id);
    return snapshot;
  } catch (error) {
    console.error('Error updating control panel snapshot:', error);
    throw error;
  }
} 