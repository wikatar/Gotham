'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArrowLeft, GlobeIcon, LightbulbIcon, AlertCircle } from 'lucide-react'
import AppLayout from '@/app/components/layout/AppLayout'
import CleanedDataGlobe from '@/components/data-viz/CleanedDataGlobe'
import DataInsights from '@/components/analytics/DataInsights'
import AnomalyDisplay from '@/components/analytics/AnomalyDisplay'

export default function DataAnalyticsPage() {
  const params = useParams()
  const sourceId = params.sourceId as string
  const pipelineId = params.pipelineId as string
  const [sourceInfo, setSourceInfo] = useState<any>(null)
  const [pipelineInfo, setPipelineInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('globe')

  useEffect(() => {
    setLoading(true)
    // Fetch source information
    fetch(`/api/data/source/info/${sourceId}`)
      .then(res => res.json())
      .then(data => {
        setSourceInfo(data.source)
        
        // Fetch pipeline information
        return fetch('/api/data/cleaning/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pipelineId }),
        })
      })
      .then(res => res.json())
      .then(data => {
        setPipelineInfo(data.pipeline)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching information:', error)
        setLoading(false)
      })
  }, [sourceId, pipelineId])

  return (
    <AppLayout>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Link href={`/data-cleaned/${sourceId}/${pipelineId}`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Data Analytics</h1>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/data-sources`}>
              <Button variant="outline">All Sources</Button>
            </Link>
          </div>
        </div>
        
        {loading ? (
          <Card className="p-6">
            <div className="text-center py-8">Loading information...</div>
          </Card>
        ) : sourceInfo && pipelineInfo ? (
          <Card className="p-4">
            <h2 className="text-lg font-semibold">
              Source: {sourceInfo.name} • Pipeline: {pipelineInfo.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {sourceInfo.recordCount} original records • {pipelineInfo.steps.length} transformation steps
            </p>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Information Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The data source or cleaning pipeline information couldn't be retrieved.
            </p>
          </Card>
        )}
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="globe" className="flex items-center">
            <GlobeIcon className="h-4 w-4 mr-2" />
            Globe Visualization
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <LightbulbIcon className="h-4 w-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Anomaly Detection
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="globe" className="space-y-4">
          <CleanedDataGlobe 
            sourceId={sourceId} 
            pipelineId={pipelineId} 
            height="calc(100vh - 250px)"
          />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          <DataInsights 
            sourceId={sourceId} 
            pipelineId={pipelineId} 
          />
        </TabsContent>
        
        <TabsContent value="anomalies" className="space-y-4">
          <AnomalyDisplay 
            sourceId={sourceId} 
            pipelineId={pipelineId} 
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
} 