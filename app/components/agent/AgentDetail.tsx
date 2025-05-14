'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'idle' | 'paused' | 'error';
  lastActive: string;
  capabilities: string[];
  icon: string;
  created: string;
  version: string;
  owner: string;
  runtime: string;
  memory: string;
  cpu: string;
  permissions: string[];
  integrations: string[];
  actionHistory: {
    action: string;
    timestamp: string;
    status: 'success' | 'failure' | 'pending';
    details: string;
  }[];
}

// Sample agent data lookup function
const getAgentById = (id: string): Agent => {
  return {
    id,
    name: 'Data Collector',
    type: 'Data Processing',
    description: 'Automatically collects and processes data from various sources',
    status: 'active',
    lastActive: '2 minutes ago',
    capabilities: ['Data Collection', 'Data Transformation', 'API Integration', 'Scheduled Execution', 'Error Handling'],
    icon: '📊',
    created: '2023-09-15',
    version: '1.2.3',
    owner: 'Data Team',
    runtime: 'Node.js',
    memory: '256MB',
    cpu: '0.5 cores',
    permissions: [
      'Read data sources',
      'Write to data warehouse',
      'Send notifications',
      'Access external APIs'
    ],
    integrations: [
      'SQL Database',
      'REST APIs',
      'S3 Storage',
      'Email Service',
      'Slack'
    ],
    actionHistory: [
      {
        action: 'Data Collection Run',
        timestamp: '2023-11-05 14:30:22',
        status: 'success',
        details: 'Collected 1,542 records from CRM system'
      },
      {
        action: 'Data Transformation',
        timestamp: '2023-11-05 14:32:15',
        status: 'success',
        details: 'Transformed and enriched customer data'
      },
      {
        action: 'Warehouse Update',
        timestamp: '2023-11-05 14:35:07',
        status: 'success',
        details: 'Updated customer dimension tables with new data'
      },
      {
        action: 'API Integration',
        timestamp: '2023-11-05 13:15:42',
        status: 'failure',
        details: 'Failed to connect to external weather API - timeout'
      },
      {
        action: 'Notification Dispatch',
        timestamp: '2023-11-05 13:16:30',
        status: 'success',
        details: 'Sent error notification to monitoring channel'
      },
      {
        action: 'API Integration Retry',
        timestamp: '2023-11-05 13:30:12',
        status: 'success',
        details: 'Successfully connected to external weather API after retry'
      }
    ]
  };
};

interface AgentDetailProps {
  agentId: string;
  onBack: () => void;
}

export default function AgentDetail({ agentId, onBack }: AgentDetailProps) {
  const agent = getAgentById(agentId);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getHistoryStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Button 
          variant="secondary"
          onClick={onBack}
          className="mr-4"
        >
          ← Back to List
        </Button>
        <h2 className="text-xl font-medium flex-1">{agent.name}</h2>
        <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(agent.status)}`}>
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-secondary/20 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'overview' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'history' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Action History
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'settings' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start mb-4">
                <div className="text-4xl mr-4">{agent.icon}</div>
                <div>
                  <h3 className="text-xl font-medium">{agent.name}</h3>
                  <div className="text-sm text-text-secondary">{agent.type}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p>{agent.description}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map(capability => (
                    <span 
                      key={capability} 
                      className="px-3 py-1 text-sm bg-secondary/10 rounded-full"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Permissions</h4>
                  <ul className="list-disc list-inside text-sm">
                    {agent.permissions.map((permission, index) => (
                      <li key={index}>{permission}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Integrations</h4>
                  <ul className="list-disc list-inside text-sm">
                    {agent.integrations.map((integration, index) => (
                      <li key={index}>{integration}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-medium mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {agent.actionHistory.slice(0, 3).map((action, index) => (
                  <div key={index} className="border-b border-secondary/10 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">{action.action}</div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getHistoryStatusColor(action.status)}`}>
                        {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-text-secondary mb-1">{action.timestamp}</div>
                    <div className="text-sm">{action.details}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setActiveTab('history')}
                >
                  View Full History
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-4">Agent Control</h3>
              <div className="space-y-3">
                {agent.status === 'paused' || agent.status === 'error' ? (
                  <Button variant="primary" className="w-full">Resume Agent</Button>
                ) : agent.status === 'active' ? (
                  <Button variant="secondary" className="w-full">Pause Agent</Button>
                ) : (
                  <Button variant="primary" className="w-full">Activate Agent</Button>
                )}
                
                <Button variant="secondary" className="w-full">Trigger Manual Run</Button>
                <Button variant="danger" className="w-full">Reset Agent</Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-medium mb-4">Agent Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Created</span>
                  <span>{agent.created}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Version</span>
                  <span>{agent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Owner</span>
                  <span>{agent.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Runtime</span>
                  <span>{agent.runtime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Memory</span>
                  <span>{agent.memory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">CPU</span>
                  <span>{agent.cpu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Last Active</span>
                  <span>{agent.lastActive}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {/* History Tab */}
      {activeTab === 'history' && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Action History</h3>
          <div className="space-y-4">
            {agent.actionHistory.map((action, index) => (
              <div key={index} className="border-b border-secondary/10 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{action.action}</div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getHistoryStatusColor(action.status)}`}>
                    {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-text-secondary mb-1">{action.timestamp}</div>
                <div className="text-sm">{action.details}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-medium mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Agent Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                  defaultValue={agent.name}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                  rows={3}
                  defaultValue={agent.description}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Agent Type</label>
                <select className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md">
                  <option>Data Processing</option>
                  <option>Monitoring</option>
                  <option>Reporting</option>
                  <option>Communication</option>
                  <option>Finance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Owner</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                  defaultValue={agent.owner}
                />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-medium mb-4">Runtime Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Memory Allocation</label>
                <select className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md">
                  <option>128MB</option>
                  <option>256MB</option>
                  <option>512MB</option>
                  <option>1GB</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">CPU Allocation</label>
                <select className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md">
                  <option>0.25 cores</option>
                  <option>0.5 cores</option>
                  <option>1 core</option>
                  <option>2 cores</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Runtime Environment</label>
                <select className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md">
                  <option>Node.js</option>
                  <option>Python</option>
                  <option>Java</option>
                  <option>Go</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="autoRestart" 
                  className="mr-2"
                  defaultChecked
                />
                <label htmlFor="autoRestart" className="text-sm">Auto-restart on failure</label>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Permissions</h3>
              <Button variant="secondary" size="sm">Add Permission</Button>
            </div>
            
            <div className="space-y-2">
              {agent.permissions.map((permission, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-background-elevated rounded-md">
                  <span>{permission}</span>
                  <Button variant="danger" size="xs">Remove</Button>
                </div>
              ))}
            </div>
          </Card>
          
          <div className="md:col-span-2 flex justify-end space-x-3">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>
      )}
    </div>
  );
} 