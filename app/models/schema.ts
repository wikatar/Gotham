import mongoose, { Schema } from 'mongoose'

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'analyst', 'viewer'], default: 'viewer' },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date },
  settings: { type: Object, default: {} },
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

// Dashboard Schema (User dashboards)
const dashboardSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  layout: { type: Array, default: [] },
  widgets: { type: Array, default: [] },
  is_public: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
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
}

export default models 