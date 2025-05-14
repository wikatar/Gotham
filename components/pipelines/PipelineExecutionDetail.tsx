import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'

interface PipelineExecutionDetailProps {
  executionId: string;
  onBack?: () => void;
}

export default function PipelineExecutionDetail({ 
  executionId,
  onBack 
}: PipelineExecutionDetailProps) {
  const [execution, setExecution] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningAgain, setRunningAgain] = useState(false)

  useEffect(() => {
    // Fetch execution details
    setLoading(true)
    fetch(`/api/pipelines/executions/${executionId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch execution details')
        }
        return res.json()
      })
      .then((data) => {
        setExecution(data.execution)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [executionId])

  const handleRunAgain = async () => {
    if (!execution) return
    
    setRunningAgain(true)
    try {
      const response = await fetch('/api/pipelines/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineId: execution.pipelineId,
          input: execution.input
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to run pipeline')
      }
      
      toast({
        title: 'Pipeline re-execution started',
        description: 'The pipeline is running with the same input data.',
      })
    } catch (error) {
      console.error('Error re-running pipeline:', error)
      toast({
        title: 'Failed to re-run pipeline',
        description: (error as Error).message,
        variant: 'destructive',
      })
    } finally {
      setRunningAgain(false)
    }
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>Error loading execution details: {error}</p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-60 mb-4" />
        <Card className="p-4">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-60 w-full mb-2" />
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔎 Execution Details</h1>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Back to History
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="font-semibold">Pipeline ID:</div>
        <div>{execution.pipelineId}</div>

        <div className="mt-2 font-semibold">Status:</div>
        <div className={`capitalize ${
          execution.status === 'success' ? 'text-green-600' : 
          execution.status === 'error' ? 'text-red-600' : 
          'text-amber-600'
        }`}>
          {execution.status}
        </div>

        <div className="mt-2 font-semibold">Timestamp:</div>
        <div>
          Started: {new Date(execution.startedAt).toLocaleString()}
          {execution.endedAt && <> | Ended: {new Date(execution.endedAt).toLocaleString()}</>}
        </div>

        {execution.error && (
          <>
            <div className="mt-4 font-semibold text-red-600">Error:</div>
            <pre className="bg-red-50 p-3 rounded text-sm text-red-800 whitespace-pre-wrap overflow-auto max-h-40">
              {execution.error}
            </pre>
          </>
        )}

        <div className="mt-4 font-semibold">Input:</div>
        <pre className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap overflow-auto max-h-60 border">
          {JSON.stringify(execution.input, null, 2)}
        </pre>

        {execution.output && (
          <>
            <div className="mt-4 font-semibold">Output:</div>
            <pre className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap overflow-auto max-h-60 border">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </>
        )}
      </Card>

      <Button
        onClick={handleRunAgain}
        disabled={runningAgain}
        className="mt-4"
      >
        {runningAgain ? 'Running...' : 'Run Again with Same Input'}
      </Button>
    </div>
  )
} 