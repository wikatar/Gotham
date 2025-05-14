// Orchestrator Rules Engine
// This module applies business rules to input data and context

interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  condition: (context: any, data: any[]) => boolean;
  action: (context: any, data: any[]) => any;
}

interface OrchestratorResult {
  decision: string;
  confidence: number;
  actions: Array<{
    type: string;
    parameters: Record<string, any>;
    priority: number;
  }>;
  insights: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
  }>;
}

// Example rules repository - in production would be loaded from database
const rules: Rule[] = [
  {
    id: 'rule-001',
    name: 'High data volume alert',
    description: 'Trigger alert when data volume exceeds threshold',
    priority: 2,
    condition: (context, data) => data.length > context.thresholds?.dataVolume || 1000,
    action: (context, data) => ({
      decision: 'alert',
      actions: [
        {
          type: 'notification',
          parameters: {
            channel: 'slack',
            message: `High data volume detected: ${data.length} records`
          },
          priority: 2
        }
      ]
    })
  },
  {
    id: 'rule-002',
    name: 'Anomaly detection',
    description: 'Detect anomalies in numeric data',
    priority: 1,
    condition: (context, data) => {
      // Simple anomaly detection based on standard deviation
      if (data.length < 5) return false;
      
      const numericValues = data
        .filter(item => typeof item.value === 'number')
        .map(item => item.value);
      
      if (numericValues.length < 5) return false;
      
      const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const variance = numericValues.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / numericValues.length;
      const stdDev = Math.sqrt(variance);
      
      return numericValues.some(val => Math.abs(val - avg) > stdDev * 3);
    },
    action: (context, data) => ({
      decision: 'investigate',
      actions: [
        {
          type: 'analysis',
          parameters: {
            method: 'anomaly_detection',
            data: data
          },
          priority: 1
        }
      ]
    })
  }
];

/**
 * Apply rules to the provided data and context
 */
export async function applyRules(
  accountId: string,
  missionId: string,
  context: Record<string, any>,
  data: any[]
): Promise<OrchestratorResult> {
  console.log('stub: applyRules');

  // Default result
  const result: OrchestratorResult = {
    decision: 'no_action',
    confidence: 0,
    actions: [],
    insights: []
  };

  // Enhanced context with account and mission IDs
  const enhancedContext = {
    ...context,
    accountId,
    missionId,
  };

  // Apply rules
  const applicableRules = rules
    .filter(rule => rule.condition(enhancedContext, data))
    .sort((a, b) => a.priority - b.priority);

  if (applicableRules.length === 0) {
    result.insights.push({
      type: 'rule_evaluation',
      message: 'No rules were triggered for this data and context',
      severity: 'info'
    });
    return result;
  }

  // Apply actions from triggered rules
  let highestPriorityRule = applicableRules[0];
  const ruleResult = highestPriorityRule.action(enhancedContext, data);

  // Update result with highest priority rule
  result.decision = ruleResult.decision;
  result.confidence = 0.8; // Placeholder - would be calculated based on rule confidence
  
  if (ruleResult.actions) {
    result.actions = [...result.actions, ...ruleResult.actions];
  }
  
  // Add insights about triggered rules
  result.insights.push({
    type: 'rule_triggered',
    message: `Rule "${highestPriorityRule.name}" triggered with priority ${highestPriorityRule.priority}`,
    severity: 'info'
  });

  // Additional triggered rules as insights
  applicableRules.slice(1).forEach(rule => {
    result.insights.push({
      type: 'rule_suppressed',
      message: `Lower priority rule "${rule.name}" was also triggered but suppressed`,
      severity: 'info'
    });
  });

  return result;
} 