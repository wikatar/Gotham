'use client'

import { useParams } from 'next/navigation'
import CleanedDataViewer from '@/components/data/CleanedDataViewer'
import Link from 'next/link'
import Button from '../../../components/ui/Button'
import { useState, useEffect } from 'react'
import Card from '../../../components/ui/Card'

export default function CleanedDataPage() {
  const params = useParams()
  const sourceId = params.sourceId as string
  const pipelineId = params.pipelineId as string
  const [sourceInfo, setSourceInfo] = useState<any>(null)
  const [pipelineInfo, setPipelineInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cleaned Data</h1>
        <div className="flex gap-2">
          <Link href={`/data-cleaner/${sourceId}`}>
            <Button variant="secondary">Back to Cleaner</Button>
          </Link>
          <Link href={`/data-sources`}>
            <Button variant="secondary">All Sources</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card title="Loading...">
          <div className="text-center py-8">Loading information...</div>
        </Card>
      ) : sourceInfo && pipelineInfo ? (
        <>
          <div className="mb-6">
            <Card title={`Source: ${sourceInfo.name} • Pipeline: ${pipelineInfo.name}`}>
              <p className="text-sm text-gray-600">
                {sourceInfo.recordCount} original records • Cleaned with {pipelineInfo.steps.length} transformation steps
              </p>
            </Card>
          </div>
          
          <CleanedDataViewer sourceId={sourceId} pipelineId={pipelineId} />
        </>
      ) : (
        <Card title="Information Not Found">
          <p className="text-gray-600 mb-4">
            The data source or cleaning pipeline you're looking for doesn't exist or isn't accessible.
          </p>
          <Link href="/data-sources">
            <Button>View All Data Sources</Button>
          </Link>
        </Card>
      )}
    </div>
  )
} 