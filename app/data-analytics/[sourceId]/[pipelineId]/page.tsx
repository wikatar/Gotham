'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { ArrowLeft, GlobeIcon, LightbulbIcon, AlertCircle } from 'lucide-react'
import AppLayout from '@/app/components/layout/AppLayout'
import CleanedDataGlobe from '@/components/data-viz/CleanedDataGlobe'
import DataInsights from '@/components/analytics/DataInsights'
import AnomalyDisplay from '@/components/analytics/AnomalyDisplay'

// Simple Tab components
const TabButton = ({ id, label, active, icon, onClick }: { 
  id: string; 
  label: string; 
  active: boolean; 
  icon?: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors flex items-center ${
      active
        ? 'bg-blue-500 text-white border-b-2 border-blue-500'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {label}
  </button>
)

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
              <Button variant="secondary" className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Data Analytics</h1>
          </div>
          
          <div className="flex gap-2">
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
          <Card title={`Source: ${sourceInfo.name} • Pipeline: ${pipelineInfo.name}`}>
            <p className="text-sm text-gray-600">
              {sourceInfo.recordCount} original records • {pipelineInfo.steps.length} transformation steps
            </p>
          </Card>
        ) : (
          <Card title="Information Not Found">
            <p className="text-gray-600 mb-4">
              The data source or cleaning pipeline information couldn't be retrieved.
            </p>
          </Card>
        )}
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200 mb-4">
        <TabButton 
          id="globe" 
          label="Globe Visualization" 
          active={activeTab === 'globe'} 
          icon={<GlobeIcon className="h-4 w-4" />}
          onClick={() => setActiveTab('globe')}
        />
        <TabButton 
          id="insights" 
          label="AI Insights" 
          active={activeTab === 'insights'} 
          icon={<LightbulbIcon className="h-4 w-4" />}
          onClick={() => setActiveTab('insights')}
        />
        <TabButton 
          id="anomalies" 
          label="Anomaly Detection" 
          active={activeTab === 'anomalies'} 
          icon={<AlertCircle className="h-4 w-4" />}
          onClick={() => setActiveTab('anomalies')}
        />
      </div>
        
      {activeTab === 'globe' && (
        <div className="space-y-4">
          <CleanedDataGlobe 
            sourceId={sourceId} 
            pipelineId={pipelineId} 
            height="calc(100vh - 250px)"
          />
        </div>
      )}
        
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <DataInsights 
            sourceId={sourceId} 
            pipelineId={pipelineId} 
          />
        </div>
      )}
        
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <AnomalyDisplay 
            sourceId={sourceId} 
            pipelineId={pipelineId} 
          />
        </div>
      )}
    </AppLayout>
  )
} 