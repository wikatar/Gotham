// Logic Builder Types

export interface LogicCondition {
  id?: string
  field: string
  operator: LogicOperator
  value: any
  dataType?: 'string' | 'number' | 'boolean' | 'date'
}

export interface LogicAction {
  id?: string
  type: ActionType
  target?: string
  parameters?: Record<string, any>
  message?: string
}

export interface LogicRule {
  id: string
  name: string
  description?: string
  entityType?: string
  entityId?: string
  conditions: LogicCondition[]
  actions: LogicAction[]
  logicType: 'AND' | 'OR'
  isActive: boolean
  priority: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export type LogicOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in'

export type ActionType =
  | 'notify_agent'
  | 'create_incident'
  | 'flag_entity'
  | 'update_field'
  | 'trigger_mission'
  | 'send_email'
  | 'webhook'
  | 'log_event'
  | 'escalate'
  | 'assign_task'

export interface FieldDefinition {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'select'
  options?: { value: string; label: string }[]
  description?: string
}

export interface EntityFieldMap {
  [entityType: string]: FieldDefinition[]
}

// Predefined field definitions for different entity types
export const ENTITY_FIELDS: EntityFieldMap = {
  mission: [
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Aktiv' },
      { value: 'completed', label: 'Slutförd' },
      { value: 'cancelled', label: 'Avbruten' }
    ]},
    { name: 'name', label: 'Namn', type: 'string' },
    { name: 'startDate', label: 'Startdatum', type: 'date' },
    { name: 'endDate', label: 'Slutdatum', type: 'date' }
  ],
  incident: [
    { name: 'severity', label: 'Allvarlighetsgrad', type: 'select', options: [
      { value: 'low', label: 'Låg' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'Hög' },
      { value: 'critical', label: 'Kritisk' }
    ]},
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'open', label: 'Öppen' },
      { value: 'investigating', label: 'Undersöks' },
      { value: 'resolved', label: 'Löst' }
    ]},
    { name: 'title', label: 'Titel', type: 'string' },
    { name: 'sourceType', label: 'Källtyp', type: 'string' },
    { name: 'createdAt', label: 'Skapad', type: 'date' }
  ],
  anomaly: [
    { name: 'severity', label: 'Allvarlighetsgrad', type: 'select', options: [
      { value: 'low', label: 'Låg' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'Hög' },
      { value: 'critical', label: 'Kritisk' }
    ]},
    { name: 'resolved', label: 'Löst', type: 'boolean' },
    { name: 'title', label: 'Titel', type: 'string' },
    { name: 'resourceType', label: 'Resurstyp', type: 'string' },
    { name: 'detectedAt', label: 'Upptäckt', type: 'date' }
  ],
  customer: [
    { name: 'riskScore', label: 'Riskpoäng', type: 'number' },
    { name: 'churnProbability', label: 'Churn-sannolikhet', type: 'number' },
    { name: 'segment', label: 'Segment', type: 'select', options: [
      { value: 'high_value', label: 'Högt värde' },
      { value: 'regular', label: 'Vanlig' },
      { value: 'at_risk', label: 'Risk' }
    ]},
    { name: 'lastLoginDays', label: 'Dagar sedan senaste inloggning', type: 'number' },
    { name: 'totalSpent', label: 'Total spenderad summa', type: 'number' }
  ],
  pipeline: [
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'running', label: 'Körs' },
      { value: 'completed', label: 'Slutförd' },
      { value: 'failed', label: 'Misslyckad' }
    ]},
    { name: 'executionTime', label: 'Exekveringstid (sekunder)', type: 'number' },
    { name: 'errorRate', label: 'Felfrekvens', type: 'number' },
    { name: 'dataQualityScore', label: 'Datakvalitetspoäng', type: 'number' }
  ]
}

// Operator definitions with labels and supported data types
export const OPERATORS: Record<LogicOperator, { 
  label: string; 
  supportedTypes: string[];
  requiresValue: boolean;
}> = {
  equals: { label: 'är lika med', supportedTypes: ['string', 'number', 'boolean', 'date'], requiresValue: true },
  not_equals: { label: 'är inte lika med', supportedTypes: ['string', 'number', 'boolean', 'date'], requiresValue: true },
  greater_than: { label: 'är större än', supportedTypes: ['number', 'date'], requiresValue: true },
  greater_than_or_equal: { label: 'är större än eller lika med', supportedTypes: ['number', 'date'], requiresValue: true },
  less_than: { label: 'är mindre än', supportedTypes: ['number', 'date'], requiresValue: true },
  less_than_or_equal: { label: 'är mindre än eller lika med', supportedTypes: ['number', 'date'], requiresValue: true },
  contains: { label: 'innehåller', supportedTypes: ['string'], requiresValue: true },
  not_contains: { label: 'innehåller inte', supportedTypes: ['string'], requiresValue: true },
  starts_with: { label: 'börjar med', supportedTypes: ['string'], requiresValue: true },
  ends_with: { label: 'slutar med', supportedTypes: ['string'], requiresValue: true },
  is_empty: { label: 'är tom', supportedTypes: ['string'], requiresValue: false },
  is_not_empty: { label: 'är inte tom', supportedTypes: ['string'], requiresValue: false },
  in: { label: 'är en av', supportedTypes: ['string', 'number'], requiresValue: true },
  not_in: { label: 'är inte en av', supportedTypes: ['string', 'number'], requiresValue: true }
}

// Action definitions with labels and parameter requirements
export const ACTIONS: Record<ActionType, {
  label: string;
  description: string;
  requiredParams: string[];
  optionalParams: string[];
}> = {
  notify_agent: {
    label: 'Notifiera agent',
    description: 'Skicka notifiering till en specifik AI-agent',
    requiredParams: ['agentId'],
    optionalParams: ['message', 'priority']
  },
  create_incident: {
    label: 'Skapa incident',
    description: 'Skapa en ny incident automatiskt',
    requiredParams: ['title', 'severity'],
    optionalParams: ['description', 'assignedTo']
  },
  flag_entity: {
    label: 'Flagga entitet',
    description: 'Markera entitet för uppmärksamhet',
    requiredParams: ['flagType'],
    optionalParams: ['reason', 'priority']
  },
  update_field: {
    label: 'Uppdatera fält',
    description: 'Ändra värde på ett specifikt fält',
    requiredParams: ['field', 'value'],
    optionalParams: ['reason']
  },
  trigger_mission: {
    label: 'Utlös mission',
    description: 'Starta en ny mission eller uppdatera befintlig',
    requiredParams: ['missionId'],
    optionalParams: ['action', 'parameters']
  },
  send_email: {
    label: 'Skicka e-post',
    description: 'Skicka e-postnotifiering',
    requiredParams: ['recipient', 'subject'],
    optionalParams: ['template', 'attachments']
  },
  webhook: {
    label: 'Webhook',
    description: 'Anropa extern webhook',
    requiredParams: ['url'],
    optionalParams: ['method', 'headers', 'payload']
  },
  log_event: {
    label: 'Logga händelse',
    description: 'Skapa loggpost för händelsen',
    requiredParams: ['eventType'],
    optionalParams: ['details', 'severity']
  },
  escalate: {
    label: 'Eskalera',
    description: 'Eskalera till högre nivå eller team',
    requiredParams: ['escalationLevel'],
    optionalParams: ['reason', 'assignedTo']
  },
  assign_task: {
    label: 'Tilldela uppgift',
    description: 'Skapa och tilldela en uppgift',
    requiredParams: ['assignedTo', 'taskTitle'],
    optionalParams: ['description', 'dueDate', 'priority']
  }
} 