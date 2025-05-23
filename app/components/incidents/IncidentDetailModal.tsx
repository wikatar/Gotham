'use client'

import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import { CollaborationPanel } from '../collaboration'
import { ActivityLogger, logActivity } from '@/app/utils/activityLogger'

interface IncidentReport {
  id: string
  title: string
  description?: string
  sourceType: 'agent' | 'anomaly' | 'manual'
  sourceId?: string
  missionId?: string
  status: 'open' | 'investigating' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  createdBy?: string
  createdAt: string
  updatedAt: string
  readToken?: string
}

interface IncidentDetailModalProps {
  incident: IncidentReport
  onClose: () => void
  onUpdate: () => void
}

export default function IncidentDetailModal({ 
  incident, 
  onClose, 
  onUpdate 
}: IncidentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'source' | 'edit' | 'collaboration'>('details')
  const [sourceData, setSourceData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [editData, setEditData] = useState({
    title: incident.title,
    description: incident.description || '',
    status: incident.status,
    severity: incident.severity,
    tags: incident.tags.join(', ')
  })
  const [updating, setUpdating] = useState(false)

  // Current user (in a real app, this would come from auth context)
  const currentUser = {
    id: 'current-user',
    name: 'Current User',
    email: 'user@gotham.se'
  }

  // Load source data when showing source tab
  useEffect(() => {
    if (activeTab === 'source' && incident.sourceId && !sourceData) {
      loadSourceData()
    }
  }, [activeTab, incident.sourceId])

  const loadSourceData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/incidents/${incident.id}`)
      const data = await response.json()
      if (data.success) {
        setSourceData(data.sourceData)
      }
    } catch (error) {
      console.error('Error loading source data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const payload = {
        id: incident.id,
        ...editData,
        tags: editData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      const response = await fetch('/api/incidents/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (data.success) {
        // Log activities för ändringar
        if (editData.status !== incident.status) {
          await ActivityLogger.incidentStatusChanged(
            incident.id,
            currentUser.email,
            incident.status,
            editData.status,
            currentUser.name
          )
        }

        if (editData.severity !== incident.severity) {
          await logActivity({
            entityType: 'incident',
            entityId: incident.id,
            action: 'severity_changed',
            actor: currentUser.email,
            actorName: currentUser.name,
            description: `Ändrade allvarlighetsgrad från "${incident.severity}" till "${editData.severity}"`,
            metadata: { oldSeverity: incident.severity, newSeverity: editData.severity }
          })
        }

        if (editData.title !== incident.title || editData.description !== incident.description) {
          await logActivity({
            entityType: 'incident',
            entityId: incident.id,
            action: 'updated',
            actor: currentUser.email,
            actorName: currentUser.name,
            description: 'Uppdaterade incident-detaljer'
          })
        }

        onUpdate()
      }
    } catch (error) {
      console.error('Error updating incident:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/incidents/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: incident.id,
          status: newStatus
        })
      })

      const data = await response.json()
      if (data.success) {
        // Log status change
        await ActivityLogger.incidentStatusChanged(
          incident.id,
          currentUser.email,
          incident.status,
          newStatus,
          currentUser.name
        )

        onUpdate()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleExportPDF = () => {
    // Create a simple HTML content for PDF export
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Incident Report - ${incident.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .critical { background-color: #fee2e2; color: #991b1b; }
          .high { background-color: #fed7aa; color: #9a3412; }
          .medium { background-color: #fef3c7; color: #92400e; }
          .low { background-color: #dbeafe; color: #1e40af; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #666; }
          .tags { margin-top: 10px; }
          .tag { display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${incident.title}</h1>
          <div>
            <span class="badge ${incident.severity}">${incident.severity.toUpperCase()}</span>
            <span class="badge">${incident.status.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="label">Created:</div>
          <div>${new Date(incident.createdAt).toLocaleString()}</div>
        </div>
        
        <div class="section">
          <div class="label">Source Type:</div>
          <div>${incident.sourceType}</div>
        </div>
        
        ${incident.description ? `
        <div class="section">
          <div class="label">Description:</div>
          <div>${incident.description}</div>
        </div>
        ` : ''}
        
        ${incident.sourceId ? `
        <div class="section">
          <div class="label">Source ID:</div>
          <div>${incident.sourceId}</div>
        </div>
        ` : ''}
        
        ${incident.tags.length > 0 ? `
        <div class="section">
          <div class="label">Tags:</div>
          <div class="tags">
            ${incident.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        
        ${sourceData ? `
        <div class="section">
          <div class="label">Source Data:</div>
          <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-wrap: break-word; white-space: pre-wrap;">${JSON.stringify(sourceData, null, 2)}</pre>
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          Generated by Monolith Analytics • ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `
    
    // Create a new window and print
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
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
      case 'open': return 'text-gray-600 bg-gray-100'
      case 'investigating': return 'text-orange-600 bg-orange-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'agent': return '🤖'
      case 'anomaly': return '🚨'
      case 'manual': return '📝'
      default: return '❓'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-paper rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-secondary/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getSourceTypeIcon(incident.sourceType)}</span>
            <div>
              <h2 className="text-xl font-semibold">{incident.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                  {incident.severity.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                  {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl"
          >
            ×
          </button>
        </div>

        {/* Status Actions */}
        <div className="p-6 border-b border-secondary/20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Quick Actions:</span>
            {incident.status === 'open' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('investigating')}
                disabled={updating}
              >
                🔍 Start Investigation
              </Button>
            )}
            {incident.status !== 'resolved' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleStatusChange('resolved')}
                disabled={updating}
              >
                ✅ Mark as Resolved
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const shareUrl = `${window.location.origin}/incidents/public/${incident.readToken || incident.id}`
                navigator.clipboard.writeText(shareUrl)
                alert('Share link copied to clipboard!')
              }}
            >
              🔗 Share
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportPDF}
            >
              📄 Export PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary/20">
          {['details', 'source', 'edit', 'collaboration'].map(tab => (
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
              {tab === 'source' && '🔍 Source Data'}
              {tab === 'edit' && '✏️ Edit'}
              {tab === 'collaboration' && '🤝 Collaboration'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Incident Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Created</label>
                    <div>{new Date(incident.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Last Updated</label>
                    <div>{new Date(incident.updatedAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Created By</label>
                    <div>{incident.createdBy || 'System'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Source Type</label>
                    <div className="flex items-center gap-2">
                      <span>{getSourceTypeIcon(incident.sourceType)}</span>
                      <span className="capitalize">{incident.sourceType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {incident.description && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Description</h3>
                  <div className="bg-secondary/5 p-4 rounded-lg">
                    {incident.description}
                  </div>
                </div>
              )}

              {incident.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {incident.tags.map((tag, index) => (
                      <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {incident.sourceId && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Source Reference</h3>
                  <div className="bg-secondary/5 p-4 rounded-lg">
                    <div className="text-sm text-text-secondary">Source ID:</div>
                    <div className="font-mono text-sm">{incident.sourceId}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'source' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Source Data</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-text-secondary">Loading source data...</div>
                </div>
              ) : sourceData ? (
                <div className="bg-secondary/5 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(sourceData, null, 2)}
                  </pre>
                </div>
              ) : incident.sourceType === 'manual' ? (
                <div className="text-center py-8 text-text-secondary">
                  This is a manual report with no source data
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No source data available
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-3">Edit Incident</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={4}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as any })}
                    className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Severity</label>
                  <select
                    value={editData.severity}
                    onChange={(e) => setEditData({ ...editData, severity: e.target.value as any })}
                    className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('details')}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updating || !editData.title}
                >
                  {updating ? 'Updating...' : 'Update Incident'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'collaboration' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Collaboration</h3>
              <CollaborationPanel 
                entityType="incident"
                entityId={incident.id}
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