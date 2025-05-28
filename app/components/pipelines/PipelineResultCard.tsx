'use client'

import React from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { LineageModal } from '../lineage/LineageModal'
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play,
  AlertCircle
} from 'lucide-react'

interface PipelineExecution {
  id: string
  pipelineId: string
  pipelineName?: string
  status: 'success' | 'error' | 'running' | 'pending'
  startedAt: Date
  endedAt?: Date
  input?: any
  output?: any
  error?: string
  executionTime?: number
  user?: {
    id: string
    name: string
    email: string
  }
}

interface PipelineResultCardProps {
  execution: PipelineExecution
  onViewDetails?: (executionId: string) => void
  onRunAgain?: (pipelineId: string, input?: any) => void
  className?: string
}

export default function PipelineResultCard({
  execution,
  onViewDetails,
  onRunAgain,
  className = ''
}: PipelineResultCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (startedAt: Date, endedAt?: Date) => {
    if (!endedAt) return 'Pågående...'
    const duration = endedAt.getTime() - startedAt.getTime()
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const cardActions = (
    <div className="flex gap-2">
      <LineageModal
        trigger={
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <GitBranch className="h-3 w-3" />
            Visa kedja
          </Button>
        }
        pipelineId={execution.pipelineId}
        title={`Pipeline Lineage - ${execution.pipelineName || 'Pipeline'}`}
        description={`Visa transformationssteg för pipeline-körning ${execution.id.substring(0, 8)}...`}
      />

      {onViewDetails && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(execution.id)}
        >
          Detaljer
        </Button>
      )}

      {onRunAgain && execution.status !== 'running' && (
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onRunAgain(execution.pipelineId, execution.input)}
          className="flex items-center gap-1"
        >
          <Play className="h-3 w-3" />
          Kör igen
        </Button>
      )}
    </div>
  )

  return (
    <Card 
      title={
        <div className="flex items-center gap-2">
          {getStatusIcon(execution.status)}
          {execution.pipelineName || `Pipeline ${execution.pipelineId.substring(0, 8)}...`}
        </div>
      }
      actions={cardActions}
      className={`hover:shadow-md transition-shadow ${className}`}
    >
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex justify-end">
          <Badge className={getStatusColor(execution.status)}>
            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
          </Badge>
        </div>

        {/* Execution Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Startad:</span>
            <div className="font-medium">{formatTimestamp(execution.startedAt)}</div>
          </div>
          <div>
            <span className="text-gray-600">Varaktighet:</span>
            <div className="font-medium">{formatDuration(execution.startedAt, execution.endedAt)}</div>
          </div>
        </div>

        {/* User Info */}
        {execution.user && (
          <div className="text-sm">
            <span className="text-gray-600">Kördes av:</span>
            <span className="ml-2 font-medium">{execution.user.name || execution.user.email}</span>
          </div>
        )}

        {/* Error Message */}
        {execution.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-800">
              <strong>Fel:</strong> {execution.error}
            </div>
          </div>
        )}

        {/* Success Summary */}
        {execution.status === 'success' && execution.output && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="text-sm text-green-800">
              <strong>Resultat:</strong> Pipeline kördes framgångsrikt
              {execution.executionTime && (
                <span className="ml-2">({execution.executionTime}ms)</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 