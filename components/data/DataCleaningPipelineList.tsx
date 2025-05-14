'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

export default function DataCleaningPipelineList({ sourceId }: { sourceId: string }) {
  const [pipelines, setPipelines] = useState<any[]>([])
  const [original, setOriginal] = useState<any[]>([])
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)

  useEffect(() => {
    setLoading(true)
    // Fetch pipelines for this source
    fetch('/api/data/cleaning/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPipelines(data.pipelines)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching pipelines:', error)
        toast({
          title: 'Error fetching pipelines',
          description: 'Could not load cleaning pipelines',
          variant: 'destructive',
        })
        setLoading(false)
      })

    // Fetch original data rows for this source
    fetch(`/api/data/source/${sourceId}`)
      .then((res) => res.json())
      .then((data) => setOriginal(data.rows))
      .catch(error => {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error fetching data',
          description: 'Could not load source data rows',
          variant: 'destructive',
        })
      })
  }, [sourceId])

  const runPipeline = (steps: any[]) => {
    setExecuting(true)
    try {
      const result = original
        .map((r) => applySteps(r.row, steps))
        .filter((r) => r !== null)
      setPreview(result)
      
      toast({
        title: 'Pipeline executed',
        description: `Processed ${original.length} rows, resulting in ${result.length} cleaned rows`,
      })
    } catch (error) {
      console.error('Error executing pipeline:', error)
      toast({
        title: 'Error executing pipeline',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setExecuting(false)
    }
  }

  const saveCleaned = async (pipelineId: string) => {
    try {
      setExecuting(true)
      const response = await fetch('/api/data/cleaning/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, pipelineId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save cleaned data')
      }

      const data = await response.json()
      toast({
        title: 'Cleaned data saved',
        description: `Successfully saved ${data.saved} cleaned rows`,
      })
    } catch (error) {
      console.error('Error saving cleaned data:', error)
      toast({
        title: 'Error saving cleaned data',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Cleaning Pipelines</h2>

      {loading ? (
        <div className="text-center py-4">Loading pipelines...</div>
      ) : pipelines.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No cleaning pipelines found for this data source.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pipelines.map((pipe) => (
            <Card key={pipe.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold">{pipe.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {pipe.steps.length} steps • Created {new Date(pipe.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => runPipeline(pipe.steps)}
                    disabled={executing || original.length === 0}
                  >
                    Test Run
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => saveCleaned(pipe.id)}
                    disabled={executing}
                  >
                    Save Cleaned Dataset
                  </Button>
                </div>
              </div>
              <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-[100px]">
                <pre>{JSON.stringify(pipe.steps, null, 2)}</pre>
              </div>
            </Card>
          ))}
        </div>
      )}

      {preview.length > 0 && (
        <Card className="p-4 overflow-auto max-h-[400px]">
          <h3 className="text-sm font-semibold mb-2">
            Preview Results ({preview.length} rows)
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {Object.keys(preview[0]).map((c) => (
                  <th key={c} className="text-left p-2 border-b bg-muted/20 sticky top-0">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 10).map((row, i) => (
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
        </Card>
      )}
    </div>
  )
}

// Utility function to apply cleaning steps to a row
function applySteps(row: any, steps: any[]): any | null {
  let result = { ...row }
  for (const step of steps) {
    if (step.type === 'trim') {
      result[step.column] = result[step.column]?.trim?.()
    } else if (step.type === 'lowercase') {
      result[step.column] = result[step.column]?.toLowerCase?.()
    } else if (step.type === 'dropNulls' && (result[step.column] == null || result[step.column] === '')) {
      return null
    } else if (step.type === 'rename') {
      result[step.to] = result[step.from]
      delete result[step.from]
    }
  }
  return result
} 