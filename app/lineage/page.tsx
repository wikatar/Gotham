'use client'

import React, { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
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
                variant="secondary"
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {loading ? 'Uppdaterar...' : 'Uppdatera'}
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportera
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card title="Totala Steg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalSteps?.toLocaleString() || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card title="Aktiva Pipelines">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Cpu className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.pipelineCount || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card title="Datakällor">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.sourceCount || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card title="Framgångsgrad">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.successRate || 0}%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <Card title="Sök och Filtrera">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sök i steg
              </label>
              <input
                placeholder="Sök efter steg, källa eller agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entitet ID
              </label>
              <input
                placeholder="Ange entitet ID..."
                value={selectedEntityId}
                onChange={(e) => handleEntitySearch(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pipeline ID
              </label>
              <input
                placeholder="Ange pipeline ID..."
                value={selectedPipelineId}
                onChange={(e) => handlePipelineSearch(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="mt-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-gray-200 mb-4">
            <TabButton 
              id="dashboard" 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            />
            <TabButton 
              id="visualization" 
              label="Visualisering" 
              active={activeTab === 'visualization'} 
              onClick={() => setActiveTab('visualization')}
            />
            <TabButton 
              id="compact" 
              label="Kompakt Vy" 
              active={activeTab === 'compact'} 
              onClick={() => setActiveTab('compact')}
            />
            <TabButton 
              id="list" 
              label="Lista" 
              active={activeTab === 'list'} 
              onClick={() => setActiveTab('list')}
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <LineageDashboard 
              entityId={selectedEntityId || undefined}
              pipelineId={selectedPipelineId || undefined}
            />
          )}

          {activeTab === 'visualization' && (
            <LineageVisualization 
              entityId={selectedEntityId || undefined}
              pipelineId={selectedPipelineId || undefined}
              height="600px"
            />
          )}

          {activeTab === 'compact' && (
            <LineageCompact 
              entityId={selectedEntityId || undefined}
              pipelineId={selectedPipelineId || undefined}
              limit={50}
            />
          )}

          {activeTab === 'list' && (
            <Card title="Lineage Steg">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-red-800">Fel vid hämtning av lineage data: {error}</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Laddar lineage data...</p>
                </div>
              )}

              {!loading && filteredSteps.length === 0 && (
                <div className="text-center py-8">
                  <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Inga lineage steg hittades</p>
                  {(selectedEntityId || selectedPipelineId || searchQuery) && (
                    <p className="text-sm text-gray-500 mt-2">
                      Prova att ändra dina sökkriterier
                    </p>
                  )}
                </div>
              )}

              {!loading && filteredSteps.length > 0 && (
                <div className="space-y-4">
                  {filteredSteps.map((step, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {step.step}
                            </Badge>
                            {step.source && (
                              <Badge variant="outline">
                                {step.source}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            {step.entityId && (
                              <p><strong>Entitet:</strong> {step.entityId}</p>
                            )}
                            {step.pipelineId && (
                              <p><strong>Pipeline:</strong> {step.pipelineId}</p>
                            )}
                            {step.agentId && (
                              <p><strong>Agent:</strong> {step.agentId}</p>
                            )}
                            <p><strong>Tidsstämpel:</strong> {new Date(step.timestamp).toLocaleString('sv-SE')}</p>
                          </div>

                          {step.metadata && Object.keys(step.metadata).length > 0 && (
                            <details className="mt-3">
                              <summary className="cursor-pointer text-sm font-medium text-blue-600">
                                Visa metadata
                              </summary>
                              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(step.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              if (step.entityId) handleEntitySearch(step.entityId)
                            }}
                            disabled={!step.entityId}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <div className="text-center pt-4">
                      <Button
                        onClick={loadMore}
                        disabled={loading}
                        variant="secondary"
                      >
                        {loading ? 'Laddar...' : 'Ladda fler'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 