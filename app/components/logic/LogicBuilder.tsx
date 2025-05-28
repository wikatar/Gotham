'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { 
  LogicRule, 
  LogicCondition, 
  LogicAction, 
  ENTITY_FIELDS, 
  OPERATORS, 
  ACTIONS,
  LogicOperator,
  ActionType,
  FieldDefinition
} from '../../types/logic'

interface LogicBuilderProps {
  entityType?: string
  entityId?: string
  onSave?: (rule: LogicRule) => void
  onCancel?: () => void
  initialRule?: Partial<LogicRule>
  mode?: 'create' | 'edit'
}

export default function LogicBuilder({
  entityType,
  entityId,
  onSave,
  onCancel,
  initialRule,
  mode = 'create'
}: LogicBuilderProps) {
  const [rule, setRule] = useState<Partial<LogicRule>>({
    name: '',
    description: '',
    entityType: entityType || '',
    entityId: entityId || '',
    conditions: [{ field: '', operator: 'equals' as LogicOperator, value: '' }],
    actions: [{ type: 'log_event' as ActionType, parameters: {} }],
    logicType: 'AND',
    isActive: true,
    priority: 0,
    ...initialRule
  })

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get available fields for the selected entity type
  const availableFields = rule.entityType ? ENTITY_FIELDS[rule.entityType] || [] : []

  const addCondition = () => {
    setRule(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        { field: '', operator: 'equals' as LogicOperator, value: '' }
      ]
    }))
  }

  const removeCondition = (index: number) => {
    setRule(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || []
    }))
  }

  const updateCondition = (index: number, updates: Partial<LogicCondition>) => {
    setRule(prev => ({
      ...prev,
      conditions: prev.conditions?.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      ) || []
    }))
  }

  const addAction = () => {
    setRule(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        { type: 'log_event' as ActionType, parameters: {} }
      ]
    }))
  }

  const removeAction = (index: number) => {
    setRule(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }))
  }

  const updateAction = (index: number, updates: Partial<LogicAction>) => {
    setRule(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      ) || []
    }))
  }

  const validateRule = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!rule.name?.trim()) {
      newErrors.name = 'Regelnamn krävs'
    }

    if (!rule.conditions?.length) {
      newErrors.conditions = 'Minst ett villkor krävs'
    }

    if (!rule.actions?.length) {
      newErrors.actions = 'Minst en åtgärd krävs'
    }

    // Validate each condition
    rule.conditions?.forEach((condition, index) => {
      if (!condition.field) {
        newErrors[`condition_${index}_field`] = 'Fält krävs'
      }
      if (!condition.operator) {
        newErrors[`condition_${index}_operator`] = 'Operator krävs'
      }
      const operatorDef = OPERATORS[condition.operator]
      if (operatorDef?.requiresValue && (condition.value === '' || condition.value === null || condition.value === undefined)) {
        newErrors[`condition_${index}_value`] = 'Värde krävs'
      }
    })

    // Validate each action
    rule.actions?.forEach((action, index) => {
      if (!action.type) {
        newErrors[`action_${index}_type`] = 'Åtgärdstyp krävs'
      }
      
      const actionDef = ACTIONS[action.type]
      if (actionDef) {
        actionDef.requiredParams.forEach(param => {
          if (!action.parameters?.[param]) {
            newErrors[`action_${index}_${param}`] = `${param} krävs`
          }
        })
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateRule()) return

    setSaving(true)
    try {
      const response = await fetch('/api/logic-rules', {
        method: mode === 'edit' && rule.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rule,
          createdBy: 'current-user@gotham.se' // In real app, get from auth
        })
      })

      if (response.ok) {
        const savedRule = await response.json()
        onSave?.(savedRule)
      } else {
        const error = await response.json()
        setErrors({ general: error.error || 'Fel vid sparande av regel' })
      }
    } catch (error) {
      setErrors({ general: 'Nätverksfel vid sparande' })
    } finally {
      setSaving(false)
    }
  }

  const getFieldType = (fieldName: string): string => {
    const field = availableFields.find(f => f.name === fieldName)
    return field?.type || 'string'
  }

  const getAvailableOperators = (fieldType: string): LogicOperator[] => {
    return Object.entries(OPERATORS)
      .filter(([_, def]) => def.supportedTypes.includes(fieldType))
      .map(([op, _]) => op as LogicOperator)
  }

  const renderCondition = (condition: LogicCondition, index: number) => {
    const fieldType = getFieldType(condition.field)
    const availableOperators = getAvailableOperators(fieldType)
    const selectedField = availableFields.find(f => f.name === condition.field)
    const operatorDef = OPERATORS[condition.operator]

    return (
      <div key={index} className="border border-secondary/20 rounded-lg p-4 bg-background-elevated">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-medium">Villkor {index + 1}</h4>
          {rule.conditions && rule.conditions.length > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => removeCondition(index)}
              className="text-red-600 hover:text-red-700"
            >
              Ta bort
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Fält</label>
            <select
              value={condition.field}
              onChange={(e) => updateCondition(index, { 
                field: e.target.value,
                operator: 'equals' as LogicOperator,
                value: ''
              })}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors[`condition_${index}_field`] ? 'border-red-500' : 'border-secondary/30'
              }`}
            >
              <option value="">Välj fält</option>
              {availableFields.map(field => (
                <option key={field.name} value={field.name}>
                  {field.label}
                </option>
              ))}
            </select>
            {errors[`condition_${index}_field`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`condition_${index}_field`]}</p>
            )}
          </div>

          {/* Operator Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Operator</label>
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(index, { 
                operator: e.target.value as LogicOperator,
                value: operatorDef?.requiresValue ? condition.value : ''
              })}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors[`condition_${index}_operator`] ? 'border-red-500' : 'border-secondary/30'
              }`}
              disabled={!condition.field}
            >
              {availableOperators.map(op => (
                <option key={op} value={op}>
                  {OPERATORS[op].label}
                </option>
              ))}
            </select>
            {errors[`condition_${index}_operator`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`condition_${index}_operator`]}</p>
            )}
          </div>

          {/* Value Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Värde</label>
            {operatorDef?.requiresValue ? (
              selectedField?.type === 'select' ? (
                <select
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors[`condition_${index}_value`] ? 'border-red-500' : 'border-secondary/30'
                  }`}
                >
                  <option value="">Välj värde</option>
                  {selectedField.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : selectedField?.type === 'boolean' ? (
                <select
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value === 'true' })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors[`condition_${index}_value`] ? 'border-red-500' : 'border-secondary/30'
                  }`}
                >
                  <option value="">Välj värde</option>
                  <option value="true">Sant</option>
                  <option value="false">Falskt</option>
                </select>
              ) : (
                <input
                  type={selectedField?.type === 'number' ? 'number' : selectedField?.type === 'date' ? 'date' : 'text'}
                  value={condition.value}
                  onChange={(e) => updateCondition(index, { 
                    value: selectedField?.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value 
                  })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors[`condition_${index}_value`] ? 'border-red-500' : 'border-secondary/30'
                  }`}
                  placeholder="Ange värde"
                />
              )
            ) : (
              <div className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-500">
                Inget värde krävs
              </div>
            )}
            {errors[`condition_${index}_value`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`condition_${index}_value`]}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderAction = (action: LogicAction, index: number) => {
    const actionDef = ACTIONS[action.type]

    return (
      <div key={index} className="border border-secondary/20 rounded-lg p-4 bg-background-elevated">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-medium">Åtgärd {index + 1}</h4>
          {rule.actions && rule.actions.length > 1 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => removeAction(index)}
              className="text-red-600 hover:text-red-700"
            >
              Ta bort
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Action Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Åtgärdstyp</label>
            <select
              value={action.type}
              onChange={(e) => updateAction(index, { 
                type: e.target.value as ActionType,
                parameters: {}
              })}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors[`action_${index}_type`] ? 'border-red-500' : 'border-secondary/30'
              }`}
            >
              {Object.entries(ACTIONS).map(([type, def]) => (
                <option key={type} value={type}>
                  {def.label}
                </option>
              ))}
            </select>
            {actionDef && (
              <p className="text-xs text-text-secondary mt-1">{actionDef.description}</p>
            )}
            {errors[`action_${index}_type`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`action_${index}_type`]}</p>
            )}
          </div>

          {/* Action Parameters */}
          {actionDef && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionDef.requiredParams.map(param => (
                <div key={param}>
                  <label className="block text-sm font-medium mb-1">
                    {param} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={action.parameters?.[param] || ''}
                    onChange={(e) => updateAction(index, {
                      parameters: {
                        ...action.parameters,
                        [param]: e.target.value
                      }
                    })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors[`action_${index}_${param}`] ? 'border-red-500' : 'border-secondary/30'
                    }`}
                    placeholder={`Ange ${param}`}
                  />
                  {errors[`action_${index}_${param}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`action_${index}_${param}`]}</p>
                  )}
                </div>
              ))}
              
              {actionDef.optionalParams.map(param => (
                <div key={param}>
                  <label className="block text-sm font-medium mb-1">{param}</label>
                  <input
                    type="text"
                    value={action.parameters?.[param] || ''}
                    onChange={(e) => updateAction(index, {
                      parameters: {
                        ...action.parameters,
                        [param]: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-secondary/30 rounded-md text-sm"
                    placeholder={`Ange ${param} (valfritt)`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card title={mode === 'edit' ? 'Redigera Regel' : 'Skapa Ny Regel'}>
      <div className="p-6 space-y-6">
        {/* General Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Regelnamn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={rule.name}
              onChange={(e) => setRule(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-secondary/30'
              }`}
              placeholder="T.ex. Hög riskpoäng alert"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Entitetstyp</label>
            <select
              value={rule.entityType}
              onChange={(e) => setRule(prev => ({ 
                ...prev, 
                entityType: e.target.value,
                conditions: [{ field: '', operator: 'equals' as LogicOperator, value: '' }]
              }))}
              className="w-full px-3 py-2 border border-secondary/30 rounded-md"
            >
              <option value="">Alla entiteter</option>
              {Object.keys(ENTITY_FIELDS).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Beskrivning</label>
          <textarea
            value={rule.description}
            onChange={(e) => setRule(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-secondary/30 rounded-md"
            rows={2}
            placeholder="Beskriv vad denna regel gör..."
          />
        </div>

        {/* Logic Type */}
        {rule.conditions && rule.conditions.length > 1 && (
          <div>
            <label className="block text-sm font-medium mb-2">Logiktyp</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="AND"
                  checked={rule.logicType === 'AND'}
                  onChange={(e) => setRule(prev => ({ ...prev, logicType: e.target.value as 'AND' | 'OR' }))}
                  className="mr-2"
                />
                AND (alla villkor måste uppfyllas)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="OR"
                  checked={rule.logicType === 'OR'}
                  onChange={(e) => setRule(prev => ({ ...prev, logicType: e.target.value as 'AND' | 'OR' }))}
                  className="mr-2"
                />
                OR (minst ett villkor måste uppfyllas)
              </label>
            </div>
          </div>
        )}

        {/* Conditions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Villkor (IF)</h3>
            <Button variant="secondary" size="sm" onClick={addCondition}>
              Lägg till villkor
            </Button>
          </div>
          
          {errors.conditions && (
            <p className="text-red-500 text-sm mb-4">{errors.conditions}</p>
          )}

          <div className="space-y-4">
            {rule.conditions?.map((condition, index) => renderCondition(condition, index))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Åtgärder (THEN)</h3>
            <Button variant="secondary" size="sm" onClick={addAction}>
              Lägg till åtgärd
            </Button>
          </div>
          
          {errors.actions && (
            <p className="text-red-500 text-sm mb-4">{errors.actions}</p>
          )}

          <div className="space-y-4">
            {rule.actions?.map((action, index) => renderAction(action, index))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Prioritet</label>
            <input
              type="number"
              value={rule.priority}
              onChange={(e) => setRule(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-secondary/30 rounded-md"
              min="0"
              max="100"
            />
            <p className="text-xs text-text-secondary mt-1">Högre nummer = högre prioritet</p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rule.isActive}
                onChange={(e) => setRule(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              Regel aktiv
            </label>
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-secondary/20">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Avbryt
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Sparar...' : mode === 'edit' ? 'Uppdatera Regel' : 'Skapa Regel'}
          </Button>
        </div>
      </div>
    </Card>
  )
} 