'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { LogicRule, ACTIONS, OPERATORS } from '../../types/logic'

interface LogicRulesListProps {
  entityType?: string
  entityId?: string
  onEdit?: (rule: LogicRule) => void
  onCreateNew?: () => void
}

export default function LogicRulesList({
  entityType,
  entityId,
  onEdit,
  onCreateNew
}: LogicRulesListProps) {
  const [rules, setRules] = useState<LogicRule[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    entityType: entityType || '',
    isActive: 'all'
  })

  useEffect(() => {
    fetchRules()
  }, [filter, entityType, entityId])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filter.entityType) params.append('entityType', filter.entityType)
      if (entityId) params.append('entityId', entityId)
      if (filter.isActive !== 'all') params.append('isActive', filter.isActive)

      const response = await fetch(`/api/logic-rules?${params}`)
      const data = await response.json()

      if (response.ok) {
        setRules(data.rules)
      } else {
        console.error('Failed to fetch rules:', data.error)
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/logic-rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        setRules(prev => prev.map(rule => 
          rule.id === ruleId ? { ...rule, isActive } : rule
        ))
      }
    } catch (error) {
      console.error('Error updating rule status:', error)
    }
  }

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna regel?')) return

    try {
      const response = await fetch(`/api/logic-rules/${ruleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRules(prev => prev.filter(rule => rule.id !== ruleId))
      }
    } catch (error) {
      console.error('Error deleting rule:', error)
    }
  }

  const formatConditions = (conditions: any[]) => {
    return conditions.map((condition, index) => {
      const operator = OPERATORS[condition.operator]?.label || condition.operator
      return `${condition.field} ${operator} ${condition.value}`
    }).join(' OCH ')
  }

  const formatActions = (actions: any[]) => {
    return actions.map(action => {
      const actionDef = ACTIONS[action.type]
      return actionDef?.label || action.type
    }).join(', ')
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'bg-red-100 text-red-800'
    if (priority >= 50) return 'bg-orange-100 text-orange-800'
    if (priority >= 20) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  if (loading) {
    return (
      <Card title="Logiska Regler">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Logiska Regler">
      <div className="p-4">
        {/* Header with filters and create button */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filter.entityType}
              onChange={(e) => setFilter({ ...filter, entityType: e.target.value })}
              className="px-3 py-2 border border-secondary/30 rounded-md text-sm"
            >
              <option value="">Alla entitetstyper</option>
              <option value="mission">Mission</option>
              <option value="incident">Incident</option>
              <option value="anomaly">Anomali</option>
              <option value="customer">Kund</option>
              <option value="pipeline">Pipeline</option>
            </select>

            <select
              value={filter.isActive}
              onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
              className="px-3 py-2 border border-secondary/30 rounded-md text-sm"
            >
              <option value="all">Alla regler</option>
              <option value="true">Aktiva</option>
              <option value="false">Inaktiva</option>
            </select>
          </div>

          {onCreateNew && (
            <Button variant="primary" onClick={onCreateNew}>
              Skapa Ny Regel
            </Button>
          )}
        </div>

        {/* Rules List */}
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium mb-2">Inga regler hittades</h3>
            <p className="text-text-secondary mb-4">
              {filter.entityType || filter.isActive !== 'all' 
                ? 'Inga regler matchar dina filter.'
                : 'Inga logiska regler har skapats än.'
              }
            </p>
            {onCreateNew && (
              <Button variant="primary" onClick={onCreateNew}>
                Skapa Din Första Regel
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border border-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{rule.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rule.priority)}`}>
                        Prioritet {rule.priority}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Aktiv' : 'Inaktiv'}
                      </div>
                      {rule.entityType && (
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {rule.entityType}
                        </div>
                      )}
                    </div>
                    {rule.description && (
                      <p className="text-text-secondary text-sm mb-3">{rule.description}</p>
                    )}
                  </div>
                </div>

                {/* Rule Logic Display */}
                <div className="bg-background-elevated p-3 rounded-md mb-4">
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="font-medium text-blue-600">OM:</span>
                      <span className="ml-2">{formatConditions(rule.conditions)}</span>
                      {rule.conditions.length > 1 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {rule.logicType}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-green-600">DÅ:</span>
                      <span className="ml-2">{formatActions(rule.actions)}</span>
                    </div>
                  </div>
                </div>

                {/* Rule Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Villkor:</span>
                    <span className="ml-2 font-medium">{rule.conditions.length}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Åtgärder:</span>
                    <span className="ml-2 font-medium">{rule.actions.length}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Skapad:</span>
                    <span className="ml-2 font-medium">
                      {new Date(rule.createdAt).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-text-secondary">
                    {rule.createdBy && <span>Skapad av: {rule.createdBy}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleRuleStatus(rule.id, !rule.isActive)}
                    >
                      {rule.isActive ? 'Inaktivera' : 'Aktivera'}
                    </Button>
                    {onEdit && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(rule)}
                      >
                        Redigera
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Ta bort
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
} 