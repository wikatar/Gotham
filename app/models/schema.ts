import mongoose, { Schema } from 'mongoose'

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'analyst', 'viewer'], default: 'viewer' },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date },
  settings: { type: Object, default: {} },
  // Add reference to user's missions
  missions: [{ type: Schema.Types.ObjectId, ref: 'Mission' }],
  // Add active mission for current context
  active_mission_id: { type: Schema.Types.ObjectId, ref: 'Mission' },
})

// Enhanced: Mission Schema (Projects/Workspaces)
const missionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' }
  }],
  dashboards: [{ type: Schema.Types.ObjectId, ref: 'Dashboard' }],
  data_sources: [{ type: Schema.Types.ObjectId, ref: 'DataSource' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  settings: { type: Object, default: {} },
  // Reference to the template used, if any
  template_id: { type: Schema.Types.ObjectId, ref: 'Template' },
  // Default dashboard to show
  default_dashboard_id: { type: Schema.Types.ObjectId, ref: 'Dashboard' },
  // For organization/categorization
  tags: [String],
  // For mission type classification
  category: { type: String },
  // Mission 2.0 Enhancement
  goals: [{
    title: { type: String, required: true },
    description: { type: String },
    metrics: [{
      kpi: { type: String, required: true },
      target: { type: Number },
      current: { type: Number },
      threshold: { type: Number },
      unit: { type: String },
    }],
    status: { type: String, enum: ['pending', 'active', 'completed', 'failed'], default: 'active' },
    start_date: { type: Date },
    end_date: { type: Date },
  }],
  // Agents assigned to this mission
  assigned_agents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
})

// NEW: Template Schema
const templateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['business', 'hr', 'finance', 'marketing', 'operations', 'custom'], required: true },
  role_focus: [String], // e.g., 'CEO', 'HR Manager', 'Investor'
  dashboards: [{
    name: { type: String, required: true },
    layout: { type: Array, default: [] },
    widgets: { type: Array, default: [] },
    is_default: { type: Boolean, default: false },
  }],
  recommended_data_sources: [String],
  sample_entities: [Object],
  created_at: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  thumbnail: { type: String }, // URL to template preview image
})

// ENHANCED: DataSource Schema (Feed Center)
const dataSourceSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['api', 'database', 'file', 'live_feed', 'simulation'], required: true },
  config: { type: Object, required: true },
  mission_id: { type: Schema.Types.ObjectId, ref: 'Mission' },
  status: { type: String, enum: ['active', 'inactive', 'error'], default: 'active' },
  refresh_rate: { type: String }, // For live data, e.g., '5m', '1h'
  last_updated: { type: Date },
  schema: { type: Object }, // Data schema/structure
  created_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  // Feed Center enhancements
  metadata: {
    criticality: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    category: { type: String },
    update_frequency: { type: String }, // Human readable, e.g. "Daily", "Real-time"
    data_quality: { type: Number, min: 0, max: 100 }, // Quality score
    volume: { type: String }, // Approximate data volume
    format: { type: String }, // Data format
  },
  // Health monitoring
  health_checks: [{
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'warning', 'error'] },
    message: { type: String },
    response_time: { type: Number }, // In milliseconds
  }],
  // Strategic feed tag
  is_strategic: { type: Boolean, default: false },
  // Semantic mapping - links to concepts in the ontology
  semantic_mappings: [{
    concept_id: { type: Schema.Types.ObjectId, ref: 'Concept' },
    field_path: { type: String }, // JSON path to the field in the data
    mapping_type: { type: String, enum: ['direct', 'transformation', 'aggregation'] },
    transformation: { type: String }, // Optional transformation logic
  }],
})

