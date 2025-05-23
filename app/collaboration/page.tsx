'use client'

import AppLayout from '../components/layout/AppLayout'
import CollaborationDashboard from '../components/collaboration/CollaborationDashboard'
import { NotificationProvider, NotificationBell } from '../components/collaboration/NotificationSystem'
import Card from '../components/ui/Card'

export default function CollaborationPage() {
  // Current user (in real app, this would come from auth context)
  const currentUser = {
    id: 'current-user',
    name: 'Current User',
    email: 'user@gotham.se'
  }

  return (
    <NotificationProvider currentUser={currentUser}>
      <AppLayout>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Collaboration Center</h1>
            <p className="text-text-secondary">
              Monitor team collaboration, engagement metrics, and real-time activity across all entities
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-sm text-text-secondary">
              Welcome, <span className="font-medium">{currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🚨</div>
              <div className="font-medium">Incidents</div>
              <div className="text-xs text-text-secondary">View active incidents</div>
            </div>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">Missions</div>
              <div className="text-xs text-text-secondary">Browse ongoing missions</div>
            </div>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">Anomalies</div>
              <div className="text-xs text-text-secondary">Check anomaly reports</div>
            </div>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium">All Comments</div>
              <div className="text-xs text-text-secondary">Recent discussions</div>
            </div>
          </Card>
        </div>

        {/* Real-time Status */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="font-medium text-green-800">Real-time Collaboration Active</div>
                <div className="text-sm text-green-600">
                  Live comments, activity tracking, and notifications are enabled
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-green-600">
              <div className="flex items-center gap-1">
                <span>🟢</span>
                <span>WebSocket Connected</span>
              </div>
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>12 Users Online</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card title="💬 Comments & Mentions">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Real-time commenting on all entities</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>@mentions with notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Typing indicators</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Comment editing and deletion</span>
              </div>
            </div>
          </Card>
          
          <Card title="📋 Activity Tracking">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Automatic activity logging</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Status and priority changes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Assignment tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Audit trail and compliance</span>
              </div>
            </div>
          </Card>
          
          <Card title="🔔 Smart Notifications">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Browser push notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Priority-based alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Mention notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Activity summaries</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Dashboard */}
        <CollaborationDashboard />
      </AppLayout>
    </NotificationProvider>
  )
} 