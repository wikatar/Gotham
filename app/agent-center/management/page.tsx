'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AgentCard from '../../components/agent/AgentCard';
import { SAMPLE_AGENTS } from '../../components/agent/sampleData';
import { Agent } from '../../components/agent/types';
import Link from 'next/link';

export default function AgentManagementPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [selectedCapability, setSelectedCapability] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load agents
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAgents(SAMPLE_AGENTS);
      setFilteredAgents(SAMPLE_AGENTS);
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters when filters or agents change
  useEffect(() => {
    if (agents.length === 0) return;

    let filtered = [...agents];
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === selectedStatus);
    }
    
    // Filter by capability
    if (selectedCapability !== 'all') {
      filtered = filtered.filter(agent => 
        agent.capabilities.includes(selectedCapability as any)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(query) || 
        agent.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredAgents(filtered);
  }, [agents, selectedStatus, selectedCapability, searchQuery]);

  // Handle toggling agent status
  const handleToggleAgentStatus = (agentId: string, newStatus: 'active' | 'paused') => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      )
    );
  };

  // Get all unique agent capabilities
  const allCapabilities = Array.from(
    new Set(
      agents.flatMap(agent => agent.capabilities)
    )
  );

  // Handle configuring an agent
  const handleConfigureAgent = (agentId: string) => {
    // In a real app, this would navigate to an agent configuration page
    console.log(`Configure agent: ${agentId}`);
  };

  // Handle assigning an agent to a mission
  const handleAssignMission = (agentId: string) => {
    // In a real app, this would open a mission selection modal
    console.log(`Assign agent ${agentId} to mission`);
  };

  // Handle viewing agent details
  const handleViewDetails = (agentId: string) => {
    // In a real app, this would navigate to an agent details page
    console.log(`View details for agent: ${agentId}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">AI Agent Management</h1>
            <p className="text-text-secondary">
              Configure and deploy intelligent agents to automate tasks and generate insights
            </p>
          </div>
          <Button 
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Total Agents</div>
          <div className="text-3xl font-bold">{agents.length}</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Active Agents</div>
          <div className="text-3xl font-bold text-green-500">
            {agents.filter(a => a.status === 'active').length}
          </div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Idle Agents</div>
          <div className="text-3xl font-bold text-yellow-500">
            {agents.filter(a => a.status === 'idle').length}
          </div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Issues</div>
          <div className="text-3xl font-bold text-red-500">
            {agents.filter(a => a.status === 'error').length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-medium">Filter Agents</h3>
            
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full px-4 py-2 bg-background-paper border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="paused">Paused</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Capability</label>
              <select
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={selectedCapability}
                onChange={(e) => setSelectedCapability(e.target.value)}
              >
                <option value="all">All Capabilities</option>
                {allCapabilities.map(capability => (
                  <option key={capability} value={capability}>
                    {capability}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Agents List */}
      <div className="mb-6">
        <h2 className="text-xl font-medium mb-4">
          {filteredAgents.length} {filteredAgents.length === 1 ? 'Agent' : 'Agents'}
        </h2>
        
        {filteredAgents.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-medium mb-2">No Agents Found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your filters or create a new agent.
            </p>
            <Button 
              variant="primary"
              onClick={() => {
                setSelectedStatus('all');
                setSelectedCapability('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleStatus={handleToggleAgentStatus}
              onConfigureAgent={handleConfigureAgent}
              onAssignMission={handleAssignMission}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Create Agent Modal - In a real app would be a proper modal component */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Create New Agent</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Enter agent name..."
                    className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    placeholder="Describe what this agent does..."
                    className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                    rows={3}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Capabilities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['data-analysis', 'anomaly-detection', 'forecasting', 
                      'recommendation', 'optimization', 'alert-management',
                      'reporting', 'automation'].map(capability => (
                      <label key={capability} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        {capability}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Permission Level</label>
                  <select className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md">
                    <option value="read-only">Read Only</option>
                    <option value="suggest">Suggest</option>
                    <option value="execute">Execute</option>
                    <option value="autonomous">Autonomous</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary">
                  Create Agent
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
} 