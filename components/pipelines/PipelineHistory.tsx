import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import PipelineExecutionDetail from './PipelineExecutionDetail'
import Link from 'next/link'

type User = {
  id: string
  name: string
  email: string
}

type PipelineInfo = {
  name: string
  missionId: string
}

type Exec = {
  id: string
  pipelineId: string
  status: string
  startedAt: string
  endedAt?: string
  error?: string
  userId?: string
  user?: User
  pipeline?: PipelineInfo
}

interface PipelineHistoryProps {
  pipelineId?: string;
  accountId?: string;
  missionId?: string;
  limit?: number;
}

export default function PipelineHistory({
  pipelineId,
  accountId = 'demo-account',
  missionId,
  limit = 10
}: PipelineHistoryProps) {
  const [execs, setExecs] = useState<Exec[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)

  useEffect(() => {
    // Build the query string based on provided props
    let queryParams = new URLSearchParams()
    
    if (pipelineId) {
      queryParams.append('pipelineId', pipelineId)
    }
    
    if (accountId) {
      queryParams.append('accountId', accountId)
    }
    
    if (missionId) {
      queryParams.append('missionId', missionId)
    }
    
    if (limit) {
      queryParams.append('limit', limit.toString())
    }
    
    // Fetch the execution history
    setLoading(true)
    fetch(`/api/pipelines/history?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch execution history')
        }
        return res.json()
      })
      .then((data) => {
        setExecs(data.executions)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [pipelineId, accountId, missionId, limit])

  // If an execution is selected, show its details
  if (selectedExecution) {
    return (
      <PipelineExecutionDetail 
        executionId={selectedExecution} 
        onBack={() => setSelectedExecution(null)}
      />
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error loading pipeline history: {error}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">⏱ Pipeline Execution History</h2>
      
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-3 border">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-60" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : execs.length > 0 ? (
        <div className="space-y-2">
          {execs.map((e) => (
            <Card key={e.id} className="p-3 border">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">
                    {e.pipeline?.name || `Pipeline ID: ${e.pipelineId}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Start: {new Date(e.startedAt).toLocaleString()}  
                    {e.endedAt && <> | End: {new Date(e.endedAt).toLocaleString()}</>}
                  </div>
                  {e.user && (
                    <div className="text-xs text-gray-500 mt-1">
                      By: {e.user.name || e.user.email || 'Unknown user'}
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <span
                    className={`px-2 py-1 rounded ${
                      e.status === 'success'
                        ? 'bg-green-500 text-white'
                        : e.status === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              </div>
              {e.error && <div className="text-red-600 mt-2 text-sm">Error: {e.error}</div>}
              
              <div className="mt-2 flex justify-end space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedExecution(e.id)}
                  className="text-sm"
                >
                  View Details
                </Button>
                <Link href={`/pipeline-executions/${e.id}`} passHref>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-sm"
                  >
                    Open in New Page
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">No execution history found.</p>
        </div>
      )}
    </div>
  )
} 