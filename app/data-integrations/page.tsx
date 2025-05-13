'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useMission } from '../lib/missionContext'
import Link from 'next/link'

export default function DataIntegrationsPage() {
  const { currentMission } = useMission()
  const [activeTab, setActiveTab] = useState('sources')
  
  // Sample data sources for this mission
  const dataSources = [
    { 
      id: 'ds1', 
      name: 'CRM Database', 
      type: 'database', 
      status: 'active',
      lastSync: '2023-09-15T14:30:00Z',
      tables: ['customers', 'deals', 'activities'],
      syncFrequency: '1h'
    },
    { 
      id: 'ds2', 
      name: 'Google Analytics', 
      type: 'api', 
      status: 'active',
      lastSync: '2023-09-15T15:00:00Z',
      metrics: ['sessions', 'pageviews', 'conversions'],
      syncFrequency: '6h'
    },
    { 
      id: 'ds3', 
      name: 'Sales Data CSV', 
      type: 'file', 
      status: 'inactive',
      lastSync: '2023-09-10T09:15:00Z',
      format: 'CSV',
      syncFrequency: 'manual'
    },
    { 
      id: 'ds4', 
      name: 'ERP System', 
      type: 'database', 
      status: 'error',
      lastSync: '2023-09-14T23:30:00Z',
      error: 'Authentication failed',
      syncFrequency: '12h'
    }
  ]
  
  // Sample data transformations
  const transformations = [
    {
      id: 'tr1',
      name: 'Customer Enrichment',
      sources: ['CRM Database', 'Sales Data CSV'],
      description: 'Enrich customer data with sales history',
      steps: 4,
      lastRun: '2023-09-15T12:00:00Z',
      status: 'success'
    },
    {
      id: 'tr2',
      name: 'Marketing Attribution',
      sources: ['Google Analytics', 'CRM Database'],
      description: 'Connect web analytics with customer conversions',
      steps: 7,
      lastRun: '2023-09-15T06:00:00Z',
      status: 'success'
    },
    {
      id: 'tr3',
      name: 'Financial Reporting',
      sources: ['ERP System', 'Sales Data CSV'],
      description: 'Generate financial reports from sales and ERP data',
      steps: 12,
      lastRun: '2023-09-14T23:30:00Z',
      status: 'failed'
    }
  ]
  
  // Sample integrations
  const integrations = [
    { name: 'Databases', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'SQL Server', 'Snowflake'] },
    { name: 'Cloud Services', items: ['AWS S3', 'Google BigQuery', 'Azure Data Lake', 'Redshift'] },
    { name: 'APIs', items: ['REST API', 'GraphQL', 'SOAP', 'Webhook'] },
    { name: 'Analytics Tools', items: ['Google Analytics', 'Mixpanel', 'Amplitude', 'Segment'] },
    { name: 'Business Tools', items: ['Salesforce', 'HubSpot', 'Marketo', 'Zendesk', 'Stripe'] },
    { name: 'Files', items: ['CSV', 'Excel', 'JSON', 'XML', 'Parquet', 'Avro'] }
  ]

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Data Integrations</h1>
        <p className="text-text-secondary">Connect, transform, and manage your data sources</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary/20 mb-6">
        <nav className="flex space-x-8">
          {['sources', 'transformations', 'catalog', 'connectors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary/30'
              }`}
            >
              {tab === 'sources' ? 'Data Sources' : 
               tab === 'transformations' ? 'Transformations' :
               tab === 'catalog' ? 'Data Catalog' : 'Connectors'}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Data Sources Tab */}
      {activeTab === 'sources' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">Your Data Sources</div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Add New Source
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {dataSources.map(source => (
              <div key={source.id} className="bg-background-paper rounded-lg p-4 border border-secondary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        source.status === 'active' ? 'bg-green-500' :
                        source.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'
                      }`}></div>
                      <h3 className="font-medium">{source.name}</h3>
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      Type: <span className="capitalize">{source.type}</span> | Sync: {source.syncFrequency}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      Last synced: {new Date(source.lastSync).toLocaleString()}
                    </div>
                    {source.error && (
                      <div className="text-sm text-red-500 mt-1">
                        Error: {source.error}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Sync Now
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      View Data
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-secondary/10">
                  <div className="flex space-x-2">
                    {source.tables && source.tables.map(table => (
                      <span key={table} className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                        {table}
                      </span>
                    ))}
                    {source.metrics && source.metrics.map(metric => (
                      <span key={metric} className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                        {metric}
                      </span>
                    ))}
                    {source.format && (
                      <span className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                        {source.format}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Transformations Tab */}
      {activeTab === 'transformations' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">Data Transformations</div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Create Transformation
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {transformations.map(transform => (
              <div key={transform.id} className="bg-background-paper rounded-lg p-4 border border-secondary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        transform.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <h3 className="font-medium">{transform.name}</h3>
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {transform.description}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {transform.steps} steps | Last run: {new Date(transform.lastRun).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Run Now
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      View History
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-secondary/10">
                  <div className="text-xs text-text-secondary mb-2">Data Sources:</div>
                  <div className="flex space-x-2">
                    {transform.sources.map(source => (
                      <span key={source} className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10 mb-8">
            <h3 className="font-medium mb-2">ETL/ELT Capabilities</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span> 
                Data extraction from multiple source types
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span> 
                Automated and scheduled data syncing
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span> 
                Data cleansing and normalization
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span> 
                Advanced data transformations with SQL or visual pipelines
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2">✓</span> 
                Data quality validation and error handling
              </li>
            </ul>
          </div>
        </>
      )}
      
      {/* Connectors Tab */}
      {activeTab === 'connectors' && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Available Integrations</h2>
            <p className="text-text-secondary">Connect your data from these sources</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {integrations.map(category => (
              <div key={category.name} className="bg-background-paper rounded-lg p-4 border border-secondary/10">
                <h3 className="font-medium mb-4">{category.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map(item => (
                    <span key={item} className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
            <h3 className="font-medium mb-2">Custom API Integration</h3>
            <p className="text-sm text-text-secondary mb-4">
              Need to connect to a data source not listed here? You can create a custom connector 
              using our API integration framework.
            </p>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Create Custom Connector
            </button>
          </div>
        </>
      )}
      
      {/* Data Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="bg-background-paper rounded-lg p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-30">Data Catalog</div>
            <p className="text-text-secondary mb-4">
              This section is under development. The data catalog will provide a comprehensive view of all your data assets.
            </p>
            <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
              Explore Beta Version
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
} 