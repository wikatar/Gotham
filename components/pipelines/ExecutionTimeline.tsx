import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

type Execution = {
  id: string
  pipelineId: string
  status: string
  startedAt: string
  endedAt?: string
  error?: string
  accountId: string
}

export default function ExecutionTimeline() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    // Fetch all executions without filtering
    fetch('/api/pipelines/history')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch execution timeline')
        }
        return res.json()
      })
      .then((data) => {
        setExecutions(data.executions)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error loading execution timeline: {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 System Execution Timeline</h1>
      
      {loading ? (
        // Skeleton loading state
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : executions.length > 0 ? (
        <div className="space-y-3">
          {executions.map((execution) => (
            <Card key={execution.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
              <div>
                <div className="text-sm">
                  <span className="font-semibold">{execution.pipelineId}</span> was executed
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(execution.startedAt).toLocaleString()}
                  {execution.endedAt && 
                    <span className="ml-1">
                      (Duration: {calculateDuration(execution.startedAt, execution.endedAt)})
                    </span>
                  }
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    execution.status === 'success'
                      ? 'bg-green-500 text-white'
                      : execution.status === 'error'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {execution.status}
                </span>
                
                <Link
                  href={`/pipeline-executions/${execution.id}`}
                  className="text-blue-500 text-sm hover:underline"
                >
                  Details
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

// Helper function to calculate duration between two timestamps
function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const durationMs = end - start
  
  if (durationMs < 1000) {
    return `${durationMs}ms`
  } else if (durationMs < 60000) {
    return `${Math.round(durationMs / 1000)}s`
  } else {
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.round((durationMs % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }
} 