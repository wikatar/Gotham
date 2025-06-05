import { useEffect, useState } from 'react'
import Card from '../../app/components/ui/Card'
import Link from 'next/link'

// Simple skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
)

// Simple select components
const Select = ({ children, value, onValueChange }: { 
  children: React.ReactNode; 
  value: string; 
  onValueChange: (value: string) => void;
}) => (
  <div className="relative">
    {children}
  </div>
)

const SelectTrigger = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
    {children}
  </div>
)

const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <span className="text-gray-500">{placeholder}</span>
)

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10">
    {children}
  </div>
)

const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div className="p-2 hover:bg-gray-100 cursor-pointer">
    {children}
  </div>
)

type User = {
  id: string
  name: string
  email: string
}

type PipelineInfo = {
  name: string
  missionId: string
}

type Execution = {
  id: string
  pipelineId: string
  status: string
  startedAt: string
  endedAt?: string
  error?: string
  accountId: string
  userId?: string
  user?: User
  pipeline?: PipelineInfo
}

type Mission = {
  id: string
  name: string
}

interface ExecutionTimelineProps {
  initialMissionId?: string
  initialUserId?: string
  missions?: Mission[]
}

export default function ExecutionTimeline({
  initialMissionId,
  initialUserId,
  missions = [] // Mock data if needed
}: ExecutionTimelineProps) {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [missionId, setMissionId] = useState<string | undefined>(initialMissionId)
  const [userId, setUserId] = useState<string | undefined>(initialUserId)

  useEffect(() => {
    setLoading(true)
    // Build query params based on filters
    const params = new URLSearchParams()
    if (missionId) params.append('missionId', missionId)
    if (userId) params.append('userId', userId)
    
    // Fetch executions with filters
    fetch(`/api/pipelines/history?${params.toString()}`)
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
  }, [missionId, userId])

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error loading execution timeline: {error}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📅 System Execution Timeline</h1>
        
        <div className="flex gap-2">
          {missions && missions.length > 0 && (
            <Select
              value={missionId || ""}
              onValueChange={(value) => setMissionId(value === "" ? undefined : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All missions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All missions</SelectItem>
                {missions.map((mission) => (
                  <SelectItem key={mission.id} value={mission.id}>
                    {mission.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
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
                  <span className="font-semibold">{execution.pipeline?.name || execution.pipelineId}</span> was executed
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(execution.startedAt).toLocaleString()}
                  {execution.endedAt && 
                    <span className="ml-1">
                      (Duration: {calculateDuration(execution.startedAt, execution.endedAt)})
                    </span>
                  }
                </div>
                {execution.user && (
                  <div className="text-xs text-gray-500 mt-1">
                    By: {execution.user.name || execution.user.email || 'Unknown user'}
                  </div>
                )}
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