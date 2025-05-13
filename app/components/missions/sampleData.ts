import { 
  EnhancedMission, 
  MissionObjective, 
  Kpi, 
  MissionAction 
} from './types';

// Helper function to create dates relative to today
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Sample KPIs
export const SAMPLE_KPIS: Kpi[] = [
  {
    id: 'kpi-1',
    name: 'Customer Retention Rate',
    description: 'Percentage of customers retained over the period',
    value: 85,
    target: 90,
    unit: '%',
    format: 'percentage',
    trend: 'increasing',
    history: [
      { date: daysAgo(30), value: 78 },
      { date: daysAgo(25), value: 79 },
      { date: daysAgo(20), value: 81 },
      { date: daysAgo(15), value: 82 },
      { date: daysAgo(10), value: 83 },
      { date: daysAgo(5), value: 85 }
    ],
    lastUpdated: daysAgo(0),
    thresholds: {
      warning: 80,
      critical: 75
    }
  },
  {
    id: 'kpi-2',
    name: 'Monthly Recurring Revenue',
    description: 'Monthly subscription revenue',
    value: 156000,
    target: 180000,
    unit: 'USD',
    format: 'currency',
    trend: 'increasing',
    history: [
      { date: daysAgo(30), value: 140000 },
      { date: daysAgo(25), value: 142000 },
      { date: daysAgo(20), value: 145000 },
      { date: daysAgo(15), value: 148000 },
      { date: daysAgo(10), value: 151000 },
      { date: daysAgo(5), value: 154000 }
    ],
    lastUpdated: daysAgo(0),
    thresholds: {
      warning: 150000,
      critical: 140000
    }
  },
  {
    id: 'kpi-3',
    name: 'Average Response Time',
    description: 'Average customer support response time',
    value: 3.2,
    target: 2,
    unit: 'hours',
    format: 'number',
    trend: 'decreasing',
    history: [
      { date: daysAgo(30), value: 4.8 },
      { date: daysAgo(25), value: 4.5 },
      { date: daysAgo(20), value: 4.2 },
      { date: daysAgo(15), value: 3.9 },
      { date: daysAgo(10), value: 3.6 },
      { date: daysAgo(5), value: 3.4 }
    ],
    lastUpdated: daysAgo(0),
    thresholds: {
      warning: 4,
      critical: 6
    }
  },
  {
    id: 'kpi-4',
    name: 'User Activation Rate',
    description: 'Percentage of new users who complete key actions',
    value: 42,
    target: 60,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    history: [
      { date: daysAgo(30), value: 41 },
      { date: daysAgo(25), value: 42 },
      { date: daysAgo(20), value: 40 },
      { date: daysAgo(15), value: 43 },
      { date: daysAgo(10), value: 41 },
      { date: daysAgo(5), value: 42 }
    ],
    lastUpdated: daysAgo(0),
    thresholds: {
      warning: 35,
      critical: 25
    }
  },
  {
    id: 'kpi-5',
    name: 'Net Promoter Score',
    description: 'Measure of customer satisfaction and loyalty',
    value: 38,
    target: 50,
    unit: 'points',
    format: 'number',
    trend: 'increasing',
    history: [
      { date: daysAgo(30), value: 32 },
      { date: daysAgo(25), value: 33 },
      { date: daysAgo(20), value: 35 },
      { date: daysAgo(15), value: 36 },
      { date: daysAgo(10), value: 36 },
      { date: daysAgo(5), value: 37 }
    ],
    lastUpdated: daysAgo(0),
    thresholds: {
      warning: 30,
      critical: 20
    }
  }
];

// Sample objectives
export const SAMPLE_OBJECTIVES: MissionObjective[] = [
  {
    id: 'obj-1',
    title: 'Improve Customer Retention',
    description: 'Identify and address key factors causing customer churn',
    status: 'in-progress',
    priority: 'high',
    progress: 65,
    startDate: daysAgo(30),
    dueDate: daysFromNow(30),
    kpis: ['kpi-1', 'kpi-5'],
    owner: 'Sarah Johnson',
    tags: ['customer', 'retention', 'churn']
  },
  {
    id: 'obj-2',
    title: 'Increase Monthly Recurring Revenue',
    description: 'Implement upsell strategies and new pricing tiers',
    status: 'in-progress',
    priority: 'critical',
    progress: 40,
    startDate: daysAgo(45),
    dueDate: daysFromNow(45),
    kpis: ['kpi-2'],
    owner: 'Michael Chen',
    tags: ['revenue', 'sales', 'growth']
  },
  {
    id: 'obj-3',
    title: 'Improve Support Response Time',
    description: 'Optimize support workflow and implement automated responses',
    status: 'in-progress',
    priority: 'medium',
    progress: 75,
    startDate: daysAgo(60),
    dueDate: daysFromNow(15),
    kpis: ['kpi-3'],
    owner: 'Emily Rodriguez',
    tags: ['support', 'customer satisfaction']
  },
  {
    id: 'obj-4',
    title: 'Enhance User Onboarding',
    description: 'Redesign onboarding flow to increase activation rate',
    status: 'not-started',
    priority: 'high',
    progress: 0,
    startDate: daysFromNow(5),
    dueDate: daysFromNow(60),
    kpis: ['kpi-4'],
    owner: 'Jason Lee',
    tags: ['onboarding', 'user experience', 'activation']
  }
];

