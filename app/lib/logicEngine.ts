import { LogicRule } from '@prisma/client'
import { LogicCondition, LogicAction, LogicOperator } from '../types/logic'
import { db } from './db'

// Action result interface
export interface ActionResult {
  action: LogicAction
  ruleId: string
  ruleName: string
  success: boolean
  result?: any
  error?: string
  executedAt: Date
}

// Engine execution result
export interface LogicEngineResult {
  totalRulesEvaluated: number
  rulesTriggered: number
  actionsExecuted: number
  actionResults: ActionResult[]
  executionTime: number
  errors: string[]
}

// Context for rule execution
export interface ExecutionContext {
  entityType?: string
  entityId?: string
  missionId?: string
  userId?: string
  metadata?: Record<string, any>
}

/**
 * Main function to run logic rules against data
 */
export async function runLogicRules(
  data: any, 
  context: ExecutionContext = {},
  customRules?: LogicRule[]
): Promise<LogicEngineResult> {
  const startTime = Date.now()
  const result: LogicEngineResult = {
    totalRulesEvaluated: 0,
    rulesTriggered: 0,
    actionsExecuted: 0,
    actionResults: [],
    executionTime: 0,
    errors: []
  }

  try {
    // Get rules to evaluate
    const rules = customRules || await getRelevantRules(context)
    result.totalRulesEvaluated = rules.length

    // Sort rules by priority (highest first)
    const sortedRules = rules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority)

    // Evaluate each rule
    for (const rule of sortedRules) {
      try {
        const isTriggered = await evaluateRule(rule, data, context)
        
        if (isTriggered) {
          result.rulesTriggered++
          
          // Execute actions for triggered rule
          const actionResults = await executeRuleActions(rule, data, context)
          result.actionResults.push(...actionResults)
          result.actionsExecuted += actionResults.length
        }
      } catch (error) {
        const errorMsg = `Error evaluating rule ${rule.id}: ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

  } catch (error) {
    const errorMsg = `Logic engine error: ${error}`
    result.errors.push(errorMsg)
    console.error(errorMsg)
  }

  result.executionTime = Date.now() - startTime
  return result
}

/**
 * Get relevant rules based on context
 */
async function getRelevantRules(context: ExecutionContext): Promise<LogicRule[]> {
  const where: any = {
    isActive: true
  }

  // Filter by entity type if provided
  if (context.entityType) {
    where.OR = [
      { entityType: context.entityType },
      { entityType: null } // Include global rules
    ]
  }

  // Filter by specific entity if provided
  if (context.entityId) {
    where.AND = [
      where.AND || {},
      {
        OR: [
          { entityId: context.entityId },
          { entityId: null } // Include non-entity-specific rules
        ]
      }
    ]
  }

  return await db.logicRule.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  })
}

/**
 * Evaluate if a rule should be triggered
 */
async function evaluateRule(
  rule: LogicRule, 
  data: any, 
  context: ExecutionContext
): Promise<boolean> {
  try {
    const conditions: LogicCondition[] = JSON.parse(rule.conditions)
    const logicType = rule.logicType as 'AND' | 'OR'

    if (conditions.length === 0) return false

    // Evaluate conditions based on logic type
    if (logicType === 'AND') {
      return conditions.every(condition => evaluateCondition(condition, data, context))
    } else {
      return conditions.some(condition => evaluateCondition(condition, data, context))
    }
  } catch (error) {
    console.error(`Error parsing conditions for rule ${rule.id}:`, error)
    return false
  }
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(
  condition: LogicCondition, 
  data: any, 
  context: ExecutionContext
): boolean {
  try {
    const fieldValue = getFieldValue(condition.field, data, context)
    const conditionValue = condition.value
    const operator = condition.operator

    return evaluateOperator(fieldValue, operator, conditionValue)
  } catch (error) {
    console.error(`Error evaluating condition:`, error)
    return false
  }
}

/**
 * Get field value from data or context
 */
function getFieldValue(field: string, data: any, context: ExecutionContext): any {
  // Try to get from main data first
  if (data && data.hasOwnProperty(field)) {
    return data[field]
  }

  // Try to get from context metadata
  if (context.metadata && context.metadata.hasOwnProperty(field)) {
    return context.metadata[field]
  }

  // Try nested field access (e.g., "user.email")
  if (field.includes('.')) {
    const parts = field.split('.')
    let value = data
    for (const part of parts) {
      if (value && typeof value === 'object' && value.hasOwnProperty(part)) {
        value = value[part]
      } else {
        return undefined
      }
    }
    return value
  }

  return undefined
}

/**
 * Evaluate operator logic
 */
function evaluateOperator(
  fieldValue: any, 
  operator: LogicOperator, 
  conditionValue: any
): boolean {
  // Handle null/undefined values
  if (fieldValue === null || fieldValue === undefined) {
    switch (operator) {
      case 'is_empty':
        return true
      case 'is_not_empty':
        return false
      default:
        return false
    }
  }

  switch (operator) {
    case 'equals':
      return fieldValue === conditionValue

    case 'not_equals':
      return fieldValue !== conditionValue

    case 'greater_than':
      return Number(fieldValue) > Number(conditionValue)

    case 'greater_than_or_equal':
      return Number(fieldValue) >= Number(conditionValue)

    case 'less_than':
      return Number(fieldValue) < Number(conditionValue)

    case 'less_than_or_equal':
      return Number(fieldValue) <= Number(conditionValue)

    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())

    case 'not_contains':
      return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())

    case 'starts_with':
      return String(fieldValue).toLowerCase().startsWith(String(conditionValue).toLowerCase())

    case 'ends_with':
      return String(fieldValue).toLowerCase().endsWith(String(conditionValue).toLowerCase())

    case 'is_empty':
      return !fieldValue || String(fieldValue).trim() === ''

    case 'is_not_empty':
      return fieldValue && String(fieldValue).trim() !== ''

    case 'in':
      const inValues = Array.isArray(conditionValue) ? conditionValue : [conditionValue]
      return inValues.includes(fieldValue)

    case 'not_in':
      const notInValues = Array.isArray(conditionValue) ? conditionValue : [conditionValue]
      return !notInValues.includes(fieldValue)

    default:
      console.warn(`Unknown operator: ${operator}`)
      return false
  }
}

/**
 * Execute actions for a triggered rule
 */
async function executeRuleActions(
  rule: LogicRule, 
  data: any, 
  context: ExecutionContext
): Promise<ActionResult[]> {
  const results: ActionResult[] = []

  try {
    const actions: LogicAction[] = JSON.parse(rule.actions)

    for (const action of actions) {
      const result = await executeAction(action, rule, data, context)
      results.push(result)
    }
  } catch (error) {
    console.error(`Error parsing actions for rule ${rule.id}:`, error)
    results.push({
      action: { type: 'log_event' } as LogicAction,
      ruleId: rule.id,
      ruleName: rule.name,
      success: false,
      error: `Failed to parse actions: ${error}`,
      executedAt: new Date()
    })
  }

  return results
}

/**
 * Execute a single action
 */
async function executeAction(
  action: LogicAction,
  rule: LogicRule,
  data: any,
  context: ExecutionContext
): Promise<ActionResult> {
  const result: ActionResult = {
    action,
    ruleId: rule.id,
    ruleName: rule.name,
    success: false,
    executedAt: new Date()
  }

  try {
    switch (action.type) {
      case 'notify_agent':
        result.result = await executeNotifyAgent(action, data, context)
        break

      case 'create_incident':
        result.result = await executeCreateIncident(action, data, context)
        break

      case 'flag_entity':
        result.result = await executeFlagEntity(action, data, context)
        break

      case 'update_field':
        result.result = await executeUpdateField(action, data, context)
        break

      case 'trigger_mission':
        result.result = await executeTriggerMission(action, data, context)
        break

      case 'send_email':
        result.result = await executeSendEmail(action, data, context)
        break

      case 'webhook':
        result.result = await executeWebhook(action, data, context)
        break

      case 'log_event':
        result.result = await executeLogEvent(action, data, context)
        break

      case 'escalate':
        result.result = await executeEscalate(action, data, context)
        break

      case 'assign_task':
        result.result = await executeAssignTask(action, data, context)
        break

      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }

    result.success = true
  } catch (error) {
    result.error = String(error)
    console.error(`Error executing action ${action.type}:`, error)
  }

  return result
}

// Action execution functions
async function executeNotifyAgent(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { agentId, message, priority } = action.parameters || {}
  
  if (!agentId) {
    throw new Error('agentId is required for notify_agent action')
  }

  // Log the notification (in real implementation, this would send to agent system)
  const notification = {
    agentId,
    message: message || `Rule triggered: ${context.entityType} data changed`,
    priority: priority || 'medium',
    data,
    context,
    timestamp: new Date()
  }

  console.log('Agent notification:', notification)
  return notification
}

async function executeCreateIncident(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { title, severity, description, assignedTo } = action.parameters || {}
  
  if (!title || !severity) {
    throw new Error('title and severity are required for create_incident action')
  }

  const incident = await db.incidentReport.create({
    data: {
      title,
      description: description || `Automatically created by logic rule`,
      severity,
      status: 'open',
      sourceType: 'agent',
      tags: 'automated,logic-rule',
      createdBy: context.userId || 'logic-engine',
      readToken: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      missionId: context.missionId || null
    }
  })

  console.log('Created incident:', incident.id)
  return incident
}

async function executeFlagEntity(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { flagType, reason, priority } = action.parameters || {}
  
  if (!flagType) {
    throw new Error('flagType is required for flag_entity action')
  }

  // Log the flag (in real implementation, this would update entity flags)
  const flag = {
    entityType: context.entityType,
    entityId: context.entityId,
    flagType,
    reason: reason || 'Flagged by logic rule',
    priority: priority || 'medium',
    timestamp: new Date()
  }

  console.log('Entity flagged:', flag)
  return flag
}

async function executeUpdateField(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { field, value, reason } = action.parameters || {}
  
  if (!field || value === undefined) {
    throw new Error('field and value are required for update_field action')
  }

  // Log the update (in real implementation, this would update the actual entity)
  const update = {
    entityType: context.entityType,
    entityId: context.entityId,
    field,
    oldValue: data[field],
    newValue: value,
    reason: reason || 'Updated by logic rule',
    timestamp: new Date()
  }

  console.log('Field updated:', update)
  return update
}

async function executeTriggerMission(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { missionId, actionType, parameters } = action.parameters || {}
  
  if (!missionId) {
    throw new Error('missionId is required for trigger_mission action')
  }

  // Log the mission trigger (in real implementation, this would interact with mission system)
  const trigger = {
    missionId,
    actionType: actionType || 'update',
    parameters: parameters || {},
    triggeredBy: 'logic-rule',
    timestamp: new Date()
  }

  console.log('Mission triggered:', trigger)
  return trigger
}

async function executeSendEmail(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { recipient, subject, template, attachments } = action.parameters || {}
  
  if (!recipient || !subject) {
    throw new Error('recipient and subject are required for send_email action')
  }

  // Log the email (in real implementation, this would send actual email)
  const email = {
    to: recipient,
    subject,
    template: template || 'default',
    attachments: attachments || [],
    data,
    context,
    timestamp: new Date()
  }

  console.log('Email sent:', email)
  return email
}

async function executeWebhook(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { url, method, headers, payload } = action.parameters || {}
  
  if (!url) {
    throw new Error('url is required for webhook action')
  }

  // In real implementation, this would make actual HTTP request
  const webhookCall = {
    url,
    method: method || 'POST',
    headers: headers || { 'Content-Type': 'application/json' },
    payload: payload || { data, context },
    timestamp: new Date()
  }

  console.log('Webhook called:', webhookCall)
  return webhookCall
}

async function executeLogEvent(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { eventType, details, severity } = action.parameters || {}
  
  if (!eventType) {
    throw new Error('eventType is required for log_event action')
  }

  const logEntry = await db.activityLog.create({
    data: {
      entityType: context.entityType || 'system',
      entityId: context.entityId || 'logic-engine',
      action: eventType,
      actor: context.userId || 'logic-engine',
      actorName: 'Logic Engine',
      description: details || `Logic rule executed: ${eventType}`,
      metadata: JSON.stringify({
        severity: severity || 'info',
        ruleData: data,
        context
      })
    }
  })

  console.log('Event logged:', logEntry.id)
  return logEntry
}

async function executeEscalate(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { escalationLevel, reason, assignedTo } = action.parameters || {}
  
  if (!escalationLevel) {
    throw new Error('escalationLevel is required for escalate action')
  }

  // Log the escalation (in real implementation, this would trigger escalation workflow)
  const escalation = {
    level: escalationLevel,
    reason: reason || 'Escalated by logic rule',
    assignedTo: assignedTo || 'default-escalation-team',
    entityType: context.entityType,
    entityId: context.entityId,
    data,
    timestamp: new Date()
  }

  console.log('Escalation triggered:', escalation)
  return escalation
}

async function executeAssignTask(
  action: LogicAction, 
  data: any, 
  context: ExecutionContext
): Promise<any> {
  const { assignedTo, taskTitle, description, dueDate, priority } = action.parameters || {}
  
  if (!assignedTo || !taskTitle) {
    throw new Error('assignedTo and taskTitle are required for assign_task action')
  }

  // Log the task assignment (in real implementation, this would create actual task)
  const task = {
    assignedTo,
    title: taskTitle,
    description: description || 'Task created by logic rule',
    dueDate: dueDate || null,
    priority: priority || 'medium',
    entityType: context.entityType,
    entityId: context.entityId,
    createdBy: 'logic-engine',
    timestamp: new Date()
  }

  console.log('Task assigned:', task)
  return task
}

/**
 * Utility function to run rules for specific entity
 */
export async function runRulesForEntity(
  entityType: string,
  entityId: string,
  entityData: any,
  userId?: string
): Promise<LogicEngineResult> {
  return await runLogicRules(entityData, {
    entityType,
    entityId,
    userId
  })
}

/**
 * Utility function to run rules for mission
 */
export async function runRulesForMission(
  missionId: string,
  missionData: any,
  userId?: string
): Promise<LogicEngineResult> {
  return await runLogicRules(missionData, {
    entityType: 'mission',
    entityId: missionId,
    missionId,
    userId
  })
}

/**
 * Test function to validate rule logic
 */
export async function testRule(
  rule: LogicRule,
  testData: any,
  context: ExecutionContext = {}
): Promise<{
  triggered: boolean
  conditionResults: Array<{ condition: LogicCondition; result: boolean }>
  actionResults?: ActionResult[]
}> {
  const conditions: LogicCondition[] = JSON.parse(rule.conditions)
  const conditionResults = conditions.map(condition => ({
    condition,
    result: evaluateCondition(condition, testData, context)
  }))

  const triggered = await evaluateRule(rule, testData, context)
  
  let actionResults: ActionResult[] | undefined
  if (triggered) {
    actionResults = await executeRuleActions(rule, testData, context)
  }

  return {
    triggered,
    conditionResults,
    actionResults
  }
} 