'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AgentCreatorProps {
  onCancel: () => void;
  onCreated: (agentId: string) => void;
}

// Capability options
const capabilityOptions = [
  { id: 'data-collection', label: 'Data Collection', description: 'Collect data from various sources' },
  { id: 'data-transformation', label: 'Data Transformation', description: 'Transform and clean data' },
  { id: 'api-integration', label: 'API Integration', description: 'Connect to external APIs' },
  { id: 'error-handling', label: 'Error Handling', description: 'Advanced error detection and recovery' },
  { id: 'scheduling', label: 'Scheduled Execution', description: 'Run on predefined schedules' },
  { id: 'notifications', label: 'Notifications', description: 'Send alerts and notifications' },
  { id: 'monitoring', label: 'Monitoring', description: 'Monitor systems and data flows' },
  { id: 'anomaly-detection', label: 'Anomaly Detection', description: 'Detect unusual patterns or outliers' },
  { id: 'reporting', label: 'Reporting', description: 'Generate and distribute reports' },
  { id: 'nlp', label: 'Natural Language Processing', description: 'Process and understand text' },
  { id: 'kb-integration', label: 'Knowledge Base Integration', description: 'Connect to knowledge bases' },
  { id: 'ml-prediction', label: 'ML Predictions', description: 'Make predictions using ML models' },
  { id: 'auto-scaling', label: 'Auto-scaling', description: 'Scale resources based on demand' },
  { id: 'data-viz', label: 'Data Visualization', description: 'Create visual representations of data' }
];

// Permission options
const permissionOptions = [
  { id: 'read-data', label: 'Read Data Sources' },
  { id: 'write-data', label: 'Write to Data Warehouse' },
  { id: 'send-notifications', label: 'Send Notifications' },
  { id: 'access-apis', label: 'Access External APIs' },
  { id: 'execute-workflows', label: 'Execute Workflows' },
  { id: 'modify-settings', label: 'Modify System Settings' },
  { id: 'access-sensitive', label: 'Access Sensitive Data' },
  { id: 'create-agents', label: 'Create Other Agents' }
];

// Integration options
const integrationOptions = [
  { id: 'sql-db', name: 'SQL Database', icon: '💾', connected: false },
  { id: 'rest-api', name: 'REST APIs', icon: '🔄', connected: false },
  { id: 's3', name: 'S3 Storage', icon: '📁', connected: false },
  { id: 'email', name: 'Email Service', icon: '📧', connected: false },
  { id: 'slack', name: 'Slack', icon: '💬', connected: false },
  { id: 'teams', name: 'Microsoft Teams', icon: '👥', connected: false },
  { id: 'zapier', name: 'Zapier', icon: '⚡', connected: false },
  { id: 'crm', name: 'CRM System', icon: '👤', connected: false },
  { id: 'calendar', name: 'Calendar', icon: '📅', connected: false }
];

