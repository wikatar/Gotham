'use client'

import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import DataLineageVisualization from './visualization'

export default function DataLineagePage() {
  const [activeTab, setActiveTab] = useState('visualization')
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Data Lineage</h1>
        <p className="text-text-secondary">
          Track data origins, transformations, and dependencies throughout your analytics pipeline
        </p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary/20 mb-6">
        <nav className="flex space-x-8">
          {['visualization', 'sources', 'transformations', 'impact'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary/30'
              }`}
            >
              {tab === 'visualization' ? 'Flow Visualization' : 
               tab === 'sources' ? 'Source Tracking' : 
               tab === 'transformations' ? 'Transformations' :
               'Impact Analysis'}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Visualization Tab */}
      {activeTab === 'visualization' && (
        <Card title="Data Flow Visualization" className="mb-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Data Flow Visualization</h2>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">
                  Export as PNG
                </Button>
                <Button variant="secondary" size="sm">
                  Filter View
                </Button>
              </div>
            </div>
            
            <div className="h-[600px]">
              <DataLineageVisualization width={800} height={550} />
            </div>
            
            <div className="text-sm text-text-secondary mt-4">
              The data lineage graph visualizes how data flows through your system, from source to destination.
              Drag nodes to rearrange, zoom with mouse wheel, and click on nodes to see details.
            </div>
          </div>
        </Card>
      )}
      
      {/* Other tabs remain mostly unchanged */}
      {activeTab !== 'visualization' && (
        <div className="grid grid-cols-2 gap-6">
          <Card title="Source Tracking">
            <div className="p-4">
              <p className="text-text-secondary mb-4">
                Monitor where your data comes from, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>External databases and APIs</li>
                <li>File uploads and imports</li>
                <li>Manual data entry</li>
                <li>Third-party integrations</li>
              </ul>
            </div>
          </Card>
          
          <Card title="Transformation Tracking">
            <div className="p-4">
              <p className="text-text-secondary mb-4">
                Document all operations performed on your data:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>Cleaning and normalization</li>
                <li>Aggregations and calculations</li>
                <li>Joins and merges</li>
                <li>Data type conversions</li>
              </ul>
            </div>
          </Card>
          
          <Card title="Version History">
            <div className="p-4">
              <p className="text-text-secondary mb-4">
                Keep track of changes to your data models and rules:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>Schema evolution</li>
                <li>Rule modifications</li>
                <li>Model updates</li>
                <li>Configuration changes</li>
              </ul>
            </div>
          </Card>
          
          <Card title="Impact Analysis">
            <div className="p-4">
              <p className="text-text-secondary mb-4">
                Analyze the downstream effects of data changes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-secondary">
                <li>Dependent dashboards and reports</li>
                <li>Affected ML models</li>
                <li>Cross-system dependencies</li>
                <li>Critical business impacts</li>
              </ul>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  )
} 