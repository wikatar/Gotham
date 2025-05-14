'use client';

import { useState, useEffect } from 'react';
import { SAMPLE_AGENTS, SAMPLE_AGENT_ACTIONS } from '../agent/sampleData';
import { Agent, AgentAction } from '../agent/types';
import AgentCard from '../agent/AgentCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Link from 'next/link';

interface AssignedAgentsTabProps {
  missionId: string;
}

export default function AssignedAgentsTab({ missionId }: AssignedAgentsTabProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentActions, setAgentActions] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Load agents and their actions for this mission
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Filter agents assigned to this mission
      const missionAgents = SAMPLE_AGENTS.filter(agent => 
        agent.assignedMissions.includes(missionId)
      );
      
      // Get all actions from these agents related to this mission
      const filteredActions = SAMPLE_AGENT_ACTIONS.filter(action => 
        action.missionId === missionId
      );
      
      setAgents(missionAgents);
      setAgentActions(filteredActions);
      setIsLoading(false);
    }, 500);
  }, [missionId]);

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Handle toggling agent status
  const handleToggleAgentStatus = (agentId: string, newStatus: 'active' | 'paused') => {
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId ? { ...agent, status: newStatus } : agent
      )
    );
  };

  // Handle configuring an agent
  const handleConfigureAgent = (agentId: string) => {
    // In a real app, this would open a configuration modal or navigate to a config page
    console.log('Configure agent:', agentId);
  };

  // Get agent name by ID
  const getAgentName = (agentId: string) => {
    const agent = SAMPLE_AGENTS.find(a => a.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium">Assigned Agents</h2>
          <p className="text-text-secondary">AI agents working on this mission</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowAssignModal(true)}
        >
          Assign New Agent
        </Button>
      </div>

      {/* Agents List */}
      {agents.length > 0 ? (
        <div className="mb-8">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onToggleStatus={handleToggleAgentStatus}
              onConfigureAgent={handleConfigureAgent}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center mb-8">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-xl font-medium mb-2">No Agents Assigned</h3>
          <p className="text-text-secondary mb-4">
            Assign AI agents to help analyze data, generate insights, and automate tasks for this mission.
          </p>
          <Button 
            variant="primary"
            onClick={() => setShowAssignModal(true)}
          >
            Assign Your First Agent
          </Button>
        </Card>
      )}

      {/* Agent Activity */}
      {agentActions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Recent Agent Activity</h3>
          <Card>
            <div className="divide-y divide-secondary/10">
              {agentActions.map(action => (
                <div key={action.id} className="p-4">
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">{action.action}</div>
                    <div className="text-sm text-text-secondary">
                      {formatDate(action.startTime || action.endTime)}
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary mb-2">
                    By: {getAgentName(action.agentId)}
                  </div>
                  
                  {/* Status badge */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        action.status === 'completed' ? 'bg-green-100 text-green-800' :
                        action.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        action.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {action.status.charAt(0).toUpperCase() + action.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    
                    {action.status === 'completed' && action.result && (
                      <Button variant="secondary" size="sm">
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Assign Agent Modal - In a real app would be a proper modal component */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Assign Agent to Mission</h3>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-text-secondary mb-4">
                Select an agent to assign to this mission. The agent will start analyzing data and generating insights.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Agent</label>
                <select className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md">
                  <option value="">Choose an agent...</option>
                  {SAMPLE_AGENTS.filter(a => !a.assignedMissions.includes(missionId)).map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.capabilities.join(', ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary">
                  Assign Agent
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 