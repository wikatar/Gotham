export type AgentStatus = 'active' | 'idle' | 'paused' | 'error';
export type AgentCapability = 
  | 'data-analysis' 
  | 'anomaly-detection' 
  | 'forecasting' 
  | 'recommendation' 
  | 'optimization' 
  | 'alert-management'
  | 'reporting'
  | 'automation';

export type AgentPermissionLevel = 'read-only' | 'suggest' | 'execute' | 'autonomous';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  avatar?: string;
  capabilities: AgentCapability[];
  permissionLevel: AgentPermissionLevel;
  assignedMissions: string[]; // Mission IDs
  lastActive?: Date;
  createdAt: Date;
  configOptions: {
    [key: string]: any;
  };
  performance?: {
    accuracy: number; // 0-100
    efficiency: number; // 0-100
    responseTime: number; // milliseconds
  };
}

export interface AgentAction {
  id: string;
  agentId: string;
  missionId?: string;
  action: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface AgentRecommendation {
  id: string;
  agentId: string;
  missionId: string;
  title: string;
  description: string;
  type: 'action' | 'insight' | 'warning' | 'opportunity';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  timestamp: Date;
  status: 'new' | 'viewed' | 'accepted' | 'rejected' | 'implemented';
  relatedObjectiveId?: string;
  suggestedAction?: {
    title: string;
    description: string;
    expectedOutcome: string;
    estimatedImpact: number; // 0-100
  };
  dataPoints?: {
    label: string;
    value: any;
    trend?: 'up' | 'down' | 'flat';
  }[];
} 