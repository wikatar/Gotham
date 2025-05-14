'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import AgentList from '../components/agent/AgentList'
import AgentDetail from '../components/agent/AgentDetail'
import AgentCreator from '../components/agent/AgentCreator'
import AgentActivityLog from '../components/agent/AgentActivityLog'

export default function AgentCenterPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'logs' | 'connections'>('agents')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  
  // Reset selected agent when switching tabs
  const handleTabChange = (tab: 'agents' | 'logs' | 'connections') => {
    setActiveTab(tab)
    setSelectedAgentId(null)
    setIsCreatingAgent(false)
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Agent Center</h1>
        <p className="text-text-secondary">Manage autonomous agents for enterprise automation and actions</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-secondary/20 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'agents' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => handleTabChange('agents')}
        >
          Agents
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'logs' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => handleTabChange('logs')}
        >
          Activity Logs
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'connections' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => handleTabChange('connections')}
        >
          External Connections
        </button>
      </div>
      
      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div>
          {!selectedAgentId && !isCreatingAgent && (
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-medium">Agent Inventory</h2>
                <p className="text-sm text-text-secondary">
                  Autonomous agents that perform tasks and automate workflows
                </p>
              </div>
              <Button 
                variant="primary"
                onClick={() => setIsCreatingAgent(true)}
              >
                Create New Agent
              </Button>
            </div>
          )}
          
          {!selectedAgentId && !isCreatingAgent && (
            <AgentList onSelectAgent={setSelectedAgentId} />
          )}
          
          {selectedAgentId && !isCreatingAgent && (
            <AgentDetail 
              agentId={selectedAgentId} 
              onBack={() => setSelectedAgentId(null)}
            />
          )}
          
          {isCreatingAgent && (
            <AgentCreator 
              onCancel={() => setIsCreatingAgent(false)}
              onCreated={(agentId) => {
                setIsCreatingAgent(false)
                setSelectedAgentId(agentId)
              }}
            />
          )}
        </div>
      )}
      
      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-medium">Activity Logs</h2>
            <p className="text-sm text-text-secondary">
              Comprehensive logs of all agent activities and actions
            </p>
          </div>
          
          <AgentActivityLog />
        </div>
      )}
      
      {/* External Connections Tab */}
      {activeTab === 'connections' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-medium">External Connections</h2>
            <p className="text-sm text-text-secondary">
              Configure connections to external services and systems
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="text-3xl mb-2">🌐</div>
              <h3 className="font-medium mb-2">API Integrations</h3>
              <p className="text-sm text-text-secondary mb-4">
                Connect to external APIs to expand agent capabilities
              </p>
              <Button variant="secondary" size="sm">Configure</Button>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl mb-2">📲</div>
              <h3 className="font-medium mb-2">Notification Services</h3>
              <p className="text-sm text-text-secondary mb-4">
                Set up email, Slack, Teams, and other notification channels
              </p>
              <Button variant="secondary" size="sm">Configure</Button>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-medium mb-2">Workflow Platforms</h3>
              <p className="text-sm text-text-secondary mb-4">
                Connect to Zapier, n8n, Make, or custom workflow engines
              </p>
              <Button variant="secondary" size="sm">Configure</Button>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl mb-2">📆</div>
              <h3 className="font-medium mb-2">Calendar Services</h3>
              <p className="text-sm text-text-secondary mb-4">
                Integrate with Google Calendar, Office 365, and scheduling systems
              </p>
              <Button variant="secondary" size="sm">Configure</Button>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-medium mb-2">Chat Services</h3>
              <p className="text-sm text-text-secondary mb-4">
                Connect agents to messaging platforms and chat interfaces
              </p>
              <Button variant="secondary" size="sm">Configure</Button>
            </Card>
            
            <Card className="p-6">
              <div className="text-3xl mb-2">➕</div>
              <h3 className="font-medium mb-2">Add New Connection</h3>
              <p className="text-sm text-text-secondary mb-4">
                Set up a custom connection to an external service
              </p>
              <Button variant="primary" size="sm">Add Connection</Button>
            </Card>
          </div>
        </div>
      )}
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Active Agents</div>
          <div className="text-3xl font-bold">12</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Actions Today</div>
          <div className="text-3xl font-bold text-green-500">147</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Pending Approvals</div>
          <div className="text-3xl font-bold text-yellow-500">5</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Success Rate</div>
          <div className="text-3xl font-bold text-blue-500">94%</div>
        </Card>
      </div>
    </AppLayout>
  )
} 