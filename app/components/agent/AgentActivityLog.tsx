'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ActivityLogItem {
  id: string;
  agentName: string;
  agentId: string;
  action: string;
  timestamp: string;
  status: 'success' | 'failure' | 'pending';
  details: string;
}

// Sample activity data
const sampleActivityLogs: ActivityLogItem[] = [
  {
    id: 'log-1',
    agentName: 'Data Collector',
    agentId: 'agent-1',
    action: 'Data Collection Run',
    timestamp: '2023-11-05 14:30:22',
    status: 'success',
    details: 'Collected 1,542 records from CRM system'
  },
  {
    id: 'log-2',
    agentName: 'Anomaly Detector',
    agentId: 'agent-2',
    action: 'Anomaly Analysis',
    timestamp: '2023-11-05 14:35:18',
    status: 'success',
    details: 'Analyzed 10,000 data points, found 3 anomalies'
  },
  {
    id: 'log-3',
    agentName: 'Report Generator',
    agentId: 'agent-3',
    action: 'Weekly Report Creation',
    timestamp: '2023-11-05 12:00:00',
    status: 'success',
    details: 'Generated and distributed weekly analytics report'
  },
  {
    id: 'log-4',
    agentName: 'Financial Analyzer',
    agentId: 'agent-5',
    action: 'Financial Model Update',
    timestamp: '2023-11-05 11:15:42',
    status: 'failure',
    details: 'Failed to update financial model - missing input data'
  },
  {
    id: 'log-5',
    agentName: 'Customer Service Assistant',
    agentId: 'agent-4',
    action: 'Ticket Processing',
    timestamp: '2023-11-05 10:22:33',
    status: 'pending',
    details: 'Processing 12 customer support tickets'
  },
  {
    id: 'log-6',
    agentName: 'Data Collector',
    agentId: 'agent-1',
    action: 'Data Transformation',
    timestamp: '2023-11-05 09:45:12',
    status: 'success',
    details: 'Transformed customer data for warehouse loading'
  },
  {
    id: 'log-7',
    agentName: 'Content Curator',
    agentId: 'agent-6',
    action: 'Content Classification',
    timestamp: '2023-11-05 08:30:45',
    status: 'success',
    details: 'Classified 235 content items by category and relevance'
  },
  {
    id: 'log-8',
    agentName: 'Anomaly Detector',
    agentId: 'agent-2',
    action: 'Alert Generation',
    timestamp: '2023-11-04 23:12:18',
    status: 'success',
    details: 'Generated high-priority alert for abnormal system behavior'
  }
];

export default function AgentActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Get filtered logs
  const filteredLogs = sampleActivityLogs.filter(log => {
    const matchesSearch = 
      log.agentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && log.timestamp.startsWith('2023-11-05')) ||
      (dateFilter === 'yesterday' && log.timestamp.startsWith('2023-11-04'));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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
              <label className="block text-sm font-medium mb-1">Search Activity</label>
              <input
                type="text"
                placeholder="Search by agent, action, or details"
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
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Time Period</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Activity List */}
      <Card>
        <div className="p-4">
          <h3 className="font-medium mb-4">Agent Activity</h3>
          
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <div 
                  key={log.id}
                  className="border border-secondary/20 rounded-md p-4 hover:bg-background-elevated"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{log.action}</h4>
                      <div className="text-sm text-text-secondary">
                        Agent: {log.agentName} • {log.timestamp}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(log.status)}`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="mb-3">{log.details}</p>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="secondary" 
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-background-elevated rounded-md">
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-lg font-medium mb-1">No activity logs match your filters</h3>
                <p className="text-text-secondary mb-3">Try changing your filter settings</p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 