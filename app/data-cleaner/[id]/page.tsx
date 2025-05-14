'use client'

import { useParams } from 'next/navigation'
import DataCleaner from '@/components/data/DataCleaner'
import DataCleaningPipelineList from '@/components/data/DataCleaningPipelineList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function DataCleanerPage() {
  const params = useParams()
  const sourceId = params.id as string
  const [sourceInfo, setSourceInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch source information
    fetch(`/api/data/source/info/${sourceId}`)
      .then(res => res.json())
      .then(data => {
        setSourceInfo(data.source)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching source info:', error)
        setLoading(false)
      })
  }, [sourceId])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Cleaning Pipeline</h1>
        <div className="flex gap-2">
          <Link href={`/data-sources`}>
            <Button variant="outline">Back to Sources</Button>
          </Link>
          <Link href={`/pipelines`}>
            <Button variant="outline">View Pipelines</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card className="p-6">
          <div className="text-center py-8">Loading source information...</div>
        </Card>
      ) : sourceInfo ? (
        <>
          <div className="mb-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold">Source: {sourceInfo.name}</h2>
              <p className="text-sm text-muted-foreground">
                {sourceInfo.recordCount} records • Imported on {new Date(sourceInfo.importedAt).toLocaleDateString()}
              </p>
            </Card>
          </div>
          
          <Tabs defaultValue="build" className="space-y-6">
            <TabsList>
              <TabsTrigger value="build">Build Pipeline</TabsTrigger>
              <TabsTrigger value="list">Saved Pipelines</TabsTrigger>
            </TabsList>
            
            <TabsContent value="build" className="space-y-6">
              <DataCleaner sourceId={sourceId} />
            </TabsContent>
            
            <TabsContent value="list" className="space-y-6">
              <DataCleaningPipelineList sourceId={sourceId} />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Data Source Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The data source you're looking for doesn't exist or isn't accessible.
          </p>
          <Link href="/data-sources">
            <Button>View All Data Sources</Button>
          </Link>
        </Card>
      )}
    </div>
  )
} 