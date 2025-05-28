'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  GitBranch, 
  Search, 
  Filter,
  Database,
  Cpu,
  Activity,
  BarChart3,
  Eye,
  Download
} from 'lucide-react'
import { 
  LineageVisualization, 
  LineageCompact, 
  LineageDashboard,
  useLineage,
  useLineageStats
} from '@/app/components/lineage'

export default function LineagePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntityId, setSelectedEntityId] = useState<string>('')
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('')
  const [activeTab, setActiveTab] = useState('dashboard')

  // Fetch lineage data
  const { 
    steps, 
    loading, 
    error, 
    refresh,
    hasMore,
    loadMore 
  } = useLineage({
    entityId: selectedEntityId || undefined,
    pipelineId: selectedPipelineId || undefined,
    autoRefresh: true,
    refreshInterval: 30000
  })

  const { stats } = useLineageStats(
    selectedEntityId || undefined,
    selectedPipelineId || undefined
  )

  // Filter steps based on search query
  const filteredSteps = steps.filter(step => 
    step.step.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.agentId?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEntitySearch = (entityId: string) => {
    setSelectedEntityId(entityId)
    setSelectedPipelineId('')
  }

  const handlePipelineSearch = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId)
    setSelectedEntityId('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <GitBranch className="h-8 w-8 text-blue-600" />
                Data Lineage Center
              </h1>
              <p className="text-gray-600 mt-2">
                Spåra och visualisera dataflöden genom hela systemet
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {loading ? 'Uppdaterar...' : 'Uppdatera'}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportera
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Totala Steg</p>
                    <p className="text-xl font-bold">{stats.totalSteps?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aktiva Pipelines</p>
                    <p className="text-xl font-bold">{stats.pipelineCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Datakällor</p>
                    <p className="text-xl font-bold">{stats.sourceCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Framgångsgrad</p>
                    <p className="text-xl font-bold">{stats.successRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Sök och Filtrera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sök i steg
                </label>
                <Input
                  placeholder="Sök efter steg, källa eller agent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entitet ID
                </label>
                <Input
                  placeholder="Ange entitet ID..."
                  value={selectedEntityId}
                  onChange={(e) => handleEntitySearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pipeline ID
                </label>
                <Input
                  placeholder="Ange pipeline ID..."
                  value={selectedPipelineId}
                  onChange={(e) => handlePipelineSearch(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            {(selectedEntityId || selectedPipelineId || searchQuery) && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-gray-600">Aktiva filter:</span>
                {selectedEntityId && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Entitet: {selectedEntityId}
                    <button 
                      onClick={() => setSelectedEntityId('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedPipelineId && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Pipeline: {selectedPipelineId}
                    <button 
                      onClick={() => setSelectedPipelineId('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Sökning: {searchQuery}
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="visualization">Visualisering</TabsTrigger>
            <TabsTrigger value="compact">Kompakt Vy</TabsTrigger>
            <TabsTrigger value="realtime">Realtid</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <LineageDashboard
              entityId={selectedEntityId || undefined}
              pipelineId={selectedPipelineId || undefined}
              title="Lineage Analytics"
            />
          </TabsContent>

          <TabsContent value="visualization" className="mt-6">
            <LineageVisualization
              entityId={selectedEntityId || undefined}
              pipelineId={selectedPipelineId || undefined}
              steps={filteredSteps}
              title="Detaljerad Lineage Visualisering"
              showFilters={true}
            />
          </TabsContent>

          <TabsContent value="compact" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <LineageCompact
                steps={filteredSteps}
                title="Senaste Aktivitet"
                maxSteps={10}
                onViewAll={() => setActiveTab('visualization')}
              />
              
              <LineageCompact
                steps={filteredSteps.filter(s => s.step.includes('success') || s.step.includes('complete'))}
                title="Framgångsrika Steg"
                maxSteps={8}
                onViewAll={() => setActiveTab('visualization')}
              />
              
              <LineageCompact
                steps={filteredSteps.filter(s => s.step.includes('failed') || s.step.includes('error'))}
                title="Misslyckade Steg"
                maxSteps={8}
                onViewAll={() => setActiveTab('visualization')}
              />
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Realtids Lineage Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Realtids Monitoring
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Realtids WebSocket-integration för live lineage updates kommer snart...
                  </p>
                  <Button variant="outline">
                    Aktivera Realtids Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Load More */}
        {hasMore && activeTab === 'visualization' && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {loading ? 'Laddar...' : 'Ladda fler steg'}
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <Activity className="h-5 w-5" />
                <span className="font-medium">Fel vid laddning av lineage data:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 