// NEW: Semantic Concept Schema (Ontology)
const conceptSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  domain: { type: String }, // Business domain this concept belongs to
  attributes: [{
    name: { type: String, required: true },
    description: { type: String },
    data_type: { type: String, required: true },
    is_required: { type: Boolean, default: false },
    validation_rules: { type: Object },
  }],
  relationships: [{
    target_concept: { type: Schema.Types.ObjectId, ref: 'Concept' },
    relation_type: { type: String, required: true }, // e.g., "has many", "belongs to"
    is_bidirectional: { type: Boolean, default: false },
    cardinality: { type: String }, // e.g., "1:n", "n:n"
  }],
  // Sample data for visualization and understanding
  examples: [{ type: Object }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
})

// NEW: Agent Schema (Agent Layer)
const agentSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['monitor', 'analyzer', 'executor', 'notifier', 'custom'], required: true },
  status: { type: String, enum: ['active', 'paused', 'disabled'], default: 'active' },
  // Trigger conditions
  triggers: [{
    type: { type: String, enum: ['schedule', 'event', 'condition', 'manual'], required: true },
    config: { type: Object, required: true }, // Depends on trigger type
    last_triggered: { type: Date },
  }],
  // Actions that the agent can perform
  actions: [{
    type: { type: String, enum: ['notification', 'data_update', 'api_call', 'task_creation', 'webhook'], required: true },
    config: { type: Object, required: true }, // Action-specific configuration
    requires_approval: { type: Boolean, default: false },
  }],
  // For monitoring agents - what data they watch
  monitored_sources: [{
    source_id: { type: Schema.Types.ObjectId, refPath: 'source_type' },
    source_type: { type: String, enum: ['DataSource', 'Mission', 'Agent', 'Dashboard'] },
    monitored_fields: [String], // Specific fields to monitor
    thresholds: { type: Object }, // Alert thresholds
  }],
  // Execution log
  executions: [{
    timestamp: { type: Date, default: Date.now },
    trigger_id: { type: String }, // Which trigger fired
    status: { type: String, enum: ['success', 'warning', 'error', 'pending_approval'] },
    details: { type: Object },
    actions_taken: [{ type: Object }],
  }],
  // Who owns this agent
  owner_id: { type: Schema.Types.ObjectId, ref: 'User' },
  // Which mission this agent is assigned to (if any)
  mission_id: { type: Schema.Types.ObjectId, ref: 'Mission' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

// NEW: Causal Model Schema (Explainability)
const causalModelSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  // Domain of the causal model
  domain: { type: String, required: true },
  // Variables in the model
  variables: [{
    name: { type: String, required: true },
    concept_id: { type: Schema.Types.ObjectId, ref: 'Concept' }, // Linked semantic concept
    description: { type: String },
    type: { type: String, enum: ['continuous', 'categorical', 'binary'], required: true },
    possible_values: [{ type: Schema.Types.Mixed }], // For categorical variables
  }],
  // Causal relationships
  relationships: [{
    cause: { type: String, required: true }, // Variable name
    effect: { type: String, required: true }, // Variable name
    strength: { type: Number }, // Correlation/causal strength (-1 to 1)
    confidence: { type: Number }, // How confident we are in this relationship (0-100)
    evidence: [{ type: String }], // References to evidence for this relationship
    notes: { type: String },
  }],
  // Visual representation
  graph_layout: { type: Object },
  // Model metadata
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  version: { type: String, default: '1.0' },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
})

// NEW: Policy Schema (Control Interface)
const policySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['approval', 'constraint', 'authorization', 'automation'], required: true },
  scope: {
    applicable_to: { type: String, enum: ['mission', 'agent', 'data_source', 'user', 'global'], required: true },
    target_ids: [{ type: Schema.Types.ObjectId }], // IDs of entities this policy applies to
  },
  rules: [{
    condition: { type: String, required: true }, // Logical condition in a DSL or JSON format
    action: { type: String, required: true }, // What to do when condition is met
    priority: { type: Number, default: 0 }, // For rule ordering
  }],
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: Schema.Types.ObjectId, ref: 'User' },
  version: { type: String, default: '1.0' },
})

