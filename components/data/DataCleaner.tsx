'use client'

import { useState, useEffect } from 'react'
import Card from '../../app/components/ui/Card'
import Button from '../../app/components/ui/Button'
import { Play, Save, Trash2, Plus, Settings } from 'lucide-react'

// Simple toast function
const toast = ({ title, description, variant }: { 
  title: string; 
  description: string; 
  variant?: string;
}) => {
  console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`)
  // In a real app, this would show a proper toast notification
}

interface DataCleanerProps {
  sourceId: string
}

interface CleaningStep {
  id: string
  type: string
  field: string
  operation: string
  value?: string
  enabled: boolean
}

export default function DataCleaner({ sourceId }: DataCleanerProps) {
  const [steps, setSteps] = useState<CleaningStep[]>([])
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [sourceInfo, setSourceInfo] = useState<any>(null)
  const [availableFields, setAvailableFields] = useState<string[]>([])

  // Fetch source info and available fields
  useEffect(() => {
    const fetchSourceInfo = async () => {
      try {
        const response = await fetch(`/api/data/source/info/${sourceId}`)
        const data = await response.json()
        
        if (data.source) {
          setSourceInfo(data.source)
          setAvailableFields(data.source.fields || [])
        }
      } catch (error) {
        console.error('Error fetching source info:', error)
      }
    }

    fetchSourceInfo()
  }, [sourceId])

  const addStep = () => {
    const newStep: CleaningStep = {
      id: Date.now().toString(),
      type: 'transform',
      field: availableFields[0] || '',
      operation: 'remove_nulls',
      enabled: true
    }
    setSteps([...steps, newStep])
  }

  const updateStep = (id: string, updates: Partial<CleaningStep>) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ))
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id))
  }

  const executeSteps = async () => {
    if (steps.length === 0) {
      toast({
        title: 'No steps to execute',
        description: 'Please add at least one cleaning step',
        variant: 'destructive'
      })
      return
    }

    setExecuting(true)
    
    try {
      const response = await fetch('/api/data/cleaning/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          steps: steps.filter(step => step.enabled)
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Cleaning completed',
          description: `Processed ${result.recordsProcessed} records`
        })
      } else {
        throw new Error(result.message || 'Cleaning failed')
      }
    } catch (error) {
      console.error('Error executing cleaning steps:', error)
      toast({
        title: 'Cleaning failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
    
    setExecuting(false)
  }

  const savePipeline = async () => {
    if (steps.length === 0) {
      toast({
        title: 'No steps to save',
        description: 'Please add at least one cleaning step',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/data/cleaning/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          name: `Cleaning Pipeline ${Date.now()}`,
          steps
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Pipeline saved',
          description: 'Cleaning pipeline saved successfully'
        })
      } else {
        throw new Error(result.message || 'Save failed')
      }
    } catch (error) {
      console.error('Error saving pipeline:', error)
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    }
    
    setLoading(false)
  }

  const operationOptions = [
    { value: 'remove_nulls', label: 'Remove null values' },
    { value: 'fill_nulls', label: 'Fill null values' },
    { value: 'remove_duplicates', label: 'Remove duplicates' },
    { value: 'trim_whitespace', label: 'Trim whitespace' },
    { value: 'to_lowercase', label: 'Convert to lowercase' },
    { value: 'to_uppercase', label: 'Convert to uppercase' },
    { value: 'remove_special_chars', label: 'Remove special characters' },
    { value: 'standardize_format', label: 'Standardize format' }
  ]

  return (
    <Card title="Data Cleaning Pipeline">
      <div className="space-y-6">
        {/* Source Info */}
        {sourceInfo && (
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">Source: {sourceInfo.name}</h4>
            <p className="text-sm text-gray-600">
              {sourceInfo.recordCount?.toLocaleString()} records • {availableFields.length} fields
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={addStep}
            disabled={availableFields.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
          <Button
            variant="primary"
            onClick={executeSteps}
            disabled={executing || steps.length === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            {executing ? 'Executing...' : 'Execute Pipeline'}
          </Button>
          <Button
            variant="secondary"
            onClick={savePipeline}
            disabled={loading || steps.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Pipeline
          </Button>
        </div>

        {/* Steps */}
        {steps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No cleaning steps defined</p>
            <p className="text-sm text-gray-500">Add steps to build your data cleaning pipeline</p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      Step {index + 1}
                    </span>
                    <input
                      type="checkbox"
                      checked={step.enabled}
                      onChange={(e) => updateStep(step.id, { enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeStep(step.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Field</label>
                    <select
                      value={step.field}
                      onChange={(e) => updateStep(step.id, { field: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Operation</label>
                    <select
                      value={step.operation}
                      onChange={(e) => updateStep(step.id, { operation: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {operationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(step.operation === 'fill_nulls' || step.operation === 'standardize_format') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Value</label>
                      <input
                        type="text"
                        value={step.value || ''}
                        onChange={(e) => updateStep(step.id, { value: e.target.value })}
                        placeholder="Enter value..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pipeline Summary */}
        {steps.length > 0 && (
          <div className="bg-blue-50 p-4 rounded">
            <h4 className="font-medium mb-2">Pipeline Summary</h4>
            <p className="text-sm text-gray-600">
              {steps.filter(s => s.enabled).length} of {steps.length} steps enabled
            </p>
            <div className="mt-2 space-y-1">
              {steps.filter(s => s.enabled).map((step, index) => (
                <div key={step.id} className="text-xs text-gray-600">
                  {index + 1}. {operationOptions.find(op => op.value === step.operation)?.label} on {step.field}
                  {step.value && ` (${step.value})`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 