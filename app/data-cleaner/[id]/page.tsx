'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import DataCleaner from '@/components/data/DataCleaner'
import CleanedDataViewer from '@/components/data/CleanedDataViewer'
import Button from '../../components/ui/Button'
import Link from 'next/link'
import Card from '../../components/ui/Card'

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

export default function DataCleanerPage() {
  const params = useParams()
  const sourceId = params.id as string
  const [sourceInfo, setSourceInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('cleaner')

  useEffect(() => {
    setLoading(true)
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
        <h1 className="text-3xl font-bold">Data Cleaner</h1>
        <Link href="/data-sources">
          <Button variant="secondary">Back to Sources</Button>
        </Link>
      </div>

      {loading ? (
        <Card title="Loading...">
          <div className="text-center py-8">Loading source information...</div>
        </Card>
      ) : sourceInfo ? (
        <>
          <div className="mb-6">
            <Card title={sourceInfo.name}>
              <p className="text-sm text-gray-600">
                {sourceInfo.recordCount} records • Created {new Date(sourceInfo.createdAt).toLocaleDateString()}
              </p>
            </Card>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-gray-200 mb-4">
            <TabButton 
              id="cleaner" 
              label="Data Cleaner" 
              active={activeTab === 'cleaner'} 
              onClick={() => setActiveTab('cleaner')}
            />
            <TabButton 
              id="viewer" 
              label="View Cleaned Data" 
              active={activeTab === 'viewer'} 
              onClick={() => setActiveTab('viewer')}
            />
          </div>
          
          {activeTab === 'cleaner' && (
            <DataCleaner sourceId={sourceId} />
          )}
          
          {activeTab === 'viewer' && (
            <CleanedDataViewer sourceId={sourceId} />
          )}
        </>
      ) : (
        <Card title="Source Not Found">
          <p className="text-gray-600 mb-4">
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