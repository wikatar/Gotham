'use client'

import { useState } from 'react'
import Button from '../ui/Button'

interface IncidentReportModalProps {
  onClose: () => void
  onSuccess: () => void
  prefillData?: {
    title?: string
    description?: string
    sourceType?: 'agent' | 'anomaly' | 'manual'
    sourceId?: string
    missionId?: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    tags?: string[]
  }
}

export default function IncidentReportModal({ 
  onClose, 
  onSuccess, 
  prefillData 
}: IncidentReportModalProps) {
  const [formData, setFormData] = useState({
    title: prefillData?.title || '',
    description: prefillData?.description || '',
    sourceType: prefillData?.sourceType || 'manual',
    sourceId: prefillData?.sourceId || '',
    missionId: prefillData?.missionId || '',
    severity: prefillData?.severity || 'medium',
    tags: prefillData?.tags?.join(', ') || '',
    createdBy: 'current-user@example.com' // TODO: Get from auth context
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        accountId: 'default' // TODO: Get from context
      }

      const response = await fetch('/api/incidents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to create incident report')
      }
    } catch (error) {
      setError('Network error: Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-paper rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-secondary/20">
          <h2 className="text-xl font-semibold">Create Incident Report</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              placeholder="Detailed description of the incident, impact, and context"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Source Type *</label>
              <select
                required
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value as any })}
                className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              >
                <option value="manual">Manual Report</option>
                <option value="agent">Agent Escalation</option>
                <option value="anomaly">Anomaly Detection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Severity *</label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {formData.sourceType !== 'manual' && (
            <div>
              <label className="block text-sm font-medium mb-2">Source ID</label>
              <input
                type="text"
                value={formData.sourceId}
                onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
                className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
                placeholder="Agent execution ID or Anomaly ID"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Mission ID</label>
            <input
              type="text"
              value={formData.missionId}
              onChange={(e) => setFormData({ ...formData, missionId: e.target.value })}
              className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              placeholder="Related mission ID (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full p-3 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              placeholder="Enter tags separated by commas (e.g., churn, sales, critical)"
            />
            <div className="text-xs text-text-secondary mt-1">
              Separate multiple tags with commas
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title}
            >
              {loading ? 'Creating...' : 'Create Incident'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 