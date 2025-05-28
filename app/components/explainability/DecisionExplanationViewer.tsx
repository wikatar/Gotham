'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { LineageModal } from '../lineage/LineageModal'

interface DecisionExplanation {
  id: string
  title: string
  description?: string
  decisionType: string
  outcome: string
  confidence: number
  agentId?: string
  missionId?: string
  lineageId?: string
  entityType?: string
  entityId?: string
  inputData: string
  reasoning?: string
  alternatives?: string
  impactLevel: string
  status: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  mission?: {
    id: string
    name: string
  }
  lineage?: {
    id: string
    step: string
    source?: string
  }
}

interface DecisionExplanationViewerProps {
  missionId?: string
  agentId?: string
  entityId?: string
  entityType?: string
  limit?: number
}

export default function DecisionExplanationViewer({
  missionId,
  agentId,
  entityId,
  entityType,
  limit = 10
}: DecisionExplanationViewerProps) {
  const [decisions, setDecisions] = useState<DecisionExplanation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDecision, setSelectedDecision] = useState<DecisionExplanation | null>(null)
  const [showLineageModal, setShowLineageModal] = useState(false)
  const [filter, setFilter] = useState({
    decisionType: '',
    status: '',
    impactLevel: ''
  })

  useEffect(() => {
    fetchDecisions()
  }, [missionId, agentId, filter])

  const fetchDecisions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (missionId) params.append('missionId', missionId)
      if (agentId) params.append('agentId', agentId)
      if (filter.decisionType) params.append('decisionType', filter.decisionType)
      if (filter.status) params.append('status', filter.status)
      params.append('limit', limit.toString())

      const response = await fetch(`/api/decisions?${params}`)
      const data = await response.json()

      if (response.ok) {
        // Filter by entity if specified
        let filteredDecisions = data.decisions
        if (entityId && entityType) {
          filteredDecisions = data.decisions.filter((d: DecisionExplanation) => 
            d.entityId === entityId && d.entityType === entityType
          )
        }
        setDecisions(filteredDecisions)
      } else {
        console.error('Failed to fetch decisions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching decisions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDecisionTypeColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'bg-blue-100 text-blue-800'
      case 'classification': return 'bg-green-100 text-green-800'
      case 'anomaly_detection': return 'bg-red-100 text-red-800'
      case 'recommendation': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'implemented': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExplainDecision = (decision: DecisionExplanation) => {
    setSelectedDecision(decision)
    if (decision.lineageId) {
      setShowLineageModal(true)
    }
  }

  const parseJsonSafely = (jsonString: string) => {
    try {
      return JSON.parse(jsonString)
    } catch {
      return jsonString
    }
  }

  if (loading) {
    return (
      <Card title="Beslut & Förklaringar">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card title="Beslut & Förklaringar">
        <div className="p-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select
              value={filter.decisionType}
              onChange={(e) => setFilter({ ...filter, decisionType: e.target.value })}
              className="px-3 py-2 border border-secondary/30 rounded-md text-sm"
            >
              <option value="">Alla beslutstyper</option>
              <option value="prediction">Prediktion</option>
              <option value="classification">Klassificering</option>
              <option value="anomaly_detection">Anomali-detektion</option>
              <option value="recommendation">Rekommendation</option>
            </select>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 border border-secondary/30 rounded-md text-sm"
            >
              <option value="">Alla statusar</option>
              <option value="pending">Väntande</option>
              <option value="approved">Godkänd</option>
              <option value="implemented">Implementerad</option>
              <option value="rejected">Avvisad</option>
            </select>
          </div>

          {/* Decisions List */}
          {decisions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤔</div>
              <h3 className="text-lg font-medium mb-2">Inga beslut hittades</h3>
              <p className="text-text-secondary">
                {entityId 
                  ? 'Inga AI-beslut har loggats för denna entitet än.'
                  : 'Inga AI-beslut matchar dina filter.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {decisions.map((decision) => (
                <div key={decision.id} className="border border-secondary/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{decision.title}</h3>
                      {decision.description && (
                        <p className="text-text-secondary text-sm mt-1">{decision.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDecisionTypeColor(decision.decisionType)}`}>
                        {decision.decisionType}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactLevelColor(decision.impactLevel)}`}>
                        {decision.impactLevel} påverkan
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-background-elevated p-3 rounded-md">
                      <div className="text-xs text-text-secondary mb-1">Resultat</div>
                      <div className="font-medium">{decision.outcome}</div>
                    </div>
                    <div className="bg-background-elevated p-3 rounded-md">
                      <div className="text-xs text-text-secondary mb-1">Säkerhet</div>
                      <div className="font-medium">{(decision.confidence * 100).toFixed(1)}%</div>
                    </div>
                    <div className="bg-background-elevated p-3 rounded-md">
                      <div className="text-xs text-text-secondary mb-1">Status</div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(decision.status)}`}>
                        {decision.status}
                      </div>
                    </div>
                  </div>

                  {decision.reasoning && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Resonemang:</div>
                      <div className="text-sm text-text-secondary bg-background-elevated p-3 rounded-md">
                        {decision.reasoning}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-text-secondary">
                      {decision.agentId && <span>Agent: {decision.agentId}</span>}
                      {decision.mission && <span className="ml-4">Mission: {decision.mission.name}</span>}
                      <span className="ml-4">{new Date(decision.createdAt).toLocaleString('sv-SE')}</span>
                    </div>
                    <div className="flex gap-2">
                      {decision.lineageId && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleExplainDecision(decision)}
                        >
                          Förklara beslut
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedDecision(decision)}
                      >
                        Visa detaljer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Decision Details Modal */}
      {selectedDecision && !showLineageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-paper rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-secondary/20">
              <h2 className="text-xl font-semibold">{selectedDecision.title}</h2>
              <button
                onClick={() => setSelectedDecision(null)}
                className="text-text-secondary hover:text-text-primary text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Input Data */}
              <div>
                <h3 className="font-medium mb-2">Input Data</h3>
                <div className="bg-background-elevated p-3 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{JSON.stringify(parseJsonSafely(selectedDecision.inputData), null, 2)}</pre>
                </div>
              </div>

              {/* Alternatives */}
              {selectedDecision.alternatives && (
                <div>
                  <h3 className="font-medium mb-2">Alternativa beslut</h3>
                  <div className="bg-background-elevated p-3 rounded-md">
                    <pre className="text-sm">{JSON.stringify(parseJsonSafely(selectedDecision.alternatives), null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                {selectedDecision.lineageId && (
                  <Button
                    variant="primary"
                    onClick={() => setShowLineageModal(true)}
                  >
                    Visa fullständig kedja
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setSelectedDecision(null)}
                >
                  Stäng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lineage Modal */}
      {showLineageModal && selectedDecision?.lineageId && (
        <LineageModal
          isOpen={showLineageModal}
          onClose={() => {
            setShowLineageModal(false)
            setSelectedDecision(null)
          }}
          title={`Lineage för: ${selectedDecision.title}`}
          lineageId={selectedDecision.lineageId}
          missionId={selectedDecision.missionId}
          agentId={selectedDecision.agentId}
        />
      )}
    </>
  )
} 