'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import CDNGlobe from '../components/globe/CDNGlobe'
import EnterpriseDataFlow from '../components/globe/EnterpriseDataFlow'
import AnomalyDetection from '../components/globe/AnomalyDetection'
import GlobalEvents from '../components/globe/GlobalEvents'

export default function GlobePage() {
  const [activeTab, setActiveTab] = useState<'globe' | 'flows' | 'anomalies' | 'events'>('globe')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Global View</h1>
        <p className="text-text-secondary">Enterprise-wide data flow visualization and monitoring</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-secondary/20 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'globe' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('globe')}
        >
          Global Map
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'flows' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('flows')}
        >
          Data Flows
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'anomalies' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('anomalies')}
        >
          Anomaly Detection
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'events' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('events')}
        >
          Global Events
        </button>
      </div>
      
      {/* Filters */}
      {(activeTab === 'globe' || activeTab === 'flows') && (
        <Card 
          title="Data Filters"
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeFilter === null ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveFilter(null)}
            >
              All Data
            </Button>
            <Button 
              variant={activeFilter === 'feedback' ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveFilter('feedback')}
            >
              Customer Feedback
            </Button>
            <Button 
              variant={activeFilter === 'churn' ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveFilter('churn')}
            >
              Churn Indicators
            </Button>
            <Button 
              variant={activeFilter === 'service' ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveFilter('service')}
            >
              Service Metrics
            </Button>
            <Button 
              variant={activeFilter === 'warehouse' ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveFilter('warehouse')}
            >
              Warehouse Data
            </Button>
            <Button 
              variant={activeFilter === 'office' ? 'primary' : 'secondary'} 
              size="sm"
              onClick={() => setActiveFilter('office')}
            >
              Office Locations
            </Button>
          </div>
        </Card>
      )}
      
      {/* Content based on active tab */}
      {activeTab === 'globe' && (
        <div className="h-[calc(100vh-280px)]">
          <CDNGlobe />
        </div>
      )}
      
      {activeTab === 'flows' && (
        <EnterpriseDataFlow filter={activeFilter} />
      )}
      
      {activeTab === 'anomalies' && (
        <AnomalyDetection filter={activeFilter} />
      )}
      
      {activeTab === 'events' && (
        <GlobalEvents filter={activeFilter} />
      )}
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card title="Active Datapoints">
          <div className="text-3xl font-bold">1,247</div>
        </Card>
        
        <Card title="Data Flow Rate">
          <div className="text-3xl font-bold text-green-500">324 GB/hr</div>
        </Card>
        
        <Card title="Active Connections">
          <div className="text-3xl font-bold text-blue-500">78</div>
        </Card>
        
        <Card title="Anomalies Detected">
          <div className="text-3xl font-bold text-yellow-500">12</div>
        </Card>
      </div>
    </AppLayout>
  )
} 