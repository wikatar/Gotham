'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'model_execution' | 'decision' | 'model_update' | 'system_change' | 'user_interaction';
  component: string;
  description: string;
  userId?: string;
  userName?: string;
  modelId?: string;
  modelName?: string;
  severity: 'info' | 'warning' | 'critical';
  metadata: Record<string, any>;
}

export default function AuditLog() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: 'event-1',
      timestamp: '2023-11-05 15:23:45',
      eventType: 'decision',
      component: 'Anomaly Detector',
      description: 'High-confidence anomaly detected in sensor readings',
      modelId: 'model-1',
      modelName: 'Anomaly Detector v2.1.0',
      severity: 'critical',
      metadata: {
        decisionId: 'decision-1',
        confidence: 0.92,
        impactLevel: 'high'
      }
    },
    {
      id: 'event-2',
      timestamp: '2023-11-05 14:12:33',
      eventType: 'model_execution',
      component: 'Semantic Classifier',
      description: 'Text classification performed on customer feedback',
      modelId: 'model-3',
      modelName: 'Semantic Classifier v2.0.0',
      severity: 'info',
      metadata: {
        executionTime: '234ms',
        inputSize: '1.2kb'
      }
    },
    {
      id: 'event-3',
      timestamp: '2023-11-05 12:45:22',
      eventType: 'user_interaction',
      component: 'Decision Review Interface',
      description: 'User overrode system decision and provided feedback',
      userId: 'user-123',
      userName: 'John Analyst',
      severity: 'warning',
      metadata: {
        decisionId: 'decision-previous',
        originalOutcome: 'Anomaly Detected',
        newOutcome: 'False Positive',
        justification: 'Seasonal maintenance activity'
      }
    },
    {
      id: 'event-4',
      timestamp: '2023-11-05 09:33:10',
      eventType: 'model_update',
      component: 'Model Registry',
      description: 'Anomaly Detector model updated to version 2.1.0',
      userId: 'user-admin',
      userName: 'System Administrator',
      modelId: 'model-1',
      modelName: 'Anomaly Detector',
      severity: 'warning',
      metadata: {
        previousVersion: '2.0.8',
        newVersion: '2.1.0',
        changeDescription: 'Improved temperature threshold calibration'
      }
    },
    {
      id: 'event-5',
      timestamp: '2023-11-04 22:17:05',
      eventType: 'system_change',
      component: 'Global Settings',
      description: 'System-wide confidence threshold updated',
      userId: 'user-admin',
      userName: 'System Administrator',
      severity: 'warning',
      metadata: {
        setting: 'minDecisionConfidence',
        oldValue: 0.85,
        newValue: 0.9,
        reason: 'Reduce false positives'
      }
    },
    {
      id: 'event-6',
      timestamp: '2023-11-04 18:05:33',
      eventType: 'decision',
      component: 'Forecasting Engine',
      description: 'Time series forecast generated for financial planning',
      modelId: 'model-2',
      modelName: 'Forecasting Engine v3.0.1',
      severity: 'info',
      metadata: {
        decisionId: 'decision-3',
        confidence: 0.79,
        forecastHorizon: '12 months'
      }
    },
    {
      id: 'event-7',
      timestamp: '2023-11-04 15:42:19',
      eventType: 'model_execution',
      component: 'Regression Analyzer',
      description: 'Regression analysis performed on market data',
      modelId: 'model-4',
      modelName: 'Regression Analyzer v1.5.2',
      severity: 'info',
      metadata: {
        executionTime: '1.2s',
        dataPoints: 2453
      }
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle event selection
  const handleSelectEvent = (event: AuditEvent) => {
    setSelectedEvent(event);
  };

  // Get severity badge color
  const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get event type badge color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'decision':
        return 'bg-purple-100 text-purple-800';
      case 'model_execution':
        return 'bg-blue-100 text-blue-800';
      case 'model_update':
        return 'bg-green-100 text-green-800';
      case 'system_change':
        return 'bg-yellow-100 text-yellow-800';
      case 'user_interaction':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get filtered events
  const getFilteredEvents = () => {
    return auditEvents.filter(event => {
      // Filter by event type
      if (filterType !== 'all' && event.eventType !== filterType) {
        return false;
      }
      
      // Filter by severity
      if (filterSeverity !== 'all' && event.severity !== filterSeverity) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          event.description.toLowerCase().includes(query) ||
          event.component.toLowerCase().includes(query) ||
          (event.userName && event.userName.toLowerCase().includes(query)) ||
          (event.modelName && event.modelName.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Event Types</option>
                <option value="decision">Decisions</option>
                <option value="model_execution">Model Executions</option>
                <option value="model_update">Model Updates</option>
                <option value="system_change">System Changes</option>
                <option value="user_interaction">User Interactions</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                placeholder="Search in audit logs..."
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <div>
              <span className="text-sm text-text-secondary">
                Showing {filteredEvents.length} of {auditEvents.length} events
              </span>
            </div>
            <div className="space-x-2">
              <Button variant="secondary" size="sm">
                Export Logs
              </Button>
              <Button variant="primary" size="sm">
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Audit Log Table */}
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary/10">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background-paper divide-y divide-secondary/10">
              {filteredEvents.map(event => (
                <tr 
                  key={event.id}
                  className={`hover:bg-secondary/5 cursor-pointer ${
                    selectedEvent?.id === event.id ? 'bg-secondary/10' : ''
                  }`}
                  onClick={() => handleSelectEvent(event)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {event.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.eventType)}`}>
                      {event.eventType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {event.component}
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">
                    {event.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(event.severity)}`}>
                      {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`#event/${event.id}`, '_blank');
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Event Details */}
      {selectedEvent && (
        <Card title="Event Details">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Event ID</h3>
                <p>{selectedEvent.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Timestamp</h3>
                <p>{selectedEvent.timestamp}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Event Type</h3>
                <p className={`px-2 py-1 text-xs rounded-full inline-block ${getEventTypeColor(selectedEvent.eventType)}`}>
                  {selectedEvent.eventType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Component</h3>
                <p>{selectedEvent.component}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Severity</h3>
                <p className={`px-2 py-1 text-xs rounded-full inline-block ${getSeverityColor(selectedEvent.severity)}`}>
                  {selectedEvent.severity.charAt(0).toUpperCase() + selectedEvent.severity.slice(1)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-text-secondary">Description</h3>
                <p>{selectedEvent.description}</p>
              </div>
              
              {selectedEvent.userId && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary">User</h3>
                  <p>{selectedEvent.userName} ({selectedEvent.userId})</p>
                </div>
              )}
              
              {selectedEvent.modelId && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary">Model</h3>
                  <p>{selectedEvent.modelName} ({selectedEvent.modelId})</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Metadata</h3>
              <div className="bg-background-elevated p-3 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{JSON.stringify(selectedEvent.metadata, null, 2)}</pre>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="secondary" size="sm">
                Export Event
              </Button>
              {selectedEvent.eventType === 'decision' && (
                <Button variant="primary" size="sm">
                  View Decision Details
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 