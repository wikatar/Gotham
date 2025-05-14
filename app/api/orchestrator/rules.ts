// /api/orchestrator/rules.ts

import { z } from 'zod'
import { applyRule } from './rulesEngine'

// Schema för inkommande regeldata (kan utökas med viktning etc.)
export const RuleSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  description: z.string().optional(),
  condition: z.any(), // JSONLogic eller liknande struktur
  action: z.object({
    type: z.enum(['trigger_model', 'run_agent', 'create_alert']),
    target: z.string(), // modelId, agentId etc.
    parameters: z.any().optional(),
  }),
  priority: z.number().default(0),
  active: z.boolean().default(true),
})

// Typ för TypeScript
export type Rule = z.infer<typeof RuleSchema>

// Dummy: Exempellista med regler
export const SAMPLE_RULES: Rule[] = [
  {
    id: 'rule-1',
    missionId: 'mission-abc',
    condition: {
      and: [
        { '>': [{ var: 'churn_rate' }, 0.2] },
        { '<': [{ var: 'feedback_score' }, 0.6] },
      ],
    },
    action: {
      type: 'run_agent',
      target: 'agent-slack-1',
      parameters: {
        message: 'Churn risk identified',
      },
    },
    priority: 10,
    active: true,
  },
  {
    id: 'rule-2',
    missionId: 'mission-abc',
    condition: {
      '>': [{ var: 'avg_response_time' }, 5000],
    },
    action: {
      type: 'trigger_model',
      target: 'model-latency-analyzer',
    },
    priority: 5,
    active: true,
  },
]

// Kör alla regler och returnera matchande actions
export function evaluateRules(data: any, rules: Rule[], missionId: string) {
  const matched = []

  for (const rule of rules.filter((r) => r.missionId === missionId && r.active)) {
    const result = applyRule(rule.condition, data)
    if (result) {
      matched.push({
        ruleId: rule.id,
        action: rule.action,
        priority: rule.priority,
      })
    }
  }

  // Sortera efter högst prioritet först
  matched.sort((a, b) => b.priority - a.priority)

  return matched
} 