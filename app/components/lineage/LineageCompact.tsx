'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GitBranch, 
  Database, 
  Cpu, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

interface LineageStep {
  id: string
  entityId: string | null
  pipelineId: string | null
  agentId: string | null
  input: string
  output: string
  step: string
  source: string | null
  createdAt: Date
}

interface LineageCompactProps {
  steps: LineageStep[]
  title?: string
  maxSteps?: number
  onViewAll?: () => void
  showTimestamps?: boolean
}

const getStepIcon = (step: string) => {
  if (step.includes('extract') || step.includes('data_retrieval')) return Database
  if (step.includes('transform') || step.includes('clean') || step.includes('enrich')) return Cpu
  if (step.includes('load') || step.includes('save')) return FileText
  if (step.includes('failed') || step.includes('error')) return AlertCircle
  if (step.includes('complete') || step.includes('success')) return CheckCircle
  return GitBranch
}

const getStepColor = (step: string) => {
  if (step.includes('failed') || step.includes('error')) return 'text-red-600 bg-red-50'
  if (step.includes('complete') || step.includes('success')) return 'text-green-600 bg-green-50'
  if (step.includes('start') || step.includes('begin')) return 'text-blue-600 bg-blue-50'
  return 'text-gray-600 bg-gray-50'
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'just nu'
  if (diffMins < 60) return `${diffMins}m sedan`
  if (diffHours < 24) return `${diffHours}h sedan`
  return `${diffDays}d sedan`
}

export function LineageCompact({ 
  steps, 
  title = "Senaste Lineage",
  maxSteps = 5,
  onViewAll,
  showTimestamps = true
}: LineageCompactProps) {
  // Sort steps by timestamp (newest first) and limit
  const recentSteps = steps
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxSteps)

  const totalSteps = steps.length
  const hasMore = totalSteps > maxSteps

  // Get pipeline summary
  const pipelineCount = new Set(steps.map(s => s.pipelineId).filter(Boolean)).size
  const sourceCount = new Set(steps.map(s => s.source).filter(Boolean)).size

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            {title}
          </CardTitle>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="h-6 px-2 text-xs"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Summary stats */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>{totalSteps} steg</span>
          <span>{pipelineCount} pipelines</span>
          <span>{sourceCount} källor</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {recentSteps.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ingen lineage data</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSteps.map((step, index) => {
              const Icon = getStepIcon(step.step)
              const isLast = index === recentSteps.length - 1
              
              return (
                <div key={step.id} className="relative">
                  {/* Timeline connector */}
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200" />
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStepColor(step.step)}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {step.step.replace(/_/g, ' ')}
                        </span>
                        {step.source && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {step.source}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {step.agentId && (
                          <span className="text-xs text-gray-500 truncate">
                            {step.agentId}
                          </span>
                        )}
                        {showTimestamps && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-2 w-2" />
                            {formatTimeAgo(step.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {hasMore && (
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAll}
                  className="w-full h-8 text-xs text-gray-600"
                >
                  Visa {totalSteps - maxSteps} till...
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 