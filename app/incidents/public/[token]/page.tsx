'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Card from '../../../components/ui/Card'

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

export default function PublicIncidentPage() {
  const params = useParams()
  const token = params.token as string
  const [incident, setIncident] = useState<IncidentReport | null>(null)
  const [sourceData, setSourceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      loadIncident()
    }
  }, [token])

  const loadIncident = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/incidents/public/${token}`)
      const data = await response.json()
      
      if (data.success) {
        setIncident(data.incident)
        setSourceData(data.sourceData)
      } else {
        setError(data.error || 'Incident not found')
      }
    } catch (error) {
      setError('Failed to load incident')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading incident report...</div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">{getSourceTypeIcon(incident.sourceType)}</span>
            <h1 className="text-3xl font-bold">{incident.title}</h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(incident.severity)}`}>
              {incident.severity.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(incident.status)}`}>
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </span>
          </div>
          <div className="text-gray-500 text-sm mt-2">
            Public Incident Report • Read Only
          </div>
        </div>

        {/* Incident Details */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Incident Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <div>{new Date(incident.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <div>{new Date(incident.updatedAt).toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created By</label>
                <div>{incident.createdBy || 'System'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Source Type</label>
                <div className="flex items-center gap-2">
                  <span>{getSourceTypeIcon(incident.sourceType)}</span>
                  <span className="capitalize">{incident.sourceType}</span>
                </div>
              </div>
            </div>

            {incident.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {incident.description}
                </div>
              </div>
            )}

            {incident.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {incident.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {incident.sourceId && (
              <div>
                <h3 className="text-lg font-medium mb-3">Source Reference</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Source ID:</div>
                  <div className="font-mono text-sm">{incident.sourceId}</div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Source Data */}
        {sourceData && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Source Data</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(sourceData, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <div>This is a read-only view of an incident report</div>
          <div className="mt-2">
            Powered by Monolith Analytics
          </div>
        </div>
      </div>
    </div>
  )
} 