export default function AgentCreator({ onCancel, onCreated }: AgentCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: '',
    type: 'Data Processing',
    description: '',
    icon: '🤖',
    runtime: 'Node.js',
    memory: '256MB',
    cpu: '0.5 cores',
    capabilities: [] as string[],
    permissions: [] as string[],
    integrations: [] as string[]
  });
  
  const [isCreating, setIsCreating] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAgentData(prev => ({ ...prev, [name]: value }));
  };

  // Handle capability selection
  const handleCapabilityToggle = (capabilityId: string) => {
    setAgentData(prev => {
      if (prev.capabilities.includes(capabilityId)) {
        return { ...prev, capabilities: prev.capabilities.filter(c => c !== capabilityId) };
      } else {
        return { ...prev, capabilities: [...prev.capabilities, capabilityId] };
      }
    });
  };
  
  // Handle permission selection
  const handlePermissionToggle = (permissionId: string) => {
    setAgentData(prev => {
      if (prev.permissions.includes(permissionId)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permissionId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permissionId] };
      }
    });
  };
  
  // Handle integration selection
  const handleIntegrationToggle = (integrationId: string) => {
    setAgentData(prev => {
      if (prev.integrations.includes(integrationId)) {
        return { ...prev, integrations: prev.integrations.filter(i => i !== integrationId) };
      } else {
        return { ...prev, integrations: [...prev.integrations, integrationId] };
      }
    });
  };

  // Navigate between steps
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Create new agent
  const handleCreateAgent = () => {
    setIsCreating(true);
    
    // In a real app, this would make an API call to create the agent
    // For now, we'll just simulate it with a timeout
    setTimeout(() => {
      // Generate a random ID for the new agent
      const newAgentId = `agent-${Math.floor(Math.random() * 1000)}`;
      onCreated(newAgentId);
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="secondary"
          onClick={onCancel}
          className="mr-4"
        >
          ← Back
        </Button>
        <h2 className="text-xl font-medium">Create New Agent</h2>
      </div>
      
      {/* Progress indicator */}
      <div className="flex mb-8">
        <div className="flex-1">
          <div className={`h-1 ${currentStep >= 1 ? 'bg-primary' : 'bg-secondary/20'}`}></div>
          <div className="text-center mt-2 text-sm">Basic Info</div>
        </div>
        <div className="flex-1">
          <div className={`h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-secondary/20'}`}></div>
          <div className="text-center mt-2 text-sm">Capabilities</div>
        </div>
        <div className="flex-1">
          <div className={`h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-secondary/20'}`}></div>
          <div className="text-center mt-2 text-sm">Connections</div>
        </div>
      </div>
      
      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agent Name *</label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter agent name"
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={agentData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Agent Type</label>
              <select 
                name="type"
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={agentData.type}
                onChange={handleChange}
              >
                <option value="Data Processing">Data Processing</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Reporting">Reporting</option>
                <option value="Communication">Communication</option>
                <option value="Finance">Finance</option>
                <option value="Content">Content</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea 
                name="description"
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                rows={3}
                placeholder="Describe what this agent does"
                value={agentData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Icon</label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-secondary/30 rounded-md">
                {['🤖', '📊', '🔍', '💬', '📝', '💰', '📚', '🔄', '📈', '🧠', '📡', '🔐', '📆'].map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`w-8 h-8 text-xl flex items-center justify-center rounded ${
                      agentData.icon === icon ? 'bg-primary/20 border border-primary' : 'hover:bg-secondary/10'
                    }`}
                    onClick={() => setAgentData(prev => ({ ...prev, icon }))}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Runtime Environment</label>
              <select 
                name="runtime"
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={agentData.runtime}
                onChange={handleChange}
              >
                <option value="Node.js">Node.js</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="Go">Go</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Memory Allocation</label>
                <select 
                  name="memory"
                  className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                  value={agentData.memory}
                  onChange={handleChange}
                >
                  <option value="128MB">128MB</option>
                  <option value="256MB">256MB</option>
                  <option value="512MB">512MB</option>
                  <option value="1GB">1GB</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">CPU Allocation</label>
                <select 
                  name="cpu"
                  className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                  value={agentData.cpu}
                  onChange={handleChange}
                >
                  <option value="0.25 cores">0.25 cores</option>
                  <option value="0.5 cores">0.5 cores</option>
                  <option value="1 core">1 core</option>
                  <option value="2 cores">2 cores</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              variant="secondary" 
              onClick={onCancel} 
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={goToNextStep}
              disabled={!agentData.name || !agentData.description}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
      
      {/* Step 2: Capabilities */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Agent Capabilities</h3>
          
          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-4">
              Select the capabilities this agent should have. These determine what tasks the agent can perform.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilityOptions.map(capability => (
                <div 
                  key={capability.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    agentData.capabilities.includes(capability.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-secondary/30 hover:bg-secondary/5'
                  }`}
                  onClick={() => handleCapabilityToggle(capability.id)}
                >
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-3"
                      checked={agentData.capabilities.includes(capability.id)}
                      onChange={() => {}} // Handled by parent div click
                    />
                    <div>
                      <div className="font-medium">{capability.label}</div>
                      <div className="text-sm text-text-secondary">{capability.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <h3 className="font-medium mb-4">Agent Permissions</h3>
          
          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-4">
              Select the permissions this agent should have. Be careful with sensitive permissions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissionOptions.map(permission => (
                <div 
                  key={permission.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    agentData.permissions.includes(permission.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-secondary/30 hover:bg-secondary/5'
                  }`}
                  onClick={() => handlePermissionToggle(permission.id)}
                >
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-3"
                      checked={agentData.permissions.includes(permission.id)}
                      onChange={() => {}} // Handled by parent div click
                    />
                    <div className="font-medium">{permission.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="secondary"
              onClick={goToPreviousStep}
            >
              Back
            </Button>
            <Button 
              variant="primary"
              onClick={goToNextStep}
              disabled={agentData.capabilities.length === 0}
            >
              Next
            </Button>
          </div>
        </Card>
      )}
      
      {/* Step 3: Connections */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Agent Connections</h3>
          
          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-4">
              Connect your agent to external services and data sources
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrationOptions.map(integration => (
                <div 
                  key={integration.id}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    agentData.integrations.includes(integration.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-secondary/30 hover:bg-secondary/5'
                  }`}
                  onClick={() => handleIntegrationToggle(integration.id)}
                >
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{integration.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{integration.name}</div>
                      <div className="text-xs text-text-secondary">
                        {agentData.integrations.includes(integration.id) ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                    <div>
                      <input 
                        type="checkbox" 
                        className="h-5 w-5"
                        checked={agentData.integrations.includes(integration.id)}
                        onChange={() => {}} // Handled by parent div click
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="secondary"
              onClick={goToPreviousStep}
            >
              Back
            </Button>
            <Button 
              variant="primary"
              onClick={handleCreateAgent}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 