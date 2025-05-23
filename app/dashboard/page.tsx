'use client'

import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Overview of your Monolith Analytics system</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Active Agents" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Active Agents</div>
          <div className="text-3xl font-bold text-primary">12</div>
        </Card>
        
        <Card title="Data Sources" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Connected Sources</div>
          <div className="text-3xl font-bold text-blue-500">8</div>
        </Card>
        
        <Card title="Anomalies" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Detected Today</div>
          <div className="text-3xl font-bold text-yellow-500">3</div>
        </Card>
        
        <Card title="System Health" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Overall Status</div>
          <div className="text-3xl font-bold text-green-500">98%</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity">
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/5 rounded">
                <div>
                  <div className="font-medium">Agent executed workflow</div>
                  <div className="text-sm text-text-secondary">Sales Pipeline Agent - 2 minutes ago</div>
                </div>
                <div className="text-green-500">✓</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/5 rounded">
                <div>
                  <div className="font-medium">Data sync completed</div>
                  <div className="text-sm text-text-secondary">Customer Database - 15 minutes ago</div>
                </div>
                <div className="text-green-500">✓</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary/5 rounded">
                <div>
                  <div className="font-medium">Anomaly detected</div>
                  <div className="text-sm text-text-secondary">User Behavior Pattern - 1 hour ago</div>
                </div>
                <div className="text-yellow-500">!</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="p-4">
            <div className="space-y-3">
              <button className="w-full p-3 bg-primary/10 text-primary rounded hover:bg-primary/20 text-left">
                🤖 Create New Agent
              </button>
              <button className="w-full p-3 bg-secondary/10 text-text-primary rounded hover:bg-secondary/20 text-left">
                📋 Start New Mission
              </button>
              <button className="w-full p-3 bg-secondary/10 text-text-primary rounded hover:bg-secondary/20 text-left">
                🔌 Add Data Source
              </button>
              <button className="w-full p-3 bg-secondary/10 text-text-primary rounded hover:bg-secondary/20 text-left">
                🧠 Build Semantic Model
              </button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
} 