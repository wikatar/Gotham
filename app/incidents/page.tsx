'use client'

import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import IncidentReportModal from '../components/incidents/IncidentReportModal'
import IncidentDetailModal from '../components/incidents/IncidentDetailModal'

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
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    sourceType: '',
    tags: ''
  })

  // Load incidents
  useEffect(() => {
    loadIncidents()
  }, [filters])

  const loadIncidents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ accountId: 'default' })
      
      if (filters.status) params.append('status', filters.status)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.tags) params.append('tags', filters.tags)

      const response = await fetch(`/api/incidents/list?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setIncidents(data.incidents)
      }
    } catch (error) {
      console.error('Error loading incidents:', error)
    } finally {
      setLoading(false)
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

  const filteredIncidents = incidents.filter(incident => {
    if (filters.sourceType && incident.sourceType !== filters.sourceType) return false
    return true
  })

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
    critical: incidents.filter(i => i.severity === 'critical').length
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Incident Reports</h1>
            <p className="text-text-secondary">Monitor and manage system incidents and escalations</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            📑 Create Incident
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card title="Total Incidents" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Total</div>
          <div className="text-3xl font-bold text-primary">{stats.total}</div>
        </Card>
        
        <Card title="Open" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Open</div>
          <div className="text-3xl font-bold text-gray-600">{stats.open}</div>
        </Card>
        
        <Card title="Investigating" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Investigating</div>
          <div className="text-3xl font-bold text-orange-500">{stats.investigating}</div>
        </Card>
        
        <Card title="Resolved" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Resolved</div>
          <div className="text-3xl font-bold text-green-500">{stats.resolved}</div>
        </Card>
        
        <Card title="Critical" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Critical</div>
          <div className="text-3xl font-bold text-red-500">{stats.critical}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card title="Filters" className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Source Type</label>
              <select
                value={filters.sourceType}
                onChange={(e) => setFilters({ ...filters, sourceType: e.target.value })}
                className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              >
                <option value="">All Sources</option>
                <option value="agent">Agent</option>
                <option value="anomaly">Anomaly</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                placeholder="Enter tags..."
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      <Card title="Incident Reports">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-text-secondary">Loading incidents...</div>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-text-secondary mb-4">No incidents found</div>
              <Button onClick={() => setShowCreateModal(true)}>
                Create First Incident
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border border-secondary/20 rounded-lg p-4 hover:bg-secondary/5 cursor-pointer"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{getSourceTypeIcon(incident.sourceType)}</span>
                        <h3 className="font-medium text-lg">{incident.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </span>
                      </div>
                      
                      {incident.description && (
                        <p className="text-text-secondary text-sm mb-2">{incident.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                        {incident.createdBy && <span>By: {incident.createdBy}</span>}
                        {incident.sourceId && (
                          <span className="bg-secondary/10 px-2 py-1 rounded">
                            {incident.sourceType}: {incident.sourceId.slice(-8)}
                          </span>
                        )}
                      </div>
                      
                      {incident.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {incident.tags.map((tag, index) => (
                            <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-text-secondary text-xs">
                      Updated: {new Date(incident.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <IncidentReportModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadIncidents()
          }}
        />
      )}

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={() => {
            setSelectedIncident(null)
            loadIncidents()
          }}
        />
      )}
    </AppLayout>
  )
} 