'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

type CleaningStep =
  | { type: 'trim'; column: string }
  | { type: 'lowercase'; column: string }
  | { type: 'dropNulls'; column: string }
  | { type: 'rename'; from: string; to: string }

export default function DataCleaner({ sourceId }: { sourceId: string }) {
  const [originalRows, setOriginalRows] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [steps, setSteps] = useState<CleaningStep[]>([])
  const [loading, setLoading] = useState(true)
  const [savingPipeline, setSavingPipeline] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')
  const [selectedField, setSelectedField] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/data/source/${sourceId}`)
      .then((res) => res.json())
      .then((data) => {
        setOriginalRows(data.rows)
        if (data.rows.length > 0) {
          setColumns(Object.keys(data.rows[0].row))
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error fetching data',
          description: 'Could not load data from source',
          variant: 'destructive',
        })
        setLoading(false)
      })
  }, [sourceId])

  const addStep = (step: CleaningStep) => {
    setSteps((prev) => [...prev, step])
  }

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  const addRenameStep = () => {
    if (selectedField && newFieldName) {
      addStep({ type: 'rename', from: selectedField, to: newFieldName })
      setSelectedField('')
      setNewFieldName('')
    }
  }

  const applyCleaning = (row: any): any => {
    let result = { ...row }

    for (const step of steps) {
      if (step.type === 'trim' && result[step.column]) {
        result[step.column] = result[step.column]?.trim?.()
      } else if (step.type === 'lowercase' && result[step.column]) {
        result[step.column] = result[step.column]?.toLowerCase?.()
      } else if (step.type === 'dropNulls') {
        if (result[step.column] == null || result[step.column] === '') return null
      } else if (step.type === 'rename') {
        result[step.to] = result[step.from]
        delete result[step.from]
      }
    }

    return result
  }

  const cleaned = originalRows
    .map((r) => applyCleaning(r.row))
    .filter((r) => r !== null)

  const savePipeline = async () => {
    if (steps.length === 0) {
      toast({
        title: 'No transformations added',
        description: 'Add at least one transformation step before saving',
        variant: 'destructive',
      })
      return
    }

    setSavingPipeline(true)
    try {
      const response = await fetch('/api/data/transformations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          steps,
          name: `Cleaning pipeline for ${sourceId}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save pipeline')
      }

      const result = await response.json()
      toast({
        title: 'Pipeline saved',
        description: `Transformation pipeline saved with ID: ${result.id}`,
      })
    } catch (error) {
      console.error('Error saving pipeline:', error)
      toast({
        title: 'Error saving pipeline',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setSavingPipeline(false)
    }
  }

  const formatStepText = (step: CleaningStep): string => {
    switch (step.type) {
      case 'trim':
        return `Trim whitespace: ${step.column}`
      case 'lowercase':
        return `Lowercase: ${step.column}`
      case 'dropNulls':
        return `Drop nulls: ${step.column}`
      case 'rename':
        return `Rename: ${step.from} → ${step.to}`
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Data Cleaning Pipeline</h1>

      {loading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : (
        <>
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold">Add Transformation Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addStep({ type: 'trim', column: e.target.value })
                    e.target.value = ''
                  }
                }}
                className="p-2 border rounded"
              >
                <option value="">Trim whitespace...</option>
                {columns.map((c) => (
                  <option key={`trim-${c}`} value={c}>{c}</option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addStep({ type: 'lowercase', column: e.target.value })
                    e.target.value = ''
                  }
                }}
                className="p-2 border rounded"
              >
                <option value="">Convert to lowercase...</option>
                {columns.map((c) => (
                  <option key={`lowercase-${c}`} value={c}>{c}</option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addStep({ type: 'dropNulls', column: e.target.value })
                    e.target.value = ''
                  }
                }}
                className="p-2 border rounded"
              >
                <option value="">Drop null values...</option>
                {columns.map((c) => (
                  <option key={`dropNulls-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label htmlFor="field-to-rename" className="text-sm">Rename field</label>
                <select
                  id="field-to-rename"
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="">Select field...</option>
                  {columns.map((c) => (
                    <option key={`rename-${c}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 space-y-1">
                <label htmlFor="new-field-name" className="text-sm">New name</label>
                <input
                  id="new-field-name"
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="p-2 border rounded w-full"
                  placeholder="New field name"
                />
              </div>
              <Button 
                onClick={addRenameStep} 
                disabled={!selectedField || !newFieldName}
                variant="outline"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {steps.length === 0 ? (
                <p className="text-muted-foreground italic">No transformation steps added yet</p>
              ) : (
                steps.map((step, i) => (
                  <div 
                    key={i} 
                    className="bg-muted flex items-center gap-2 text-muted-foreground px-3 py-1 rounded-full"
                  >
                    <span>{formatStepText(step)}</span>
                    <button
                      onClick={() => removeStep(i)}
                      className="hover:text-red-500 focus:outline-none"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 overflow-auto max-h-[500px]">
            <h2 className="font-semibold mb-2">
              Preview Results ({cleaned.length} of {originalRows.length} rows)
            </h2>
            {cleaned.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rows to display after applying transformations
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {Object.keys(cleaned[0]).map((c) => (
                      <th key={c} className="text-left p-2 border-b bg-muted/20 sticky top-0">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cleaned.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-muted/20">
                      {Object.keys(row).map((c) => (
                        <td key={c} className="p-2 border-b border-muted truncate max-w-[200px]">
                          {typeof row[c] === 'string' ? row[c] : JSON.stringify(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={() => setSteps([])}
              disabled={steps.length === 0}
            >
              Clear All Steps
            </Button>
            <Button 
              onClick={savePipeline}
              disabled={steps.length === 0 || savingPipeline}
            >
              {savingPipeline ? 'Saving...' : 'Save Transformation Pipeline'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 