// Entity Schema (Flexible schema for different types of business entities)
const entitySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  properties: { type: Object, default: {} },
  tags: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} },
  // Add mission reference for organization
  mission_id: { type: Schema.Types.ObjectId, ref: 'Mission' },
  // Add data source reference
  data_source_id: { type: Schema.Types.ObjectId, ref: 'DataSource' },
  // Link to semantic concept
  concept_id: { type: Schema.Types.ObjectId, ref: 'Concept' },
})

// Relationship Schema (Connections between entities)
const relationshipSchema = new Schema({
  source_id: { type: Schema.Types.ObjectId, required: true, refPath: 'source_type' },
  source_type: { type: String, required: true },
  target_id: { type: Schema.Types.ObjectId, required: true, refPath: 'target_type' },
  target_type: { type: String, required: true },
  relationship_type: { type: String, required: true },
  properties: { type: Object, default: {} },
  weight: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
})

// Dashboard Schema (User dashboards) - ENHANCED
const dashboardSchema = new Schema({
  mission_id: { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  layout: { type: Array, default: [] },
  widgets: { type: Array, default: [] },
  is_public: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  // New fields for presets
  presets: [{
    name: { type: String, required: true },
    layout: { type: Array },
    active_data_sources: [{ type: Schema.Types.ObjectId, ref: 'DataSource' }],
    filters: { type: Object },
    created_at: { type: Date, default: Date.now },
  }],
  active_preset: { type: String }, // Name of the active preset
  // Track which data sources are visualized in this dashboard
  data_sources: [{ type: Schema.Types.ObjectId, ref: 'DataSource' }],
})

// Event Schema (System and user events)
const eventSchema = new Schema({
  type: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  data: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
})

// Insight Schema (AI-generated insights)
const insightSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  entities: [{ type: Schema.Types.ObjectId, refPath: 'entity_type' }],
  entity_type: { type: String },
  confidence: { type: Number, required: true },
  tags: [String],
  generated_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  // Explainability enhancement
  explanation: {
    reasoning: { type: String }, // How the system arrived at this insight
    data_sources: [{ type: Schema.Types.ObjectId, ref: 'DataSource' }], // What data was used
    causal_factors: [{ type: String }], // Key causal factors
    confidence_factors: [{ // Factors affecting confidence
      factor: { type: String },
      impact: { type: Number } // -1 to 1 impact on confidence
    }],
  },
  // Agent that generated this insight (if any)
  agent_id: { type: Schema.Types.ObjectId, ref: 'Agent' },
})

// Initialize models
const models = {}

// Only create models if mongoose is ready to avoid Next.js issues with model redefinition
if (mongoose.connection.readyState === 1) {
  models.User = mongoose.models.User || mongoose.model('User', userSchema)
  models.Entity = mongoose.models.Entity || mongoose.model('Entity', entitySchema)
  models.Relationship = mongoose.models.Relationship || mongoose.model('Relationship', relationshipSchema)
  models.Dashboard = mongoose.models.Dashboard || mongoose.model('Dashboard', dashboardSchema)
  models.Event = mongoose.models.Event || mongoose.model('Event', eventSchema)
  models.Insight = mongoose.models.Insight || mongoose.model('Insight', insightSchema)
  // Add new models
  models.Mission = mongoose.models.Mission || mongoose.model('Mission', missionSchema)
  models.Template = mongoose.models.Template || mongoose.model('Template', templateSchema)
  models.DataSource = mongoose.models.DataSource || mongoose.model('DataSource', dataSourceSchema)
  // Enterprise Brain new models
  models.Concept = mongoose.models.Concept || mongoose.model('Concept', conceptSchema)
  models.Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema)
  models.CausalModel = mongoose.models.CausalModel || mongoose.model('CausalModel', causalModelSchema)
  models.Policy = mongoose.models.Policy || mongoose.model('Policy', policySchema)
}

export default models 