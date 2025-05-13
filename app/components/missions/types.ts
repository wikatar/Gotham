export type MissionStatus = 'active' | 'completed' | 'on-hold' | 'planning';
export type MissionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ObjectiveStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';
export type KpiTrend = 'increasing' | 'decreasing' | 'stable' | 'fluctuating';

export interface Kpi {
  id: string;
  name: string;
  description?: string;
  value: number;
  target: number;
  unit: string;
  format?: string; // "percentage", "currency", "number"
  trend: KpiTrend;
  history: {
    date: Date;
    value: number;
  }[];
  lastUpdated: Date;
  thresholds: {
    warning: number;
    critical: number;
  };
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  status: ObjectiveStatus;
  priority: MissionPriority;
  progress: number; // 0-100
  startDate?: Date;
  dueDate?: Date;
  completedDate?: Date;
  kpis: string[]; // IDs of linked KPIs
  owner?: string;
  tags: string[];
}

export interface MissionAction {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  type: 'manual' | 'automated';
  createdAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
  assignedTo?: string;
  relatedObjectiveId?: string;
  aiGenerated: boolean;
  source?: string; // e.g., "anomaly-detection", "threshold-alert", "manual"
}

export interface EnhancedMission {
  id: string;
  name: string;
  description?: string;
  status: MissionStatus;
  priority: MissionPriority;
  category?: string;
  startDate: Date;
  endDate?: Date;
  owner?: string;
  team: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }[];
  objectives: MissionObjective[];
  kpis: Kpi[];
  actions: MissionAction[];
  dataSources: {
    id: string;
    name: string;
    type: string;
  }[];
  dashboardIds: string[];
  tags: string[];
  progress: number; // 0-100, calculated from objectives
} 