// Sample actions
export const SAMPLE_ACTIONS: MissionAction[] = [
  {
    id: 'action-1',
    title: 'Implement customer feedback survey',
    description: 'Create and distribute feedback survey to recently churned customers',
    status: 'completed',
    type: 'manual',
    createdAt: daysAgo(25),
    completedAt: daysAgo(20),
    assignedTo: 'Sarah Johnson',
    relatedObjectiveId: 'obj-1',
    aiGenerated: false,
    source: 'manual'
  },
  {
    id: 'action-2',
    title: 'Analyze churn patterns',
    description: 'Identify common patterns among customers who churned in last quarter',
    status: 'completed',
    type: 'manual',
    createdAt: daysAgo(18),
    completedAt: daysAgo(12),
    assignedTo: 'Data Science Team',
    relatedObjectiveId: 'obj-1',
    aiGenerated: true,
    source: 'anomaly-detection'
  },
  {
    id: 'action-3',
    title: 'Develop retention improvement plan',
    description: 'Based on analysis, create action plan to improve retention',
    status: 'completed',
    type: 'manual',
    createdAt: daysAgo(10),
    completedAt: daysAgo(5),
    assignedTo: 'Sarah Johnson',
    relatedObjectiveId: 'obj-1',
    aiGenerated: false,
    source: 'manual'
  },
  {
    id: 'action-4',
    title: 'Implement loyalty program',
    description: 'Design and implement customer loyalty program with rewards',
    status: 'in-progress',
    type: 'manual',
    createdAt: daysAgo(5),
    scheduledFor: daysFromNow(20),
    assignedTo: 'Marketing Team',
    relatedObjectiveId: 'obj-1',
    aiGenerated: false,
    source: 'manual'
  },
  {
    id: 'action-5',
    title: 'Review pricing structure',
    description: 'Competitive analysis of pricing and recommendation for new tiers',
    status: 'completed',
    type: 'manual',
    createdAt: daysAgo(40),
    completedAt: daysAgo(35),
    assignedTo: 'Michael Chen',
    relatedObjectiveId: 'obj-2',
    aiGenerated: false,
    source: 'manual'
  },
  {
    id: 'action-6',
    title: 'Launch new enterprise tier',
    description: 'Deploy and market new enterprise pricing tier',
    status: 'in-progress',
    type: 'manual',
    createdAt: daysAgo(30),
    scheduledFor: daysFromNow(10),
    assignedTo: 'Product Team',
    relatedObjectiveId: 'obj-2',
    aiGenerated: false,
    source: 'manual'
  },
  {
    id: 'action-7',
    title: 'Implement chatbot for common queries',
    description: 'Deploy AI chatbot to handle frequently asked questions',
    status: 'pending',
    type: 'automated',
    createdAt: daysAgo(15),
    scheduledFor: daysFromNow(5),
    assignedTo: 'Tech Support Team',
    relatedObjectiveId: 'obj-3',
    aiGenerated: true,
    source: 'threshold-alert'
  }
];

// Sample enhanced missions
export const SAMPLE_ENHANCED_MISSIONS: EnhancedMission[] = [
  {
    id: 'enhanced-mission-1',
    name: 'Customer Success Transformation',
    description: 'Strategic initiative to improve customer satisfaction, retention and lifetime value',
    status: 'active',
    priority: 'critical',
    category: 'customer',
    startDate: daysAgo(60),
    endDate: daysFromNow(90),
    owner: 'Jennifer Williams',
    team: [
      { id: 'user-1', name: 'Sarah Johnson', role: 'Customer Success Lead', avatar: '/avatars/sarah.jpg' },
      { id: 'user-2', name: 'Michael Chen', role: 'Business Analyst', avatar: '/avatars/michael.jpg' },
      { id: 'user-3', name: 'Emily Rodriguez', role: 'Support Manager', avatar: '/avatars/emily.jpg' },
      { id: 'user-4', name: 'Jason Lee', role: 'Product Manager', avatar: '/avatars/jason.jpg' }
    ],
    objectives: SAMPLE_OBJECTIVES.slice(0, 3), // First 3 objectives
    kpis: SAMPLE_KPIS.slice(0, 3), // First 3 KPIs
    actions: SAMPLE_ACTIONS.slice(0, 7), // All actions
    dataSources: [
      { id: 'ds-1', name: 'CRM Database', type: 'database' },
      { id: 'ds-2', name: 'Support Tickets', type: 'api' },
      { id: 'ds-3', name: 'Customer Surveys', type: 'file' },
      { id: 'ds-4', name: 'Usage Analytics', type: 'stream' }
    ],
    dashboardIds: ['dashboard-1', 'dashboard-2'],
    tags: ['customer success', 'retention', 'revenue'],
    progress: 60
  },
  {
    id: 'enhanced-mission-2',
    name: 'Product Growth Initiative',
    description: 'Enhance product adoption, engagement, and conversion rates',
    status: 'active',
    priority: 'high',
    category: 'product',
    startDate: daysAgo(30),
    endDate: daysFromNow(120),
    owner: 'Daniel Park',
    team: [
      { id: 'user-4', name: 'Jason Lee', role: 'Product Manager', avatar: '/avatars/jason.jpg' },
      { id: 'user-5', name: 'Priya Sharma', role: 'UX Designer', avatar: '/avatars/priya.jpg' },
      { id: 'user-6', name: 'David Wilson', role: 'Growth Marketer', avatar: '/avatars/david.jpg' }
    ],
    objectives: [SAMPLE_OBJECTIVES[3]], // Just the user onboarding objective
    kpis: [SAMPLE_KPIS[3], SAMPLE_KPIS[4]], // Activation rate and NPS
    actions: [],
    dataSources: [
      { id: 'ds-4', name: 'Usage Analytics', type: 'stream' },
      { id: 'ds-5', name: 'A/B Test Results', type: 'api' },
      { id: 'ds-6', name: 'Product Metrics DB', type: 'database' }
    ],
    dashboardIds: ['dashboard-3'],
    tags: ['product', 'growth', 'onboarding'],
    progress: 15
  }
]; 