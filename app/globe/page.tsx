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
      <div className="mb-2">
        <h1 className="text-xl font-semibold mb-1">Global View</h1>
        <p className="text-text-secondary text-sm">Enterprise-wide data flow visualization and monitoring</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-secondary/20 mb-3">
        <button
          className={`px-3 py-1.5 font-medium text-xs ${
            activeTab === 'globe' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('globe')}
        >
          Global Map
        </button>
        <button
          className={`px-3 py-1.5 font-medium text-xs ${
            activeTab === 'flows' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('flows')}
        >
          Data Flows
        </button>
        <button
          className={`px-3 py-1.5 font-medium text-xs ${
            activeTab === 'anomalies' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('anomalies')}
        >
          Anomaly Detection
        </button>
        <button
          className={`px-3 py-1.5 font-medium text-xs ${
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
        <div className="mb-3 bg-background-elevated p-2 rounded border border-secondary/20">
          <div className="text-xs font-medium mb-1.5 text-text-secondary">Data Filters</div>
          <div className="flex flex-wrap gap-1.5">
            <Button 
              variant={activeFilter === null ? 'primary' : 'secondary'} 
              size="sm"
              className="text-xs py-1 px-2"
              onClick={() => setActiveFilter(null)}
            >
              All Data
            </Button>
            <Button 
              variant={activeFilter === 'feedback' ? 'primary' : 'secondary'} 
              size="sm"
              className="text-xs py-1 px-2"
              onClick={() => setActiveFilter('feedback')}
            >
              Customer Feedback
            </Button>
            <Button 
              variant={activeFilter === 'churn' ? 'primary' : 'secondary'} 
              size="sm"
              className="text-xs py-1 px-2"
              onClick={() => setActiveFilter('churn')}
            >
              Churn Risk
            </Button>
            <Button 
              variant={activeFilter === 'service' ? 'primary' : 'secondary'} 
              size="sm"
              className="text-xs py-1 px-2"
              onClick={() => setActiveFilter('service')}
            >
              Service Quality
            </Button>
            <Button 
              variant={activeFilter === 'Warehouse' ? 'primary' : 'secondary'} 
              size="sm"
              className="text-xs py-1 px-2"
              onClick={() => setActiveFilter('Warehouse')}
            >
              Warehouse
            </Button>
            <Button 
              variant={activeFilter === 'Office' ? 'primary' : 'secondary'} 
              size="sm"
              className="text-xs py-1 px-2"
              onClick={() => setActiveFilter('Office')}
            >
              Office Locations
            </Button>
          </div>
        </div>
      )}
      
      {/* Content based on active tab */}
      {activeTab === 'globe' && (
        <div className="h-[calc(100vh-300px)]">
          <CDNGlobe initialCategory={activeFilter} />
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
      
      {/* Stats summary - Made much more compact */}
      <div className="grid grid-cols-4 gap-2 mt-2 text-center">
        <div className="bg-background-elevated p-1.5 rounded text-xs border border-secondary/20">
          <div className="text-text-secondary mb-0.5">Datapoints</div>
          <div className="text-lg font-semibold">1,247</div>
        </div>
        
        <div className="bg-background-elevated p-1.5 rounded text-xs border border-secondary/20">
          <div className="text-text-secondary mb-0.5">Flow Rate</div>
          <div className="text-lg font-semibold text-green-500">324 GB/hr</div>
        </div>
        
        <div className="bg-background-elevated p-1.5 rounded text-xs border border-secondary/20">
          <div className="text-text-secondary mb-0.5">Connections</div>
          <div className="text-lg font-semibold text-blue-500">78</div>
        </div>
        
        <div className="bg-background-elevated p-1.5 rounded text-xs border border-secondary/20">
          <div className="text-text-secondary mb-0.5">Anomalies</div>
          <div className="text-lg font-semibold text-yellow-500">12</div>
        </div>
      </div>
    </AppLayout>
  )
} 