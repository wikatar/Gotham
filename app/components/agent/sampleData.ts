import { 
  Agent, 
  AgentAction, 
  AgentRecommendation 
} from './types';

// Helper functions for creating relative dates
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

// Sample agents
export const SAMPLE_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Data Insight Analyzer',
    description: 'Analyzes data patterns and generates insights based on historical trends',
    status: 'active',
    avatar: '/avatars/agent-data.svg',
    capabilities: ['data-analysis', 'recommendation', 'forecasting'],
    permissionLevel: 'suggest',
    assignedMissions: ['enhanced-mission-1'],
    lastActive: new Date(),
    createdAt: daysAgo(60),
    configOptions: {
      dataUpdateFrequency: 'hourly',
      sensitivity: 'medium',
      alertThreshold: 75
    },
    performance: {
      accuracy: 92,
      efficiency: 88,
      responseTime: 1200
    }
  },
  {
    id: 'agent-2',
    name: 'Sentinel Anomaly Detector',
    description: 'Monitors systems for anomalies and unusual patterns',
    status: 'active',
    avatar: '/avatars/agent-anomaly.svg',
    capabilities: ['anomaly-detection', 'alert-management'],
    permissionLevel: 'suggest',
    assignedMissions: ['enhanced-mission-1', 'enhanced-mission-2'],
    lastActive: daysAgo(1),
    createdAt: daysAgo(45),
    configOptions: {
      sensitivity: 'high',
      scanFrequency: 'continuous',
      baselineRecalculation: 'weekly'
    },
    performance: {
      accuracy: 94,
      efficiency: 91,
      responseTime: 800
    }
  },
  {
    id: 'agent-3',
    name: 'Automation Assistant',
    description: 'Automates routine tasks and processes',
    status: 'idle',
    avatar: '/avatars/agent-automation.svg',
    capabilities: ['automation', 'optimization'],
    permissionLevel: 'execute',
    assignedMissions: ['enhanced-mission-2'],
    lastActive: daysAgo(3),
    createdAt: daysAgo(30),
    configOptions: {
      executionMode: 'scheduled',
      reportingFrequency: 'daily',
      errorHandling: 'retry-3-times'
    },
    performance: {
      accuracy: 97,
      efficiency: 95,
      responseTime: 1500
    }
  },
  {
    id: 'agent-4',
    name: 'Strategic Forecaster',
    description: 'Predicts future trends and strategic opportunities',
    status: 'active',
    avatar: '/avatars/agent-forecaster.svg',
    capabilities: ['forecasting', 'recommendation', 'data-analysis'],
    permissionLevel: 'suggest',
    assignedMissions: ['enhanced-mission-1'],
    lastActive: daysAgo(2),
    createdAt: daysAgo(90),
    configOptions: {
      forecastHorizon: 'quarterly',
      confidenceThreshold: 70,
      modelType: 'ensemble'
    },
    performance: {
      accuracy: 86,
      efficiency: 82,
      responseTime: 3500
    }
  }
];

// Sample agent actions
export const SAMPLE_AGENT_ACTIONS: AgentAction[] = [
  {
    id: 'agent-action-1',
    agentId: 'agent-1',
    missionId: 'enhanced-mission-1',
    action: 'Analyzed customer churn patterns',
    status: 'completed',
    startTime: daysAgo(5),
    endTime: daysAgo(5),
    result: {
      summary: 'Identified 3 key factors contributing to churn',
      findings: ['Price sensitivity in SMB segment', 'Feature usage drop before cancellation', 'Support ticket frequency increase']
    }
  },
  {
    id: 'agent-action-2',
    agentId: 'agent-2',
    missionId: 'enhanced-mission-1',
    action: 'Detected anomaly in user login patterns',
    status: 'completed',
    startTime: daysAgo(2),
    endTime: daysAgo(2),
    result: {
      anomalyType: 'Sudden drop in enterprise user logins',
      severity: 'Medium',
      potentialCauses: ['System downtime', 'Authentication issue', 'Scheduled maintenance']
    }
  },
  {
    id: 'agent-action-3',
    agentId: 'agent-3',
    missionId: 'enhanced-mission-2',
    action: 'Optimized data processing workflow',
    status: 'in-progress',
    startTime: daysAgo(1),
    result: null
  },
  {
    id: 'agent-action-4',
    agentId: 'agent-4',
    missionId: 'enhanced-mission-1',
    action: 'Generated Q3 revenue forecast',
    status: 'pending',
    result: null
  }
];

