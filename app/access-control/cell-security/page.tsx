'use client'

import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Sample security rules
const sampleRules = [
  {
    id: 'rule1',
    name: 'PII Restriction',
    description: 'Restrict access to personally identifiable information',
    dataset: 'Customer Database',
    tables: ['customers'],
    columns: ['ssn', 'phone_number', 'email', 'address'],
    condition: 'User role is not in ["Administrator", "Data Steward"]',
    action: 'mask',
    maskingType: 'partial',
    active: true
  },
  {
    id: 'rule2',
    name: 'Salary Data',
    description: 'Restrict access to salary information',
    dataset: 'HR Database',
    tables: ['employees'],
    columns: ['salary', 'bonus', 'compensation'],
    condition: 'User.department == "HR" OR User.isManager == true OR User.role == "Executive"',
    action: 'allow',
    active: true
  },
  {
    id: 'rule3',
    name: 'Geographic Restriction',
    description: 'Only show data for user\'s assigned region',
    dataset: 'Sales Database',
    tables: ['sales', 'customers', 'leads'],
    columns: ['*'],
    condition: 'Record.region == User.assigned_region',
    action: 'filter',
    active: true
  },
  {
    id: 'rule4',
    name: 'Financial Data',
    description: 'Restrict access to sensitive financial data',
    dataset: 'Finance Database',
    tables: ['revenue', 'expenses'],
    columns: ['amount', 'forecast'],
    condition: 'User.department == "Finance" OR User.role == "Executive"',
    action: 'allow',
    active: false
  },
  {
    id: 'rule5',
    name: 'Medical Information',
    description: 'Restrict access to medical records',
    dataset: 'Healthcare Database',
    tables: ['patient_records'],
    columns: ['diagnosis', 'treatment', 'medication'],
    condition: 'User.role == "Doctor" AND (User.patient_ids CONTAINS Record.patient_id)',
    action: 'allow',
    active: true
  }
];

