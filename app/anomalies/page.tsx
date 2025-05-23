'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import AnomalyDetailModal from '../components/anomalies/AnomalyDetailModal'
import { useIncidentCreation } from '../hooks/useIncidentCreation'

// Sample anomaly data with IDs
const anomalies = [
  {
    id: 'anomaly_001',
    title: 'Unusual Traffic Pattern',
    description: 'Website traffic dropped 45% in the last hour',
    severity: 'critical' as const,
    detectedAt: '23 minutes ago',
    status: 'active' as const
  },
  {
    id: 'anomaly_002', 
    title: 'Database Query Performance',
    description: 'Query response time increased by 200%',
    severity: 'high' as const,
    detectedAt: '1 hour ago',
    status: 'active' as const
  },
  {
    id: 'anomaly_003',
    title: 'Customer Churn Spike',
    description: 'Cancellation rate 3x higher than normal',
    severity: 'high' as const,
    detectedAt: '2 hours ago',
    status: 'active' as const
  }
]

export default function AnomaliesPage() {
  const { createAnomalyIncident, creating } = useIncidentCreation()
  const [selectedAnomaly, setSelectedAnomaly] = useState<typeof anomalies[0] | null>(null)

  const handleCreateIncident = async (anomaly: typeof anomalies[0]) => {
    try {
      await createAnomalyIncident(
        anomaly.id,
        anomaly.title,
        anomaly.severity
      )
    } catch (error) {
      alert('Failed to create incident report')
    }
  }

  const handleAnomalyUpdate = () => {
    // Refresh data or update state
    console.log('Anomaly updated')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800'
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Anomaly Detection</h1>
        <p className="text-text-secondary">Monitor and investigate anomalies across your data sources</p>
      </div>
      
      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Active Anomalies" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Active Anomalies</div>
          <div className="text-3xl font-bold text-red-500">7</div>
        </Card>
        
        <Card title="Resolved Today" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Resolved Today</div>
          <div className="text-3xl font-bold text-green-500">15</div>
        </Card>
        
        <Card title="Detection Rate" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Detection Accuracy</div>
          <div className="text-3xl font-bold text-blue-500">94%</div>
        </Card>
        
        <Card title="Avg Resolution" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Average Resolution</div>
          <div className="text-3xl font-bold text-purple-500">2.4h</div>
        </Card>
      </div>

      {/* Active Anomalies */}
      <Card title="Active Anomalies" className="mb-6">
        <div className="p-4">
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <div 
                key={anomaly.id}
                className={`flex items-center justify-between p-4 rounded-lg ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getSeverityDot(anomaly.severity)}`}></div>
                  <div>
                    <div className="font-medium">{anomaly.title}</div>
                    <div className="text-sm">{anomaly.description}</div>
                    <div className="text-xs mt-1">Detected {anomaly.detectedAt}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    Investigate
                  </Button>
                  
                  {/* Show "Create Incident" for high and critical severity */}
                  {(anomaly.severity === 'high' || anomaly.severity === 'critical') && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleCreateIncident(anomaly)}
                      disabled={creating}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      📋 Create Incident
                    </Button>
                  )}
                  
                  <Button variant="primary" size="sm">Resolve</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Detection Timeline">
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Today</div>
                <div className="text-sm text-text-secondary">22 detected • 15 resolved</div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">Yesterday</div>
                <div className="text-sm text-text-secondary">31 detected • 29 resolved</div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">This Week</div>
                <div className="text-sm text-text-secondary">187 detected • 172 resolved</div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Top Data Sources">
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">User Database</div>
                  <div className="text-sm text-text-secondary">3 anomalies today</div>
                </div>
                <div className="text-red-500">🔴</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Payment System</div>
                  <div className="text-sm text-text-secondary">2 anomalies today</div>
                </div>
                <div className="text-yellow-500">🟡</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Analytics API</div>
                  <div className="text-sm text-text-secondary">1 anomaly today</div>
                </div>
                <div className="text-yellow-500">🟡</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Service</div>
                  <div className="text-sm text-text-secondary">0 anomalies today</div>
                </div>
                <div className="text-green-500">🟢</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">File Storage</div>
                  <div className="text-sm text-text-secondary">0 anomalies today</div>
                </div>
                <div className="text-green-500">🟢</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Anomaly Detail Modal */}
      {selectedAnomaly && (
        <AnomalyDetailModal
          anomaly={selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
          onUpdate={handleAnomalyUpdate}
        />
    </AppLayout>
  )
} 