// Sample agent recommendations
export const SAMPLE_AGENT_RECOMMENDATIONS: AgentRecommendation[] = [
  {
    id: 'recommendation-1',
    agentId: 'agent-1',
    missionId: 'enhanced-mission-1',
    title: 'Implement targeted retention offers for at-risk customers',
    description: 'Analysis shows that offering a 15% discount to customers showing early churn indicators could improve retention by 22%.',
    type: 'action',
    priority: 'high',
    confidence: 87,
    timestamp: daysAgo(3),
    status: 'new',
    relatedObjectiveId: 'obj-1',
    suggestedAction: {
      title: 'Launch targeted retention campaign',
      description: 'Create email campaign with personalized offers for customers with churn risk score > 65.',
      expectedOutcome: 'Reduce monthly churn rate by 18-25%.',
      estimatedImpact: 78
    },
    dataPoints: [
      { label: 'Current monthly churn rate', value: '5.2%', trend: 'up' },
      { label: 'Retention campaign success rate', value: '68%', trend: 'flat' },
      { label: 'Projected ROI', value: '420%', trend: 'up' }
    ]
  },
  {
    id: 'recommendation-2',
    agentId: 'agent-2',
    missionId: 'enhanced-mission-1',
    title: 'Investigate API performance degradation',
    description: 'Recurring pattern of API slowdowns detected during peak usage hours (2-4pm EST). Impact observed on customer satisfaction metrics.',
    type: 'warning',
    priority: 'critical',
    confidence: 92,
    timestamp: daysAgo(1),
    status: 'viewed',
    relatedObjectiveId: 'obj-3',
    suggestedAction: {
      title: 'Optimize API endpoint performance',
      description: 'Analyze query patterns and implement caching for frequently accessed resources.',
      expectedOutcome: 'Reduce API response times by 40-60% during peak hours.',
      estimatedImpact: 85
    },
    dataPoints: [
      { label: 'Avg API response time (peak)', value: '1850ms', trend: 'up' },
      { label: 'Error rate', value: '3.2%', trend: 'up' },
      { label: 'Customer satisfaction score', value: '78/100', trend: 'down' }
    ]
  },
  {
    id: 'recommendation-3',
    agentId: 'agent-4',
    missionId: 'enhanced-mission-1',
    title: 'Opportunity in enterprise segment expansion',
    description: 'Forecasting models indicate untapped potential in healthcare enterprise segment with projected 28% growth in next 12 months.',
    type: 'opportunity',
    priority: 'medium',
    confidence: 81,
    timestamp: daysAgo(7),
    status: 'accepted',
    suggestedAction: {
      title: 'Develop healthcare vertical strategy',
      description: 'Create targeted marketing materials, case studies, and feature roadmap for healthcare enterprises.',
      expectedOutcome: 'Increase healthcare segment revenue by 20% within 6 months.',
      estimatedImpact: 72
    },
    dataPoints: [
      { label: 'Healthcare market growth rate', value: '12%', trend: 'up' },
      { label: 'Current market penetration', value: '8%', trend: 'flat' },
      { label: 'Projected revenue opportunity', value: '$2.4M', trend: 'up' }
    ]
  },
  {
    id: 'recommendation-4',
    agentId: 'agent-1',
    missionId: 'enhanced-mission-2',
    title: 'Product usage insights for onboarding improvements',
    description: 'Analysis of user onboarding data shows 40% of new users never discover key features that drive retention.',
    type: 'insight',
    priority: 'high',
    confidence: 89,
    timestamp: daysAgo(5),
    status: 'new',
    relatedObjectiveId: 'obj-3',
    suggestedAction: {
      title: 'Redesign in-app onboarding experience',
      description: 'Create guided tour highlighting key features and implement usage milestones with rewards.',
      expectedOutcome: 'Increase feature discovery by 35% and improve 30-day retention by 25%.',
      estimatedImpact: 76
    },
    dataPoints: [
      { label: 'Feature discovery rate', value: '60%', trend: 'down' },
      { label: '30-day user retention', value: '42%', trend: 'down' },
      { label: 'Users completing onboarding', value: '78%', trend: 'flat' }
    ]
  }
]; 