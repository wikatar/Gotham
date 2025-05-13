'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import AIInsightsPanel from '../components/analytics/AIInsightsPanel'
import PredictiveAnalyticsPanel from '../components/analytics/PredictiveAnalyticsPanel'

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState('insights')

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">AI Insights</h1>
        <p className="text-text-secondary">Leverage AI to gain actionable insights from your data</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary/20 mb-6">
        <nav className="flex space-x-8">
          {['insights', 'predictive', 'anomaly'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary/30'
              }`}
            >
              {tab === 'insights' ? 'AI Insights' : 
               tab === 'predictive' ? 'Predictive Analytics' : 
               'Anomaly Detection'}
            </button>
          ))}
        </nav>
      </div>
      
      {activeTab === 'insights' && <AIInsightsPanel />}
      
      {activeTab === 'predictive' && <PredictiveAnalyticsPanel />}
      
      {activeTab === 'anomaly' && (
        <div className="bg-background-paper rounded-lg p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-30">Anomaly Detection</div>
            <p className="text-text-secondary mb-4">
              Our anomaly detection module is under development. Soon you'll be able to identify unusual patterns and outliers in your data automatically.
            </p>
            <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
              Join Beta Program
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
} 