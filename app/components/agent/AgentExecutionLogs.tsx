'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AgentExecutionLog {
  id: string;
  agentId: string;
  prompt: string;
  response: string | null;
  inputContext: any;
  executionTime: number | null;
  actionTaken: string | null;
  status: string;
  error: string | null;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    actionType: string;
  };
}

interface AgentExecutionLogsProps {
  agentId?: string;
  accountId: string;
  limit?: number;
}

export default function AgentExecutionLogs({ agentId, accountId, limit = 10 }: AgentExecutionLogsProps) {
  const [logs, setLogs] = useState<AgentExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [runningAgent, setRunningAgent] = useState(false);
  
  // Fetch execution logs
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/agents/logs?accountId=${accountId}&page=${page}&limit=${limit}`;
      
      if (agentId) {
        url += `&agentId=${agentId}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setLogs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.data.error || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Error fetching agent logs:', err);
      setError('Failed to fetch agent execution logs');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch logs when component mounts or parameters change
  useEffect(() => {
    fetchLogs();
  }, [agentId, accountId, page, limit]);
  
  // Re-run an agent with the same input context
  const reRunAgent = async (log: AgentExecutionLog) => {
    if (!log.agentId) return;
    
    setRunningAgent(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/agents/execute', {
        accountId,
        agentId: log.agentId,
        inputContext: log.inputContext || {},
      });
      
      if (response.data.success) {
        // Refresh logs after execution
        fetchLogs();
      } else {
        setError(response.data.error || 'Failed to execute agent');
      }
    } catch (err) {
      console.error('Error executing agent:', err);
      setError('Failed to execute agent');
    } finally {
      setRunningAgent(false);
    }
  };
  
  // Toggle expanded state for a log
  const toggleExpandLog = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Logs list */}
      <div className="space-y-4">
        {loading && logs.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="animate-pulse">Loading execution logs...</div>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="p-6 text-center">
            <p>No execution logs found.</p>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <div 
                className="p-4 cursor-pointer hover:bg-secondary/5"
                onClick={() => toggleExpandLog(log.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{log.agent.name}</div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(log.status)}`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </div>
                
                <div className="text-sm text-text-secondary">
                  {formatDate(log.createdAt)}
                  {log.executionTime && ` • ${log.executionTime}ms`}
                  {log.actionTaken && ` • Action: ${log.actionTaken}`}
                </div>
                
                {log.error && (
                  <div className="mt-2 text-sm text-red-600">{log.error}</div>
                )}
              </div>
              
              {/* Expanded content */}
              {expandedLogId === log.id && (
                <div className="border-t border-secondary/10 p-4">
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Prompt</h4>
                    <pre className="bg-secondary/5 p-3 rounded text-sm overflow-auto max-h-60">
                      {log.prompt}
                    </pre>
                  </div>
                  
                  {log.response && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Response</h4>
                      <pre className="bg-secondary/5 p-3 rounded text-sm overflow-auto max-h-60">
                        {log.response}
                      </pre>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Input Context</h4>
                    <pre className="bg-secondary/5 p-3 rounded text-sm overflow-auto max-h-60">
                      {JSON.stringify(log.inputContext, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        reRunAgent(log);
                      }}
                      disabled={runningAgent}
                    >
                      {runningAgent ? 'Running...' : 'Run Again'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page => Math.max(page - 1, 1))}
              disabled={page === 1 || loading}
              className="mr-2"
            >
              Previous
            </Button>
            
            <span className="mx-4 text-sm">
              Page {page} of {totalPages}
            </span>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page => Math.min(page + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="ml-2"
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
} 