function SecurityRuleCard({ rule, onEdit, onToggle }) {
  return (
    <div className="border border-secondary/20 rounded-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="font-medium">{rule.name}</h3>
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              rule.active 
                ? 'bg-green-500/20 text-green-600' 
                : 'bg-gray-400/20 text-gray-600'
            }`}>
              {rule.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">{rule.description}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(rule.id)}
            className="px-2 py-1 text-xs bg-secondary/10 hover:bg-secondary/20 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => onToggle(rule.id)}
            className="px-2 py-1 text-xs bg-secondary/10 hover:bg-secondary/20 rounded"
          >
            {rule.active ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <div className="text-text-secondary">Dataset:</div>
          <div>{rule.dataset}</div>
        </div>
        <div>
          <div className="text-text-secondary">Action:</div>
          <div className="capitalize">{rule.action} {rule.maskingType ? `(${rule.maskingType})` : ''}</div>
        </div>
        <div>
          <div className="text-text-secondary">Tables:</div>
          <div>{rule.tables.join(', ')}</div>
        </div>
        <div>
          <div className="text-text-secondary">Columns:</div>
          <div>{rule.columns.join(', ')}</div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-secondary/10">
        <div className="text-text-secondary text-sm">Condition:</div>
        <div className="bg-secondary/5 p-2 rounded mt-1 text-sm font-mono">
          {rule.condition}
        </div>
      </div>
    </div>
  );
}

function SecurityRuleForm({ rule = null, onSave, onCancel }) {
  const [editedRule, setEditedRule] = useState(
    rule || {
      id: `rule-${Date.now()}`,
      name: '',
      description: '',
      dataset: '',
      tables: [],
      columns: [],
      condition: '',
      action: 'mask',
      maskingType: 'full',
      active: true
    }
  );
  
  // Sample datasets for dropdown
  const datasets = [
    'Customer Database',
    'HR Database',
    'Sales Database',
    'Finance Database',
    'Healthcare Database'
  ];
  
  // Sample actions
  const actions = [
    { value: 'mask', label: 'Mask Data' },
    { value: 'filter', label: 'Filter Records' },
    { value: 'allow', label: 'Allow Access' },
    { value: 'deny', label: 'Deny Access' }
  ];
  
  // Sample masking types
  const maskingTypes = [
    { value: 'full', label: 'Full (*****)' },
    { value: 'partial', label: 'Partial (J*** S****)' },
    { value: 'hash', label: 'Hash (a7f2...)' },
    { value: 'redact', label: 'Redact [REDACTED]' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedRule);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-1">Rule Name</label>
          <input
            type="text"
            required
            value={editedRule.name}
            onChange={(e) => setEditedRule({...editedRule, name: e.target.value})}
            className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            placeholder="Security rule name"
          />
        </div>
        
        <div className="w-32">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={editedRule.active ? 'active' : 'inactive'}
            onChange={(e) => setEditedRule({...editedRule, active: e.target.value === 'active'})}
            className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={editedRule.description}
          onChange={(e) => setEditedRule({...editedRule, description: e.target.value})}
          className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
          rows={2}
          placeholder="Describe the purpose of this rule"
        />
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-1">Dataset</label>
          <select
            required
            value={editedRule.dataset}
            onChange={(e) => setEditedRule({...editedRule, dataset: e.target.value})}
            className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
          >
            <option value="">Select Dataset</option>
            {datasets.map(ds => (
              <option key={ds} value={ds}>{ds}</option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium mb-1">Tables (comma separated)</label>
          <input
            type="text"
            value={Array.isArray(editedRule.tables) ? editedRule.tables.join(', ') : editedRule.tables}
            onChange={(e) => setEditedRule({
              ...editedRule, 
              tables: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            })}
            className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            placeholder="table1, table2, table3"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Columns (comma separated, or * for all)</label>
        <input
          type="text"
          value={Array.isArray(editedRule.columns) ? editedRule.columns.join(', ') : editedRule.columns}
          onChange={(e) => setEditedRule({
            ...editedRule, 
            columns: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
          })}
          className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
          placeholder="column1, column2, column3 (or * for all columns)"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Condition</label>
        <textarea
          required
          value={editedRule.condition}
          onChange={(e) => setEditedRule({...editedRule, condition: e.target.value})}
          className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none font-mono"
          rows={3}
          placeholder="User.role == 'Admin' OR Record.department == User.department"
        />
        <div className="text-xs text-text-secondary mt-1">
          Use variables: User.role, User.department, Record.field_name, etc.
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Action</label>
          <select
            value={editedRule.action}
            onChange={(e) => setEditedRule({...editedRule, action: e.target.value})}
            className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
          >
            {actions.map(action => (
              <option key={action.value} value={action.value}>{action.label}</option>
            ))}
          </select>
        </div>
        
        {editedRule.action === 'mask' && (
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Masking Type</label>
            <select
              value={editedRule.maskingType}
              onChange={(e) => setEditedRule({...editedRule, maskingType: e.target.value})}
              className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            >
              {maskingTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t border-secondary/10">
        <Button
          variant="secondary"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
        >
          {rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
}

export default function CellLevelSecurityPage() {
  const [activeTab, setActiveTab] = useState('rules')
  const [rules, setRules] = useState(sampleRules)
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [editingRuleId, setEditingRuleId] = useState(null)
  
  const handleEditRule = (ruleId) => {
    setEditingRuleId(ruleId)
    setIsAddingRule(false)
  }
  
  const handleToggleRule = (ruleId) => {
    setRules(
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      )
    )
  }
  
  const handleSaveRule = (savedRule) => {
    if (editingRuleId) {
      // Update existing rule
      setRules(rules.map(rule => 
        rule.id === editingRuleId ? savedRule : rule
      ))
      setEditingRuleId(null)
    } else {
      // Add new rule
      setRules([...rules, savedRule])
      setIsAddingRule(false)
    }
  }
  
  const handleCancelEdit = () => {
    setEditingRuleId(null)
    setIsAddingRule(false)
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Cell-Level Security</h1>
        <p className="text-text-secondary">
          Define granular access control rules at the cell/field level based on user roles and attributes
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary/20 mb-6">
        <nav className="flex space-x-8">
          {['rules', 'preview', 'audit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary/30'
              }`}
            >
              {tab === 'rules' ? 'Security Rules' : 
               tab === 'preview' ? 'Access Preview' : 
               'Audit Log'}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <>
          {!isAddingRule && !editingRuleId && (
            <div className="mb-6 flex justify-between items-center">
              <div className="text-lg font-medium">Security Rules</div>
              <Button onClick={() => setIsAddingRule(true)}>
                Add Security Rule
              </Button>
            </div>
          )}
          
          {isAddingRule && (
            <Card title="Create Security Rule" className="mb-6">
              <div className="p-4">
                <SecurityRuleForm 
                  onSave={handleSaveRule} 
                  onCancel={handleCancelEdit} 
                />
              </div>
            </Card>
          )}
          
          {editingRuleId && (
            <Card title="Edit Security Rule" className="mb-6">
              <div className="p-4">
                <SecurityRuleForm 
                  rule={rules.find(r => r.id === editingRuleId)}
                  onSave={handleSaveRule} 
                  onCancel={handleCancelEdit} 
                />
              </div>
            </Card>
          )}
          
          {!isAddingRule && !editingRuleId && rules.map(rule => (
            <SecurityRuleCard 
              key={rule.id} 
              rule={rule} 
              onEdit={handleEditRule}
              onToggle={handleToggleRule}
            />
          ))}
        </>
      )}
      
      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl mb-4">👀</div>
            <h2 className="text-xl font-medium mb-2">Access Preview</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              This feature allows you to preview how data will appear to different users based on the security rules.
              Select a user and dataset to see the effects of your security rules.
            </p>
            <div className="flex justify-center">
              <Button>View Implementation Plan</Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <Card>
          <div className="p-6 text-center">
            <div className="text-3xl mb-4">📋</div>
            <h2 className="text-xl font-medium mb-2">Audit Log</h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Track all security rule applications, including when data was masked, filtered, or access was denied.
              This provides a complete audit trail for compliance requirements.
            </p>
            <div className="flex justify-center">
              <Button>View Implementation Plan</Button>
            </div>
          </div>
        </Card>
      )}
    </AppLayout>
  )
} 