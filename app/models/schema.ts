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

// NEW: Mission Schema (Projects/Workspaces)
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

// NEW: DataSource Schema
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
}

export default models 