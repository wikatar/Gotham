'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useMission } from '../lib/missionContext'

export default function AnalyticsPage() {
  const { currentMission, activeDataSources } = useMission()
  const [selectedTimeRange, setSelectedTimeRange] = useState('week')
  const [selectedTab, setSelectedTab] = useState('trends')
  
  // Sample analytics metrics
  const metrics = [
    { name: 'Active Users', value: '4,328', change: '+12%', timeFrame: 'from last week' },
    { name: 'Conversion Rate', value: '3.6%', change: '+0.8%', timeFrame: 'from last month' },
    { name: 'Avg. Session Time', value: '4m 23s', change: '-0:18', timeFrame: 'from yesterday' },
    { name: 'Bounce Rate', value: '32%', change: '-3%', timeFrame: 'from last quarter' },
  ]
  
  // Sample trends data
  const trends = [
    { 
      name: 'Revenue Growth', 
      status: 'positive', 
      description: 'Steady increase over the past 3 months',
      confidence: 92
    },
    { 
      name: 'User Retention', 
      status: 'neutral', 
      description: 'Stable with slight fluctuations', 
      confidence: 78
    },
    { 
      name: 'Cost Efficiency', 
      status: 'positive', 
      description: 'Improving steadily since operational changes',
      confidence: 85
    },
    { 
      name: 'Market Share', 
      status: 'negative', 
      description: 'Decreasing in the southeast region',
      confidence: 73
    },
    { 
      name: 'Product Adoption', 
      status: 'positive', 
      description: 'New features show strong uptake',
      confidence: 89
    }
  ]
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Analytics</h1>
        <p className="text-text-secondary">Advanced metrics and trend analysis</p>
      </div>
      
      {/* Time Range Selector */}
      <div className="flex mb-8">
        <div className="bg-background-paper rounded-lg p-1 inline-flex">
          {['day', 'week', 'month', 'quarter', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                selectedTimeRange === range
                  ? 'bg-primary text-text-primary'
                  : 'text-text-secondary hover:bg-secondary/10'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary/20 mb-6">
        <nav className="flex space-x-8">
          {['trends', 'metrics', 'forecasts', 'comparisons'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary/30'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(metric => (
          <div key={metric.name} className="bg-background-paper rounded-lg p-4 shadow-sm">
            <div className="text-sm text-text-secondary mb-1">{metric.name}</div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-semibold">{metric.value}</div>
              <div className={`text-sm ${metric.change.startsWith('+') ? 'text-green-500' : metric.change.startsWith('-') ? 'text-red-500' : 'text-text-secondary'}`}>
                {metric.change} {metric.timeFrame}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Trends Analysis */}
      {selectedTab === 'trends' && (
        <div className="bg-background-paper rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Trend Analysis</h3>
          <div className="space-y-4">
            {trends.map(trend => (
              <div key={trend.name} className="flex items-center border-b border-secondary/10 pb-4">
                <div className={`w-2 h-10 rounded-full mr-4 ${
                  trend.status === 'positive' ? 'bg-green-500' :
                  trend.status === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium">{trend.name}</div>
                    <div className="text-sm text-text-secondary">
                      Confidence: {trend.confidence}%
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary mt-1">{trend.description}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-secondary/20">
            <div className="text-sm text-text-secondary">
              These trends are based on {activeDataSources.length} active data sources and AI analysis.
              {currentMission && currentMission.name && ` Analysis context: ${currentMission.name}`}
            </div>
          </div>
        </div>
      )}
      
      {/* Other tabs would be implemented here */}
      {selectedTab !== 'trends' && (
        <div className="bg-background-paper rounded-lg p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-30">{selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}</div>
            <p className="text-text-secondary">
              This section is under development. Check back soon!
            </p>
          </div>
        </div>
      )}
      
      {/* Data Source Connection */}
      <div className="mt-8 bg-secondary/5 rounded-lg p-4 border border-secondary/10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Analytics Data Sources</h3>
            <p className="text-sm text-text-secondary mt-1">
              {activeDataSources.length === 0 
                ? 'No data sources are currently selected for analysis'
                : `${activeDataSources.length} data sources are being analyzed`}
            </p>
          </div>
          <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
            Configure
          </button>
        </div>
      </div>
    </AppLayout>
  )
} 