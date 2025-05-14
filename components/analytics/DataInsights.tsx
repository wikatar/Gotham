'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Loader2, TrendingUp, TrendingDown, GitFork, AlertTriangle, BarChart4, Zap } from 'lucide-react'
import InsightActionPanel from './InsightActionPanel'

interface DataInsightsProps {
  sourceId?: string
  pipelineId?: string
}

export default function DataInsights({ sourceId, pipelineId }: DataInsightsProps) {
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>('summary')
  const [error, setError] = useState<string | null>(null)
  const [insightWithAction, setInsightWithAction] = useState<any | null>(null)

  const fetchInsights = async (type: string) => {
    if (!sourceId && !pipelineId) {
      setError('No data source or pipeline specified')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/insights/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          pipelineId,
          type
        }),
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.message || 'Error fetching insights')
        setInsights([])
      } else {
        setInsights(data.insights || [])
      }
    } catch (err) {
      console.error('Error fetching insights:', err)
      setError('Failed to fetch insights')
      setInsights([])
    }
    
    setLoading(false)
  }

  // Fetch insights when tab changes
  useEffect(() => {
    fetchInsights(activeTab)
    setInsightWithAction(null) // Reset action panel when changing tabs
  }, [activeTab, sourceId, pipelineId])
  
  // Get icon for insight type
  const getInsightIcon = (insight: any) => {
    switch (insight.type) {
      case 'trend':
        return insight.percentChange > 0 ? 
          <TrendingUp className="h-5 w-5 text-green-500" /> : 
          <TrendingDown className="h-5 w-5 text-red-500" />
      case 'correlation':
        return <GitFork className="h-5 w-5 text-blue-500" />
      case 'recommendation':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'distribution':
      case 'summary':
      default:
        return <BarChart4 className="h-5 w-5 text-purple-500" />
    }
  }
  
  // Get color for confidence level
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800'
    if (confidence >= 75) return 'bg-blue-100 text-blue-800'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }
  
  // Handle selecting an insight for action
  const handleActionClick = (insight: any) => {
    setInsightWithAction(insight)
  }
  
  // Reset action panel after completion
  const handleActionComplete = () => {
    setInsightWithAction(null)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
        <CardDescription>
          Automated analysis of your cleaned data
        </CardDescription>
      </CardHeader>
      
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Analyzing data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium mb-2">Could not generate insights</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => fetchInsights(activeTab)}
            >
              Try Again
            </Button>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium mb-2">No insights available</p>
            <p className="text-sm text-muted-foreground">
              There isn't enough data for meaningful {activeTab} analysis,
              or the data doesn't have patterns that can be detected for this insight type.
            </p>
          </div>
        ) : (
          <>
            {insightWithAction ? (
              <div className="space-y-4">
                <InsightActionPanel insight={insightWithAction} onActionComplete={handleActionComplete} />
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInsightWithAction(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getInsightIcon(insight)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{insight.title}</h3>
                          <Badge 
                            variant="secondary"
                            className={getConfidenceColor(insight.confidence)}
                          >
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.content}</p>
                        
                        {/* Additional information based on insight type */}
                        {insight.type === 'summary' && insight.stats && (
                          <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                            <div className="bg-muted p-2 rounded">
                              <div className="text-muted-foreground">Average</div>
                              <div className="font-medium">{insight.stats.avg.toFixed(2)}</div>
                            </div>
                            <div className="bg-muted p-2 rounded">
                              <div className="text-muted-foreground">Minimum</div>
                              <div className="font-medium">{insight.stats.min.toFixed(2)}</div>
                            </div>
                            <div className="bg-muted p-2 rounded">
                              <div className="text-muted-foreground">Maximum</div>
                              <div className="font-medium">{insight.stats.max.toFixed(2)}</div>
                            </div>
                            <div className="bg-muted p-2 rounded">
                              <div className="text-muted-foreground">Median</div>
                              <div className="font-medium">{insight.stats.median.toFixed(2)}</div>
                            </div>
                          </div>
                        )}
                        
                        {insight.type === 'correlation' && (
                          <div className="text-xs flex items-center mt-2">
                            <span className="text-muted-foreground mr-2">Correlation coefficient:</span>
                            <span className={`font-medium ${
                              insight.correlation > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {insight.correlation.toFixed(2)}
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={() => handleActionClick(insight)}
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 