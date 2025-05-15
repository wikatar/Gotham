'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Card from '../ui/Card'
import axios from 'axios'

interface AgentAction {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string;
  actionDescription: string;
  status: 'success' | 'failure' | 'pending';
  timestamp: string;
  reasonChainId?: string;
}

interface ActionFeedProps {
  title: string;
  limit?: number;
}

export default function ActionFeed({ title, limit = 10 }: ActionFeedProps) {
  const [actions, setActions] = useState<AgentAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // For now, we'll use mock data
    // In the future, this should be replaced with a real API call
    const fetchAgentActions = async () => {
      try {
        setLoading(true)
        // Mock data for demonstration
        // Replace with: const response = await axios.get('/api/control/agent-actions')
        
        const mockActions: AgentAction[] = [
          {
            id: '1',
            agentId: 'agent-1',
            agentName: 'Data Validation Agent',
            actionType: 'validation',
            actionDescription: 'Validated daily crime statistics data from GCPD',
            status: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            reasonChainId: 'reason-1',
          },
          {
            id: '2',
            agentId: 'agent-2',
            agentName: 'Anomaly Detection Agent',
            actionType: 'detection',
            actionDescription: 'Detected unusual pattern in financial transactions',
            status: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(), // 32 minutes ago
            reasonChainId: 'reason-2',
          },
          {
            id: '3',
            agentId: 'agent-3',
            agentName: 'Data Integration Agent',
            actionType: 'integration',
            actionDescription: 'Failed to integrate new dataset from external source',
            status: 'failure',
            timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), // 55 minutes ago
          },
          {
            id: '4',
            agentId: 'agent-4',
            agentName: 'Alert Notification Agent',
            actionType: 'notification',
            actionDescription: 'Sent alert to system administrators',
            status: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            reasonChainId: 'reason-4',
          },
          {
            id: '5',
            agentId: 'agent-5',
            agentName: 'Data Cleanup Agent',
            actionType: 'maintenance',
            actionDescription: 'Performed scheduled data cleanup operations',
            status: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
            reasonChainId: 'reason-5',
          },
        ]
        
        setActions(mockActions)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching agent actions:', err)
        setError('Failed to load recent actions')
        setLoading(false)
      }
    }

    fetchAgentActions()
    
    // Set up polling for fresh data every 60 seconds
    const interval = setInterval(fetchAgentActions, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Get status color based on action status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <Card title={title}>
      <div className="overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-pulse text-text-secondary">
              Loading actions...
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            {error}
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center p-8 text-text-secondary">
            No recent actions found.
          </div>
        ) : (
          <div className="divide-y divide-secondary/10">
            {actions.map(action => (
              <div key={action.id} className="p-4 hover:bg-secondary/5">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{action.agentName}</div>
                  <div className="text-xs text-text-secondary">
                    {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="text-sm mb-2">
                  {action.actionDescription}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(action.status)}`}>
                    {action.status}
                  </span>
                  
                  {action.reasonChainId && (
                    <a 
                      href={`/explainability/reason-chain/${action.reasonChainId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View Reasoning
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
} 