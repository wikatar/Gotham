'use client'

import { useState } from 'react'
import Button from '../ui/Button'
import { CollaborationPanel } from '../collaboration'
import { ActivityLogger, logActivity } from '@/app/utils/activityLogger'

interface Anomaly {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: string
  status: 'active' | 'investigating' | 'resolved'
  source?: string
  metadata?: any
}

interface AnomalyDetailModalProps {
  anomaly: Anomaly
  onClose: () => void
  onUpdate: () => void
}

export default function AnomalyDetailModal({ 
  anomaly, 
  onClose, 
  onUpdate 
}: AnomalyDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'data' | 'collaboration'>('details')
  const [updating, setUpdating] = useState(false)

  // Current user (in a real app, this would come from auth context)
  const currentUser = {
    id: 'current-user',
    name: 'Current User',
    email: 'user@gotham.se'
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      // Here you would call your API to update the anomaly
      // For now, we'll just simulate the update
      
      // Log the status change
      await logActivity({
        entityType: 'anomaly',
        entityId: anomaly.id,
        action: newStatus === 'resolved' ? 'resolved' : 'status_changed',
        actor: currentUser.email,
        actorName: currentUser.name,
        description: `Ändrade status från "${anomaly.status}" till "${newStatus}"`,
        metadata: { oldStatus: anomaly.status, newStatus }
      })

      // Trigger parent update
      onUpdate()
    } catch (error) {
      console.error('Error updating anomaly status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200'
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'investigating': return 'text-orange-600 bg-orange-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return 'ℹ️'
      default: return '❓'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-paper rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-secondary/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getSeverityIcon(anomaly.severity)}</span>
            <div>
              <h2 className="text-xl font-semibold">{anomaly.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(anomaly.status)}`}>
                  {anomaly.status.charAt(0).toUpperCase() + anomaly.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick status actions */}
            {anomaly.status !== 'investigating' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleStatusChange('investigating')}
                disabled={updating}
              >
                🔍 Investigate
              </Button>
            )}
            {anomaly.status !== 'resolved' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange('resolved')}
                disabled={updating}
              >
                ✅ Resolve
              </Button>
            )}
            
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary/20">
          {['details', 'data', 'collaboration'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'details' && '📋 Details'}
              {tab === 'data' && '📊 Data'}
              {tab === 'collaboration' && '🤝 Collaboration'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Anomaly Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Detected</label>
                    <div>{anomaly.detectedAt}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Source</label>
                    <div>{anomaly.source || 'System Detection'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Severity</label>
                    <div className="flex items-center gap-2">
                      <span>{getSeverityIcon(anomaly.severity)}</span>
                      <span className="capitalize">{anomaly.severity}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    <div className="capitalize">{anomaly.status}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <div className="bg-secondary/5 p-4 rounded-lg">
                  {anomaly.description}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Detection Details</h3>
                <div className="bg-secondary/5 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Detection Method</div>
                      <div>Statistical Analysis</div>
                    </div>
                    <div>
                      <div className="font-medium">Confidence Score</div>
                      <div>87%</div>
                    </div>
                    <div>
                      <div className="font-medium">Affected Metrics</div>
                      <div>Traffic Volume, Response Time</div>
                    </div>
                    <div>
                      <div className="font-medium">Baseline Period</div>
                      <div>Last 30 days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Anomaly Data</h3>
              {anomaly.metadata ? (
                <div className="bg-secondary/5 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(anomaly.metadata, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <div className="w-12 h-12 mx-auto mb-4 text-gray-300">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Ingen detaljerad data tillgänglig.</p>
                  <p className="text-xs text-gray-400 mt-1">Rådata och grafer kommer snart.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Collaboration</h3>
              <CollaborationPanel 
                entityType="anomaly"
                entityId={anomaly.id}
                currentUser={currentUser}
                className="border-0 rounded-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 