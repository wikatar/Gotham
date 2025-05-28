'use client'

import React, { useState, useMemo } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { 
  GitBranch, 
  Database, 
  Calendar, 
  Filter,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  ArrowRight
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
  entity?: {
    id: string
    name: string | null
    type: string
  }
}

interface LineageVisualizationProps {
  steps: LineageStep[]
  entityId?: string
  pipelineId?: string
  title?: string
  showFilters?: boolean
  className?: string
}

export function LineageVisualization({
  steps,
  entityId,
  pipelineId,
  title = "Data Lineage",
  showFilters = true,
  className = ''
}: LineageVisualizationProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline')
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  // Sort steps by timestamp
  const sortedSteps = useMemo(() => {
    return [...steps].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [steps])

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const getStepIcon = (step: string) => {
    if (step.includes('extract') || step.includes('data_retrieval')) return Database
    if (step.includes('transform') || step.includes('clean') || step.includes('enrich')) return GitBranch
    if (step.includes('load') || step.includes('save')) return Database
    return GitBranch
  }

  const getStepColor = (step: string) => {
    if (step.includes('failed') || step.includes('error')) return 'bg-red-100 text-red-800'
    if (step.includes('complete') || step.includes('success')) return 'bg-green-100 text-green-800'
    if (step.includes('start') || step.includes('begin')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const exportData = () => {
    const dataStr = JSON.stringify(steps, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lineage-${entityId || pipelineId || 'data'}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const cardActions = (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            viewMode === 'timeline'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setViewMode('graph')}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            viewMode === 'graph'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Graf
        </button>
      </div>

      <Button variant="ghost" size="sm" onClick={exportData}>
        <Download className="h-3 w-3" />
        Export
      </Button>
    </div>
  )

  if (steps.length === 0) {
    return (
      <Card title={title} className={className}>
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen lineage-data</h3>
          <p className="text-gray-600">Inga transformationssteg har loggats än.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title={title} actions={cardActions} className={className}>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
        <span>{steps.length} steg</span>
        <span>{new Set(steps.map(s => s.pipelineId).filter(Boolean)).size} pipelines</span>
        <span>{new Set(steps.map(s => s.source).filter(Boolean)).size} källor</span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {viewMode === 'timeline' ? (
          <div className="space-y-4">
            {sortedSteps.map((step, index) => {
              const Icon = getStepIcon(step.step)
              const isExpanded = expandedSteps.has(step.id)
              const isLast = index === sortedSteps.length - 1

              return (
                <div key={step.id} className="relative">
                  {/* Timeline connector */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => toggleStepExpansion(step.id)}
                          className="flex items-center gap-2 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <h3 className="font-medium text-gray-900">
                            {step.step.replace(/_/g, ' ')}
                          </h3>
                        </button>

                        <Badge className={getStepColor(step.step)}>
                          {step.step}
                        </Badge>

                        {step.source && (
                          <Badge variant="outline">
                            {step.source}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(step.createdAt)}
                        </div>
                        {step.agentId && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {step.agentId}
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Input</h4>
                              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                {JSON.stringify(JSON.parse(step.input || '{}'), null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Output</h4>
                              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                {JSON.stringify(JSON.parse(step.output || '{}'), null, 2)}
                              </pre>
                            </div>
                          </div>

                          {step.entity && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Relaterad Entitet</h4>
                              <div className="bg-white p-3 rounded border">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{step.entity.type}</Badge>
                                  <span className="text-sm">
                                    {step.entity.name || step.entity.id}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Graf-vy</h3>
            <p className="text-gray-600">Graf-visualisering kommer snart...</p>
          </div>
        )}
      </div>
    </Card>
  )
} 