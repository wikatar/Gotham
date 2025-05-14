import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

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
  const [inputText, setInputText] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('details')

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
        setInputText(JSON.stringify(data.execution.input, null, 2))
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
  
  const handleReplayWithModifiedInput = async () => {
    if (!execution) return
    
    // Validate the input JSON
    setInputError(null)
    let parsedInput: any
    
    try {
      parsedInput = JSON.parse(inputText)
    } catch (err) {
      setInputError('Invalid JSON: ' + (err as Error).message)
      return
    }
    
    setRunningAgain(true)
    try {
      const response = await fetch('/api/pipelines/replay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineId: execution.pipelineId,
          input: parsedInput
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to run pipeline with modified input')
      }
      
      const data = await response.json()
      
      toast({
        title: 'Pipeline executed successfully',
        description: 'The pipeline was run with your modified input.',
      })
    } catch (error) {
      console.error('Error replaying pipeline:', error)
      toast({
        title: 'Failed to replay pipeline',
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="replay">Replay</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
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
            
            <div className="mt-4">
              <Button
                onClick={handleRunAgain}
                disabled={runningAgain}
              >
                {runningAgain ? 'Running...' : 'Run Again with Same Input'}
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="replay">
          <Card className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">🧪 Modify Input and Replay</h3>
              <p className="text-sm text-gray-600">
                Edit the JSON input below and replay the pipeline to test with different parameters.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Pipeline ID: {execution.pipelineId}</div>
              
              <div className="mt-4">
                <label htmlFor="input-json" className="font-medium block mb-1">
                  Input JSON:
                </label>
                <Textarea
                  id="input-json"
                  className="font-mono text-sm h-72 w-full"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                
                {inputError && (
                  <div className="text-red-600 text-sm mt-1">
                    {inputError}
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleReplayWithModifiedInput}
                disabled={runningAgain}
                className="mt-4"
              >
                {runningAgain ? 'Running...' : 'Run With Modified Input'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 