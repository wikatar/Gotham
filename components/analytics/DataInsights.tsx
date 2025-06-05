'use client'

import { useState, useEffect } from 'react'
import Card from '../../app/components/ui/Card'
import Badge from '../../app/components/ui/Badge'
import Button from '../../app/components/ui/Button'
import { TrendingUp, TrendingDown, AlertCircle, BarChart3, PieChart, Activity } from 'lucide-react'
import InsightActionPanel from './InsightActionPanel'

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

interface DataInsightsProps {
  sourceId?: string
  pipelineId?: string
}

export default function DataInsights({ sourceId, pipelineId }: DataInsightsProps) {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchInsights = async () => {
    if (!sourceId && !pipelineId) {
      setError('No data source or pipeline specified')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const requestBody: any = {}
      
      if (sourceId) requestBody.sourceId = sourceId
      if (pipelineId) requestBody.pipelineId = pipelineId
      
      const response = await fetch('/api/insights/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.message || 'Error generating insights')
        setInsights([])
      } else {
        setInsights(data.insights || [])
      }
    } catch (err) {
      console.error('Error generating insights:', err)
      setError('Failed to generate insights')
      setInsights([])
    }
    
    setLoading(false)
  }

  // Initial fetch
  useEffect(() => {
    fetchInsights()
  }, [sourceId, pipelineId])

  // Get icon for insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />
      case 'anomaly': return <AlertCircle className="h-4 w-4" />
      case 'pattern': return <BarChart3 className="h-4 w-4" />
      case 'distribution': return <PieChart className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  // Get color for insight confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Handle selecting an insight for action
  const handleSelectInsight = (insight: any) => {
    setSelectedInsight(insight)
  }
  
  // Reset selected insight after action completion
  const handleActionComplete = () => {
    setSelectedInsight(null)
  }

  // Group insights by type
  const groupedInsights = insights.reduce((acc, insight) => {
    const type = insight.type || 'general'
    if (!acc[type]) acc[type] = []
    acc[type].push(insight)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <Card title="Data Insights">
      <p className="text-gray-600 mb-4">
        AI-powered insights and patterns discovered in your data
      </p>
      
      {!selectedInsight ? (
        <>
          <Button 
            className="w-full mb-4"
            variant="primary"
            disabled={loading}
            onClick={fetchInsights}
          >
            {loading ? 'Generating Insights...' : 'Generate New Insights'}
          </Button>
          
          {error ? (
            <div className="text-center py-6">
              <p className="text-lg font-medium mb-2">Could not generate insights</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : insights.length === 0 && !loading ? (
            <div className="text-center py-6">
              <p className="text-lg font-medium mb-2">No insights available</p>
              <p className="text-sm text-gray-600">
                Click "Generate New Insights" to analyze your data and discover patterns.
              </p>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex space-x-1 border-b border-gray-200">
                <TabButton 
                  id="overview" 
                  label="Overview" 
                  active={activeTab === 'overview'} 
                  onClick={() => setActiveTab('overview')}
                />
                <TabButton 
                  id="trends" 
                  label="Trends" 
                  active={activeTab === 'trends'} 
                  onClick={() => setActiveTab('trends')}
                />
                <TabButton 
                  id="patterns" 
                  label="Patterns" 
                  active={activeTab === 'patterns'} 
                  onClick={() => setActiveTab('patterns')}
                />
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {insights.length}
                      </div>
                      <div className="text-sm text-blue-600">Total Insights</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {insights.filter(i => (i.confidence || 0) >= 80).length}
                      </div>
                      <div className="text-sm text-green-600">High Confidence</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Object.keys(groupedInsights).length}
                      </div>
                      <div className="text-sm text-yellow-600">Insight Types</div>
                    </div>
                  </div>

                  {/* Recent Insights */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Insights</h4>
                    {insights.slice(0, 5).map((insight, index) => (
                      <div 
                        key={index} 
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectInsight(insight)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getInsightIcon(insight.type)}
                              <h5 className="font-medium">{insight.title}</h5>
                              <Badge variant="secondary">
                                {insight.type || 'general'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {insight.content}
                            </p>
                            {insight.confidence && (
                              <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                                {insight.confidence}% confidence
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-4">
                  {groupedInsights.trend?.map((insight, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectInsight(insight)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h5 className="font-medium">{insight.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600">{insight.content}</p>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No trend insights available
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'patterns' && (
                <div className="space-y-4">
                  {groupedInsights.pattern?.map((insight, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectInsight(insight)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <h5 className="font-medium">{insight.title}</h5>
                      </div>
                      <p className="text-sm text-gray-600">{insight.content}</p>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No pattern insights available
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <InsightActionPanel
          insight={selectedInsight}
          onActionComplete={handleActionComplete}
          onCancel={() => setSelectedInsight(null)}
        />
      )}
    </Card>
  )
} 