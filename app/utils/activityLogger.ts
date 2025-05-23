/**
 * Utility för att logga aktiviteter i systemet
 * Används för audit trail och historikspårning
 */

export type ActivityAction = 
  | 'created' | 'updated' | 'deleted' | 'resolved' | 'assigned' 
  | 'commented' | 'edited_comment' | 'deleted_comment'
  | 'status_changed' | 'severity_changed' | 'mission_linked' | 'mission_unlinked';

export type EntityType = 'mission' | 'agent' | 'incident' | 'anomaly' | 'execution' | 'comment';

export interface LogActivityParams {
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  actor: string;
  actorName?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Loggar en aktivitet i systemet
 */
export async function logActivity({
  entityType,
  entityId,
  action,
  actor,
  actorName,
  description,
  metadata,
}: LogActivityParams): Promise<boolean> {
  try {
    const response = await fetch('/api/activity-log/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entityType,
        entityId,
        action,
        actor,
        actorName: actorName || actor,
        description,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to log activity:', errorData.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error logging activity:', error);
    return false;
  }
}

/**
 * Fördefinierade beskrivningar för olika aktiviteter
 */
export const getActivityDescription = (
  action: ActivityAction,
  entityType: EntityType,
  metadata?: Record<string, any>
): string => {
  switch (action) {
    case 'created':
      return `Skapade ${getEntityDisplayName(entityType)}`;
    
    case 'updated':
      return `Uppdaterade ${getEntityDisplayName(entityType)}`;
    
    case 'deleted':
      return `Raderade ${getEntityDisplayName(entityType)}`;
    
    case 'resolved':
      return `Löste ${getEntityDisplayName(entityType)}`;
    
    case 'assigned':
      return `Tilldelade ${getEntityDisplayName(entityType)} till ${metadata?.assignee || 'okänd användare'}`;
    
    case 'commented':
      return `Kommenterade på ${getEntityDisplayName(entityType)}`;
    
    case 'edited_comment':
      return `Redigerade kommentar på ${getEntityDisplayName(entityType)}`;
    
    case 'deleted_comment':
      return `Raderade kommentar från ${getEntityDisplayName(entityType)}`;
    
    case 'status_changed':
      return `Ändrade status från "${metadata?.oldStatus}" till "${metadata?.newStatus}"`;
    
    case 'severity_changed':
      return `Ändrade allvarlighetsgrad från "${metadata?.oldSeverity}" till "${metadata?.newSeverity}"`;
    
    case 'mission_linked':
      return `Kopplade till mission: ${metadata?.missionName}`;
    
    case 'mission_unlinked':
      return `Kopplade bort från mission: ${metadata?.missionName}`;
    
    default:
      return `Utförde "${action}" på ${getEntityDisplayName(entityType)}`;
  }
};

/**
 * Få läsbar visningsnamn för entitetstyper
 */
export const getEntityDisplayName = (entityType: EntityType): string => {
  switch (entityType) {
    case 'mission':
      return 'uppdrag';
    case 'agent':
      return 'agent';
    case 'incident':
      return 'incident';
    case 'anomaly':
      return 'anomali';
    case 'execution':
      return 'exekvering';
    case 'comment':
      return 'kommentar';
    default:
      return entityType;
  }
};

/**
 * Convenience-funktioner för vanliga aktiviteter
 */
export const ActivityLogger = {
  // Incident-relaterade aktiviteter
  incidentCreated: (incidentId: string, actor: string, actorName?: string) =>
    logActivity({
      entityType: 'incident',
      entityId: incidentId,
      action: 'created',
      actor,
      actorName,
      description: getActivityDescription('created', 'incident'),
    }),

  incidentStatusChanged: (
    incidentId: string,
    actor: string,
    oldStatus: string,
    newStatus: string,
    actorName?: string
  ) =>
    logActivity({
      entityType: 'incident',
      entityId: incidentId,
      action: 'status_changed',
      actor,
      actorName,
      description: getActivityDescription('status_changed', 'incident', { oldStatus, newStatus }),
      metadata: { oldStatus, newStatus },
    }),

  incidentResolved: (incidentId: string, actor: string, actorName?: string) =>
    logActivity({
      entityType: 'incident',
      entityId: incidentId,
      action: 'resolved',
      actor,
      actorName,
      description: getActivityDescription('resolved', 'incident'),
    }),

  // Mission-relaterade aktiviteter
  missionCreated: (missionId: string, actor: string, actorName?: string) =>
    logActivity({
      entityType: 'mission',
      entityId: missionId,
      action: 'created',
      actor,
      actorName,
      description: getActivityDescription('created', 'mission'),
    }),

  // Kommentar-relaterade aktiviteter
  commentAdded: (
    entityType: EntityType,
    entityId: string,
    actor: string,
    content: string,
    actorName?: string
  ) =>
    logActivity({
      entityType,
      entityId,
      action: 'commented',
      actor,
      actorName,
      description: `Lade till kommentar: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
      metadata: { contentLength: content.length },
    }),

  // Anomali-relaterade aktiviteter
  anomalyDetected: (anomalyId: string, actor: string = 'system', actorName: string = 'System') =>
    logActivity({
      entityType: 'anomaly',
      entityId: anomalyId,
      action: 'created',
      actor,
      actorName,
      description: 'Anomali upptäckt automatiskt',
    }),

  anomalyResolved: (anomalyId: string, actor: string, actorName?: string) =>
    logActivity({
      entityType: 'anomaly',
      entityId: anomalyId,
      action: 'resolved',
      actor,
      actorName,
      description: getActivityDescription('resolved', 'anomaly'),
    }),
}; 