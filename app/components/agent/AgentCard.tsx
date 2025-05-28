'use client';

import React from 'react';
import { Agent } from './types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { LineageModal } from '../lineage/LineageModal';
import { GitBranch } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onConfigureAgent?: (agentId: string) => void;
  onAssignMission?: (agentId: string) => void;
  onViewDetails?: (agentId: string) => void;
  onToggleStatus?: (agentId: string, newStatus: 'active' | 'paused') => void;
}

export default function AgentCard({
  agent,
  onConfigureAgent,
  onAssignMission,
  onViewDetails,
  onToggleStatus
}: AgentCardProps) {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'idle':
        return 'text-yellow-500';
      case 'paused':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            {agent.avatar ? (
              <div className="w-10 h-10 rounded-full bg-secondary/20 mr-3 overflow-hidden">
                <img 
                  src={agent.avatar} 
                  alt={agent.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary/20 mr-3 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
            )}
            <div>
              <h3 className="font-medium">{agent.name}</h3>
              <div className="flex items-center text-sm">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getStatusColor(agent.status)}`}></span>
                <span>{agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}</span>
              </div>
            </div>
          </div>
          
          {onToggleStatus && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleStatus(
                agent.id, 
                agent.status === 'active' ? 'paused' : 'active'
              )}
            >
              {agent.status === 'active' ? 'Pause' : 'Activate'}
            </Button>
          )}
        </div>
        
        <p className="text-text-secondary text-sm mb-4">{agent.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-sm">
          <div>
            <span className="text-text-secondary">Capabilities:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {agent.capabilities.map(capability => (
                <span 
                  key={capability}
                  className="inline-block px-2 py-0.5 bg-secondary/10 rounded-full text-xs"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <span className="text-text-secondary">Permission Level:</span>
            <div className="mt-1">
              <span className="inline-block px-2 py-0.5 bg-secondary/10 rounded-full text-xs">
                {agent.permissionLevel}
              </span>
            </div>
          </div>
          
          <div>
            <span className="text-text-secondary">Missions Assigned:</span>
            <div className="mt-1 text-sm">
              {agent.assignedMissions.length} missions
            </div>
          </div>
        </div>
        
        {agent.performance && (
          <div className="bg-background-elevated p-3 rounded-md mb-4">
            <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs text-text-secondary">Accuracy</div>
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-background-paper rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full bg-success"
                      style={{ width: `${agent.performance.accuracy}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{agent.performance.accuracy}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-text-secondary">Efficiency</div>
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-background-paper rounded-full overflow-hidden mr-2">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${agent.performance.efficiency}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{agent.performance.efficiency}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-text-secondary">Response Time</div>
                <div className="text-sm">{agent.performance.responseTime}ms</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between text-sm text-text-secondary">
          <div>Last activity: {formatDate(agent.lastActive)}</div>
          <div>Created: {formatDate(agent.createdAt)}</div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4 border-t border-secondary/20 pt-3">
          <LineageModal
            trigger={
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
              >
                <GitBranch className="h-3 w-3" />
                Visa kedja
              </Button>
            }
            agentId={agent.id}
            title={`Data Lineage - ${agent.name}`}
            description={`Visa transformationssteg för agent ${agent.name}`}
          />
          
          {onViewDetails && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onViewDetails(agent.id)}
            >
              View Details
            </Button>
          )}
          
          {onAssignMission && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => onAssignMission(agent.id)}
            >
              Assign Mission
            </Button>
          )}
          
          {onConfigureAgent && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => onConfigureAgent(agent.id)}
            >
              Configure
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
} 