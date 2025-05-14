'use client'

import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Sample anomaly data
const anomalyData = [
  {
    id: 'a-001',
    title: 'Unusual traffic spike in Tokyo datacenter',
    severity: 'high',
    category: 'performance',
    location: 'Japan',
    timestamp: '2025-05-13T09:23:47Z',
    description: 'Detected a 300% increase in traffic to Tokyo datacenter. Pattern indicates potential DDoS attack.',
    metrics: {
      baseline: '2.3 GB/s',
      anomalous: '7.8 GB/s',
      duration: '18 minutes'
    },
    status: 'investigating',
    source: 'Network Monitoring'
  },
  {
    id: 'a-002',
    title: 'Customer churn prediction accuracy drop',
    severity: 'medium',
    category: 'ml-model',
    location: 'Global',
    timestamp: '2025-05-13T08:15:22Z',
    description: 'Machine learning model for churn prediction showing significant accuracy drop over the past 24 hours.',
    metrics: {
      baseline: '92% accuracy',
      anomalous: '76% accuracy',
      duration: '24 hours'
    },
    status: 'acknowledged',
    source: 'ML Monitoring'
  },
  {
    id: 'a-003',
    title: 'Database query latency spike',
    severity: 'high',
    category: 'performance',
    location: 'United States',
    timestamp: '2025-05-13T07:45:12Z',
    description: 'Primary customer database showing increased query latency. Affecting customer service operations.',
    metrics: {
      baseline: '45ms',
      anomalous: '320ms',
      duration: '35 minutes'
    },
    status: 'resolved',
    source: 'Database Monitoring'
  },
  {
    id: 'a-004',
    title: 'Customer feedback sentiment decline',
    severity: 'medium',
    category: 'customer',
    location: 'Germany',
    timestamp: '2025-05-13T06:30:55Z',
    description: 'Significant negative shift in customer feedback sentiment detected in German market.',
    metrics: {
      baseline: '4.2/5 rating',
      anomalous: '2.8/5 rating',
      duration: '5 days'
    },
    status: 'investigating',
    source: 'Sentiment Analysis'
  },
  {
    id: 'a-005',
    title: 'Order processing delays',
    severity: 'low',
    category: 'operations',
    location: 'Brazil',
    timestamp: '2025-05-13T05:12:33Z',
    description: 'Order fulfillment times exceeding SLA in Brazilian operations.',
    metrics: {
      baseline: '2.3 hours',
      anomalous: '4.7 hours',
      duration: '12 hours'
    },
    status: 'acknowledged',
    source: 'Operations Monitoring'
  },
  {
    id: 'a-006',
    title: 'Unusual login pattern detected',
    severity: 'critical',
    category: 'security',
    location: 'Multiple',
    timestamp: '2025-05-13T04:45:18Z',
    description: 'Multiple failed login attempts from unusual locations detected for admin accounts.',
    metrics: {
      baseline: '3-5 login attempts/day',
      anomalous: '120+ attempts/hour',
      duration: '2 hours'
    },
    status: 'investigating',
    source: 'Security Monitoring'
  },
  {
    id: 'a-007',
    title: 'Marketing campaign conversion drop',
    severity: 'medium',
    category: 'marketing',
    location: 'United Kingdom',
    timestamp: '2025-05-13T02:30:45Z',
    description: 'Spring promotion campaign showing significantly lower conversion rates than expected.',
    metrics: {
      baseline: '3.2% conversion',
      anomalous: '0.8% conversion',
      duration: '3 days'
    },
    status: 'acknowledged',
    source: 'Marketing Analytics'
  },
  {
    id: 'a-008',
    title: 'API endpoint failure rate increase',
    severity: 'high',
    category: 'service',
    location: 'Global',
    timestamp: '2025-05-13T01:15:22Z',
    description: 'Public API showing increased 5xx errors affecting partner integrations.',
    metrics: {
      baseline: '0.1% error rate',
      anomalous: '4.8% error rate',
      duration: '45 minutes'
    },
    status: 'resolved',
    source: 'API Monitoring'
  }
];

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Helper function to get severity class
const getSeverityClass = (severity: string) => {
  switch(severity) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get status class
const getStatusClass = (status: string) => {
  switch(status) {
    case 'investigating': return 'bg-purple-100 text-purple-800';
    case 'acknowledged': return 'bg-blue-100 text-blue-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

type AnomalyDetectionProps = {
  filter?: string | null;
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ filter }) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(filter || null);
  
  // Filter anomalies based on all filters
  const filteredAnomalies = anomalyData.filter(anomaly => {
    if (statusFilter && anomaly.status !== statusFilter) return false;
    if (severityFilter && anomaly.severity !== severityFilter) return false;
    if (categoryFilter && anomaly.category !== categoryFilter) return false;
    return true;
  });
  
  // Get unique categories, statuses, and severities for filters
  const categories = Array.from(new Set(anomalyData.map(a => a.category)));
  const statuses = Array.from(new Set(anomalyData.map(a => a.status)));
  const severities = Array.from(new Set(anomalyData.map(a => a.severity)));
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-secondary/20 p-4">
            <h2 className="text-lg font-medium">Anomaly Detection</h2>
            <p className="text-sm text-text-secondary">
              Enterprise-wide anomaly detection and notification system
            </p>
          </div>
          
          <div className="p-4 border-b border-secondary/20 bg-background-elevated">
            <div className="flex flex-wrap gap-2">
              <div className="mr-2">
                <span className="text-sm text-text-secondary">Status:</span>
                <div className="flex gap-1 mt-1">
                  <Button 
                    variant={statusFilter === null ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setStatusFilter(null)}
                  >
                    All
                  </Button>
                  {statuses.map(status => (
                    <Button 
                      key={status}
                      variant={statusFilter === status ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="mr-2">
                <span className="text-sm text-text-secondary">Severity:</span>
                <div className="flex gap-1 mt-1">
                  <Button 
                    variant={severityFilter === null ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setSeverityFilter(null)}
                  >
                    All
                  </Button>
                  {severities.map(severity => (
                    <Button 
                      key={severity}
                      variant={severityFilter === severity ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setSeverityFilter(severity)}
                      className="capitalize"
                    >
                      {severity}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm text-text-secondary">Category:</span>
                <div className="flex gap-1 mt-1">
                  <Button 
                    variant={categoryFilter === null ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setCategoryFilter(null)}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button 
                      key={category}
                      variant={categoryFilter === category ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setCategoryFilter(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-auto max-h-[calc(100vh-400px)]">
            {filteredAnomalies.length > 0 ? (
              <div className="divide-y divide-secondary/20">
                {filteredAnomalies.map(anomaly => (
                  <div 
                    key={anomaly.id}
                    className={`p-4 hover:bg-background-elevated cursor-pointer ${
                      selectedAnomaly === anomaly.id ? 'bg-background-elevated' : ''
                    }`}
                    onClick={() => setSelectedAnomaly(anomaly.id === selectedAnomaly ? null : anomaly.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(anomaly.severity)} mr-2`}>
                          {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(anomaly.status)}`}>
                          {anomaly.status.charAt(0).toUpperCase() + anomaly.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {formatTimestamp(anomaly.timestamp)}
                      </div>
                    </div>
                    
                    <h3 className="font-medium">{anomaly.title}</h3>
                    
                    <div className="mt-1 text-sm text-text-secondary">
                      <div className="flex justify-between">
                        <span>Location: {anomaly.location}</span>
                        <span>Source: {anomaly.source}</span>
                      </div>
                    </div>
                    
                    {selectedAnomaly === anomaly.id && (
                      <div className="mt-4 text-sm">
                        <p className="mb-3">{anomaly.description}</p>
                        <div className="bg-background-paper p-3 rounded-md">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <div className="text-xs text-text-secondary">Baseline</div>
                              <div className="font-medium">{anomaly.metrics.baseline}</div>
                            </div>
                            <div>
                              <div className="text-xs text-text-secondary">Anomalous</div>
                              <div className="font-medium">{anomaly.metrics.anomalous}</div>
                            </div>
                            <div>
                              <div className="text-xs text-text-secondary">Duration</div>
                              <div className="font-medium">{anomaly.metrics.duration}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-3 space-x-2">
                          <Button variant="secondary" size="sm">Investigate</Button>
                          <Button variant="primary" size="sm">Resolve</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-medium mb-2">No matching anomalies</h3>
                <p className="text-text-secondary">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <Card title="Anomaly Statistics" className="mb-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Anomalies by Severity</h3>
              <div className="space-y-2">
                {severities.map(severity => {
                  const count = anomalyData.filter(a => a.severity === severity).length;
                  const percentage = Math.round((count / anomalyData.length) * 100);
                  
                  return (
                    <div key={severity} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="capitalize">{severity}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-background-paper rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            severity === 'critical' ? 'bg-red-500' :
                            severity === 'high' ? 'bg-orange-500' :
                            severity === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Anomalies by Category</h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const count = anomalyData.filter(a => a.category === category).length;
                  const percentage = Math.round((count / anomalyData.length) * 100);
                  
                  return (
                    <div key={category} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="capitalize">{category}</span>
                        <span>{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-background-paper rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Recent Activity">
          <div className="space-y-3">
            {anomalyData.slice(0, 5).map(anomaly => (
              <div key={anomaly.id} className="text-sm border-b border-secondary/20 last:border-b-0 pb-3 last:pb-0">
                <div className="flex justify-between">
                  <div>
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      anomaly.severity === 'critical' ? 'bg-red-500' :
                      anomaly.severity === 'high' ? 'bg-orange-500' :
                      anomaly.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    } mr-1`}></span>
                    <span className="font-medium">{anomaly.title}</span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-text-secondary flex justify-between">
                  <span>{formatTimestamp(anomaly.timestamp)}</span>
                  <span className="capitalize">{anomaly.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnomalyDetection; 