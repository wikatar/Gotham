import { useEffect, useState } from 'react'
import Card from '../../app/components/ui/Card'
import Button from '../../app/components/ui/Button'

// Simple skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
)

// Simple toast function
const toast = ({ title, description, variant }: { 
  title: string; 
  description: string; 
  variant?: string;
}) => {
  console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`)
  // In a real app, this would show a proper toast notification
}

// Simple Tab components
const TabButton = ({ id, label, active, onClick }: { 
  id: string; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
      active
        ? 'bg-blue-500 text-white border-b-2 border-blue-500'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
)

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
          <Button onClick={onBack} variant="secondary" className="mt-4">
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
        <Card title="Loading...">
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
          <Button onClick={onBack} variant="secondary">
            Back to History
          </Button>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200 mb-4">
        <TabButton 
          id="details" 
          label="Details" 
          active={activeTab === 'details'} 
          onClick={() => setActiveTab('details')}
        />
        <TabButton 
          id="replay" 
          label="Replay" 
          active={activeTab === 'replay'} 
          onClick={() => setActiveTab('replay')}
        />
      </div>
        
      {activeTab === 'details' && (
        <Card title="Execution Information">
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
              <div className="mt-2 font-semibold">Error:</div>
              <div className="text-red-600 bg-red-50 p-2 rounded">
                {execution.error}
              </div>
            </>
          )}

          <div className="mt-4 font-semibold">Input Data:</div>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(execution.input, null, 2)}
          </pre>

          {execution.output && (
            <>
              <div className="mt-4 font-semibold">Output Data:</div>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </>
          )}

          <div className="mt-4 flex gap-2">
            <Button 
              onClick={handleRunAgain}
              disabled={runningAgain}
            >
              {runningAgain ? 'Running...' : 'Run Again'}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'replay' && (
        <Card title="Replay with Modified Input">
          <p className="text-gray-600 mb-4">
            Modify the input data below and replay the pipeline execution.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Input Data (JSON):</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={10}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              {inputError && (
                <p className="text-red-600 text-sm mt-1">{inputError}</p>
              )}
            </div>
            
            <Button 
              onClick={handleReplayWithModifiedInput}
              disabled={runningAgain}
            >
              {runningAgain ? 'Running...' : 'Replay with Modified Input'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
} 