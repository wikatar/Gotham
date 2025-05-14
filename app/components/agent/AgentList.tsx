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
}

// Sample agent data
const sampleAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Data Collector',
    type: 'Data Processing',
    description: 'Automatically collects and processes data from various sources',
    status: 'active',
    lastActive: '2 minutes ago',
    capabilities: ['Data Collection', 'Data Transformation', 'API Integration'],
    icon: '📊'
  },
  {
    id: 'agent-2',
    name: 'Anomaly Detector',
    type: 'Monitoring',
    description: 'Monitors data flows and detects anomalies in real-time',
    status: 'active',
    lastActive: 'Just now',
    capabilities: ['Anomaly Detection', 'Alert Generation', 'Pattern Recognition'],
    icon: '🔍'
  },
  {
    id: 'agent-3',
    name: 'Report Generator',
    type: 'Reporting',
    description: 'Creates automated reports and distributes them to stakeholders',
    status: 'idle',
    lastActive: '2 hours ago',
    capabilities: ['Report Generation', 'Data Visualization', 'Email Distribution'],
    icon: '📝'
  },
  {
    id: 'agent-4',
    name: 'Customer Service Assistant',
    type: 'Communication',
    description: 'Handles routine customer inquiries and escalates when necessary',
    status: 'paused',
    lastActive: '1 day ago',
    capabilities: ['Natural Language Processing', 'Knowledge Base Integration', 'Ticket Management'],
    icon: '💬'
  },
  {
    id: 'agent-5',
    name: 'Financial Analyzer',
    type: 'Finance',
    description: 'Analyzes financial data and generates insights',
    status: 'error',
    lastActive: '1 hour ago',
    capabilities: ['Financial Analysis', 'Trend Detection', 'Risk Assessment'],
    icon: '💰'
  },
  {
    id: 'agent-6',
    name: 'Content Curator',
    type: 'Content',
    description: 'Curates and organizes content from various sources',
    status: 'active',
    lastActive: '15 minutes ago',
    capabilities: ['Content Curation', 'Categorization', 'Relevance Ranking'],
    icon: '📚'
  }
];

interface AgentListProps {
  onSelectAgent: (agentId: string) => void;
}

export default function AgentList({ onSelectAgent }: AgentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get filtered agents
  const filteredAgents = sampleAgents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique types for filter
  const agentTypes = Array.from(new Set(sampleAgents.map(agent => agent.type)));

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search Agents</label>
              <input
                type="text"
                placeholder="Search by name or description"
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="paused">Paused</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {agentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Agent List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.length > 0 ? (
          filteredAgents.map(agent => (
            <Card 
              key={agent.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => onSelectAgent(agent.id)}
            >
              <div className="flex items-start mb-3">
                <div className="text-3xl mr-3">{agent.icon}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{agent.name}</h3>
                  <div className="text-sm text-text-secondary">{agent.type}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              </div>
              
              <p className="text-sm mb-3">{agent.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {agent.capabilities.map(capability => (
                  <span 
                    key={capability} 
                    className="px-2 py-1 text-xs bg-secondary/10 rounded-full"
                  >
                    {capability}
                  </span>
                ))}
              </div>
              
              <div className="text-xs text-text-secondary flex justify-between items-center">
                <span>Last active: {agent.lastActive}</span>
                <Button variant="secondary" size="xs" onClick={(e) => {
                  e.stopPropagation();
                  onSelectAgent(agent.id);
                }}>
                  View Details
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8 bg-background-elevated rounded-md">
            <div className="text-4xl mb-2">🤖</div>
            <h3 className="text-lg font-medium mb-1">No agents match your filters</h3>
            <p className="text-text-secondary mb-3">Try changing your filter settings</p>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 