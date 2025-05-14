'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error' | 'stopped';
  lastRun: string;
  frequency: string;
  owner: string;
  steps: number;
  dependencies: string[];
}

export default function WorkflowController() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf-1',
      name: 'Data Collection Pipeline',
      description: 'Gathers data from various sources and performs initial cleaning',
      status: 'active',
      lastRun: '2023-11-05 14:23',
      frequency: 'Hourly',
      owner: 'Data Engineering',
      steps: 8,
      dependencies: ['API Gateway', 'Data Lake']
    },
    {
      id: 'wf-2',
      name: 'Anomaly Detection System',
      description: 'Runs machine learning models to detect anomalies in system data',
      status: 'active',
      lastRun: '2023-11-05 15:00',
      frequency: 'Every 15 minutes',
      owner: 'AI Team',
      steps: 5,
      dependencies: ['Data Collection Pipeline']
    },
    {
      id: 'wf-3',
      name: 'Predictive Maintenance',
      description: 'Schedules maintenance based on predictive analytics',
      status: 'paused',
      lastRun: '2023-11-04 08:15',
      frequency: 'Daily',
      owner: 'Operations',
      steps: 12,
      dependencies: ['Anomaly Detection System', 'Asset Management System']
    },
    {
      id: 'wf-4',
      name: 'Customer Insights Generation',
      description: 'Aggregates customer data and generates insights reports',
      status: 'error',
      lastRun: '2023-11-04 23:45',
      frequency: 'Daily',
      owner: 'Marketing Analytics',
      steps: 15,
      dependencies: ['Data Collection Pipeline', 'CRM Integration']
    },
    {
      id: 'wf-5',
      name: 'Automated Reporting',
      description: 'Generates and distributes periodic reports to stakeholders',
      status: 'active',
      lastRun: '2023-11-05 06:00',
      frequency: 'Daily',
      owner: 'Business Intelligence',
      steps: 7,
      dependencies: ['Customer Insights Generation', 'Performance Analytics']
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Handle toggling workflow status
  const handleToggleStatus = (workflowId: string) => {
    setWorkflows(prev => 
      prev.map(workflow => {
        if (workflow.id === workflowId) {
          return {
            ...workflow,
            status: workflow.status === 'active' ? 'paused' : 'active'
          };
        }
        return workflow;
      })
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'paused':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'stopped':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter workflows by status
  const filteredWorkflows = statusFilter === 'all' 
    ? workflows 
    : workflows.filter(workflow => workflow.status === statusFilter);

  // Get the selected workflow
  const activeWorkflow = workflows.find(wf => wf.id === selectedWorkflow);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant={statusFilter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === 'active' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active
          </Button>
          <Button 
            variant={statusFilter === 'paused' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('paused')}
          >
            Paused
          </Button>
          <Button 
            variant={statusFilter === 'error' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('error')}
          >
            Error
          </Button>
        </div>
        
        <Button variant="primary" size="sm">
          Create Workflow
        </Button>
      </div>
      
      <Card title="Workflow Management">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Workflow
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-paper divide-y divide-secondary/10">
                {filteredWorkflows.map(workflow => (
                  <tr 
                    key={workflow.id} 
                    className={`hover:bg-secondary/5 cursor-pointer ${
                      selectedWorkflow === workflow.id ? 'bg-secondary/10' : ''
                    }`}
                    onClick={() => setSelectedWorkflow(
                      selectedWorkflow === workflow.id ? null : workflow.id
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-text-secondary">{workflow.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(workflow.status)}`}>
                        {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {workflow.lastRun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {workflow.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {workflow.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(workflow.id);
                          }}
                        >
                          {workflow.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          Run Now
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      
      {/* Workflow Detail */}
      {activeWorkflow && (
        <Card title={`Workflow Details: ${activeWorkflow.name}`}>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Workflow Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">ID:</span>
                    <span>{activeWorkflow.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Status:</span>
                    <span className={getStatusColor(activeWorkflow.status)}>
                      {activeWorkflow.status.charAt(0).toUpperCase() + activeWorkflow.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Owner:</span>
                    <span>{activeWorkflow.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Steps:</span>
                    <span>{activeWorkflow.steps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Frequency:</span>
                    <span>{activeWorkflow.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Last Run:</span>
                    <span>{activeWorkflow.lastRun}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-3 mt-6">Dependencies</h3>
                <div className="space-y-2">
                  {activeWorkflow.dependencies.map(dep => (
                    <div key={dep} className="bg-secondary/10 px-3 py-2 rounded-md">
                      {dep}
                    </div>
                  ))}
                  {activeWorkflow.dependencies.length === 0 && (
                    <div className="text-text-secondary">No dependencies</div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Workflow Steps</h3>
                <div className="space-y-3">
                  {Array.from({ length: Math.min(activeWorkflow.steps, 5) }, (_, i) => (
                    <div key={i} className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center mr-3 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium">Step {i + 1}</div>
                        <div className="text-sm text-text-secondary">
                          {i === 0 ? 'Initialize and validate inputs' :
                           i === 1 ? 'Extract data from sources' :
                           i === 2 ? 'Transform and clean data' :
                           i === 3 ? 'Load data to destination' :
                           'Verify and log results'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {activeWorkflow.steps > 5 && (
                    <div className="text-sm text-text-secondary text-center">
                      + {activeWorkflow.steps - 5} more steps
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" className="w-full">
                      Edit Workflow
                    </Button>
                    <Button variant="secondary" className="w-full">
                      View Logs
                    </Button>
                    <Button variant="secondary" className="w-full">
                      Clone Workflow
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full text-red-500 hover:bg-red-50"
                    >
                      Delete Workflow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 