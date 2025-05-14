'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Alert {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved';
  category: 'system' | 'security' | 'performance' | 'data' | 'application';
}

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-1',
      timestamp: '2023-11-05 15:23:45',
      title: 'Temperature Sensor Anomaly',
      description: 'Critical temperature threshold exceeded in server room',
      source: 'Environment Monitoring System',
      severity: 'critical',
      status: 'active',
      category: 'system'
    },
    {
      id: 'alert-2',
      timestamp: '2023-11-05 14:12:33',
      title: 'Multiple Failed Login Attempts',
      description: 'Detected 15 failed login attempts for admin account in last 10 minutes',
      source: 'Security System',
      severity: 'high',
      status: 'active',
      category: 'security'
    },
    {
      id: 'alert-3',
      timestamp: '2023-11-05 12:45:22',
      title: 'Database Connection Latency',
      description: 'Connection to primary database experiencing high latency (>500ms)',
      source: 'Database Monitor',
      severity: 'medium',
      status: 'acknowledged',
      category: 'performance'
    },
    {
      id: 'alert-4',
      timestamp: '2023-11-05 09:33:10',
      title: 'Data Integration Failure',
      description: 'Financial data integration pipeline failed to complete',
      source: 'ETL System',
      severity: 'high',
      status: 'resolved',
      category: 'data'
    },
    {
      id: 'alert-5',
      timestamp: '2023-11-04 22:17:05',
      title: 'Memory Usage Warning',
      description: 'AI model service exceeding memory threshold (85%)',
      source: 'Resource Monitor',
      severity: 'medium',
      status: 'acknowledged',
      category: 'system'
    },
    {
      id: 'alert-6',
      timestamp: '2023-11-04 18:05:33',
      title: 'API Rate Limit Warning',
      description: 'External API rate limit at 85% of quota',
      source: 'API Gateway',
      severity: 'low',
      status: 'active',
      category: 'application'
    }
  ]);

  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get filtered alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    if (filterCategory !== 'all' && alert.category !== filterCategory) return false;
    return true;
  });

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle acknowledging an alert
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, status: 'acknowledged' as const } : alert
      )
    );
  };

  // Handle resolving an alert
  const handleResolveAlert = (id: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, status: 'resolved' as const } : alert
      )
    );
  };

  return (
    <div>
      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="font-medium text-text-secondary mb-1">Total Alerts</div>
            <div className="text-3xl font-bold">{alerts.length}</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="font-medium text-text-secondary mb-1">Active</div>
            <div className="text-3xl font-bold text-red-500">
              {alerts.filter(a => a.status === 'active').length}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="font-medium text-text-secondary mb-1">Critical/High</div>
            <div className="text-3xl font-bold text-orange-500">
              {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="font-medium text-text-secondary mb-1">Resolved Today</div>
            <div className="text-3xl font-bold text-green-500">
              {alerts.filter(a => a.status === 'resolved' && a.timestamp.startsWith('2023-11-05')).length}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">Filter Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="security">Security</option>
                <option value="performance">Performance</option>
                <option value="data">Data</option>
                <option value="application">Application</option>
              </select>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Alert List */}
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Alert Feed</h3>
            <Button variant="primary" size="sm">
              Create Alert Rule
            </Button>
          </div>
          
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className="border border-secondary/20 rounded-md p-4 hover:bg-background-elevated"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <div className="text-sm text-text-secondary">{alert.source} • {alert.timestamp}</div>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mb-3">{alert.description}</p>
                  
                  <div className="flex justify-end space-x-2">
                    {alert.status === 'active' && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    
                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                    
                    {alert.status === 'resolved' && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                      >
                        View Resolution
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-background-elevated rounded-md">
                <div className="text-4xl mb-2">🔔</div>
                <h3 className="text-lg font-medium mb-1">No alerts match your filters</h3>
                <p className="text-text-secondary mb-3">Try changing your filter settings</p>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => {
                    setFilterSeverity('all');
                    setFilterStatus('all');
                    setFilterCategory('all');
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