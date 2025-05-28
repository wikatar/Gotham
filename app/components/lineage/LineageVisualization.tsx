'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  GitBranch, 
  Database, 
  Cpu, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Eye,
  Download,
  Filter
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
  entityId?: string
  pipelineId?: string
  steps: LineageStep[]
  title?: string
  showFilters?: boolean
}

const getStepIcon = (step: string, source: string | null) => {
  if (step.includes('extract') || step.includes('data_retrieval')) return Database
  if (step.includes('transform') || step.includes('clean') || step.includes('enrich')) return Cpu
  if (step.includes('load') || step.includes('save')) return FileText
  if (step.includes('failed') || step.includes('error')) return AlertCircle
  if (step.includes('complete') || step.includes('success')) return CheckCircle
  return GitBranch
}

const getStepColor = (step: string) => {
  if (step.includes('failed') || step.includes('error')) return 'destructive'
  if (step.includes('complete') || step.includes('success')) return 'default'
  if (step.includes('start') || step.includes('begin')) return 'secondary'
  return 'outline'
}

const formatTimestamp = (date: Date) => {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

const parseJsonSafely = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return jsonString
  }
}

export function LineageVisualization({ 
  entityId, 
  pipelineId, 
  steps, 
  title = "Data Lineage",
  showFilters = true 
}: LineageVisualizationProps) {
  const [selectedStep, setSelectedStep] = useState<LineageStep | null>(null)
  const [filterSource, setFilterSource] = useState<string>('all')
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline')

  // Get unique sources and agents for filtering
  const { sources, agents } = useMemo(() => {
    const sources = Array.from(new Set(steps.map(s => s.source).filter(Boolean)))
    const agents = Array.from(new Set(steps.map(s => s.agentId).filter(Boolean)))
    return { sources, agents }
  }, [steps])

  // Filter steps based on selected filters
  const filteredSteps = useMemo(() => {
    return steps.filter(step => {
      if (filterSource !== 'all' && step.source !== filterSource) return false
      if (filterAgent !== 'all' && step.agentId !== filterAgent) return false
      return true
    })
  }, [steps, filterSource, filterAgent])

  // Group steps by pipeline for better visualization
  const groupedSteps = useMemo(() => {
    const groups = filteredSteps.reduce((acc, step) => {
      const key = step.pipelineId || 'unknown'
      if (!acc[key]) acc[key] = []
      acc[key].push(step)
      return acc
    }, {} as Record<string, LineageStep[]>)

    // Sort steps within each group by timestamp
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    })

    return groups
  }, [filteredSteps])

  const exportLineage = () => {
    const data = {
      entityId,
      pipelineId,
      exportedAt: new Date().toISOString(),
      steps: filteredSteps.map(step => ({
        ...step,
        input: parseJsonSafely(step.input),
        output: parseJsonSafely(step.output)
      }))
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lineage-${entityId || pipelineId || 'export'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredSteps.length} steg i {Object.keys(groupedSteps).length} pipeline(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportLineage}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportera
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (sources.length > 1 || agents.length > 1) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4">
              {sources.length > 1 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-600">Källa</label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">Alla källor</option>
                    {sources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {agents.length > 1 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-600">Agent</label>
                  <select
                    value={filterAgent}
                    onChange={(e) => setFilterAgent(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">Alla agenter</option>
                    {agents.map(agent => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'timeline' | 'graph')}>
        <TabsList>
          <TabsTrigger value="timeline">Tidslinje</TabsTrigger>
          <TabsTrigger value="graph">Graf</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {Object.entries(groupedSteps).map(([pipelineId, pipelineSteps]) => (
            <Card key={pipelineId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Pipeline: {pipelineId}
                  <Badge variant="outline" className="ml-2">
                    {pipelineSteps.length} steg
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pipelineSteps.map((step, index) => {
                    const Icon = getStepIcon(step.step, step.source)
                    const isLast = index === pipelineSteps.length - 1
                    
                    return (
                      <div key={step.id} className="relative">
                        {/* Timeline connector */}
                        {!isLast && (
                          <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                        )}
                        
                        <div 
                          className="flex items-start gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedStep(step)}
                        >
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{step.step}</h4>
                              <Badge variant={getStepColor(step.step)}>
                                {step.source || 'Unknown'}
                              </Badge>
                              {step.agentId && (
                                <Badge variant="outline" className="text-xs">
                                  {step.agentId}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(step.createdAt)}
                              </div>
                              {step.entity && (
                                <div className="flex items-center gap-1">
                                  <Database className="h-3 w-3" />
                                  {step.entity.name || step.entity.id}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Graf-vy</h3>
                <p className="text-gray-600">
                  Interaktiv graf-visualisering kommer snart...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Step Detail Modal */}
      {selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(getStepIcon(selectedStep.step, selectedStep.source), {
                    className: "h-5 w-5"
                  })}
                  {selectedStep.step}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStep(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[60vh]">
                <div className="p-6 space-y-6">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Pipeline:</strong> {selectedStep.pipelineId}</div>
                        <div><strong>Agent:</strong> {selectedStep.agentId || 'N/A'}</div>
                        <div><strong>Källa:</strong> {selectedStep.source || 'N/A'}</div>
                        <div><strong>Tidpunkt:</strong> {formatTimestamp(selectedStep.createdAt)}</div>
                        {selectedStep.entity && (
                          <div><strong>Entitet:</strong> {selectedStep.entity.name || selectedStep.entity.id}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Input/Output */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Input</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(parseJsonSafely(selectedStep.input), null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Output</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(parseJsonSafely(selectedStep.output), null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 