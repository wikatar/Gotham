import { useState } from 'react'

export type IncidentData = {
  title: string
  description: string
  sourceType: 'agent' | 'anomaly' | 'manual'
  sourceId?: string
  missionId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  createdBy?: string
}

export type CreateIncidentResponse = {
  id: string
  title: string
  description: string
  sourceType: string
  sourceId?: string
  missionId?: string
  status: string
  severity: string
  tags: string
  createdBy?: string
  readToken: string
  createdAt: string
  updatedAt: string
  mission?: any
  anomaly?: any
}

export const useIncidentCreation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createIncident = async (data: IncidentData): Promise<CreateIncidentResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/incidents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          tags: data.tags.join(','), // Convert array to comma-separated string
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create incident')
      }

      const incident = await response.json()
      return incident
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error creating incident:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const createAgentIncident = async (agentExecutionId: string, agentName?: string, prompt?: string) => {
    return createIncident({
      title: `Agent Alert: ${agentName || 'Unknown Agent'}`,
      description: prompt ? `Agent execution that may require attention:\n\n"${prompt}"` : 'Agent execution flagged for review',
      sourceType: 'agent',
      sourceId: agentExecutionId,
      severity: 'medium',
      tags: ['agent', 'escalation']
    })
  }

  const createAnomalyIncident = async (anomalyId: string, anomalyType?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => {
    return createIncident({
      title: `Anomaly Detected: ${anomalyType || 'Unknown Type'}`,
      description: 'Anomaly detection system flagged this event for investigation',
      sourceType: 'anomaly',
      sourceId: anomalyId,
      severity: severity || 'high',
      tags: ['anomaly', 'detection']
    })
  }

  return {
    createIncident,
    createAgentIncident,
    createAnomalyIncident,
    isLoading,
    error
  }
} 