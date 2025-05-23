'use client'

import { useState, useEffect } from 'react'
import Card from '../ui/Card'

interface CollaborationStats {
  totalComments: number
  totalActivities: number
  activeUsers: number
  todayComments: number
  todayActivities: number
  engagementRate: number
  topContributors: Array<{
    name: string
    email: string
    comments: number
    activities: number
  }>
  entityBreakdown: Array<{
    entityType: string
    count: number
  }>
  recentActivity: Array<{
    id: string
    type: 'comment' | 'activity'
    description: string
    timestamp: string
    entityType: string
    entityId: string
  }>
}

interface CollaborationDashboardProps {
  className?: string
}

export default function CollaborationDashboard({ className = '' }: CollaborationDashboardProps) {
  const [stats, setStats] = useState<CollaborationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    fetchCollaborationStats()
  }, [timeRange])

  const fetchCollaborationStats = async () => {
    setLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockStats: CollaborationStats = {
        totalComments: 1247,
        totalActivities: 3891,
        activeUsers: 28,
        todayComments: 15,
        todayActivities: 42,
        engagementRate: 73,
        topContributors: [
          { name: 'Anna Andersson', email: 'anna@gotham.se', comments: 134, activities: 267 },
          { name: 'Björn Bergström', email: 'bjorn@gotham.se', comments: 98, activities: 201 },
          { name: 'Cecilia Carlsson', email: 'cecilia@gotham.se', comments: 87, activities: 178 },
          { name: 'David Davidsson', email: 'david@gotham.se', comments: 76, activities: 145 },
          { name: 'Emma Eriksson', email: 'emma@gotham.se', comments: 65, activities: 123 }
        ],
        entityBreakdown: [
          { entityType: 'incident', count: 456 },
          { entityType: 'mission', count: 312 },
          { entityType: 'anomaly', count: 278 },
          { entityType: 'agent', count: 145 },
          { entityType: 'execution', count: 89 }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'comment',
            description: 'Anna Andersson kommenterade på incident "Database Performance Issue"',
            timestamp: '2024-01-15T10:30:00Z',
            entityType: 'incident',
            entityId: 'inc-001'
          },
          {
            id: '2',
            type: 'activity',
            description: 'Björn Bergström ändrade status på mission "Q1 Security Audit"',
            timestamp: '2024-01-15T10:15:00Z',
            entityType: 'mission',
            entityId: 'mis-002'
          },
          {
            id: '3',
            type: 'comment',
            description: 'Cecilia Carlsson nämnde @David Davidsson i anomaly "Traffic Spike"',
            timestamp: '2024-01-15T09:45:00Z',
            entityType: 'anomaly',
            entityId: 'ano-003'
          }
        ]
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Error fetching collaboration stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ]
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'incident': return '🚨'
      case 'mission': return '🎯'
      case 'anomaly': return '⚡'
      case 'agent': return '🤖'
      case 'execution': return '⚙️'
      default: return '📋'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬'
      case 'activity': return '📋'
      default: return '📋'
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-2">❌</div>
        <p className="text-text-secondary">Failed to load collaboration stats</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Collaboration Analytics</h2>
          <p className="text-text-secondary">Team engagement and activity insights</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-secondary/10 text-text-secondary hover:bg-secondary/20'
              }`}
            >
              {range === '7d' && 'Last 7 days'}
              {range === '30d' && 'Last 30 days'}
              {range === '90d' && 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-text-secondary text-sm mb-1">Total Comments</div>
          <div className="text-3xl font-bold text-blue-500">{stats.totalComments.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">+{stats.todayComments} today</div>
        </Card>
        
        <Card>
          <div className="text-text-secondary text-sm mb-1">Total Activities</div>
          <div className="text-3xl font-bold text-purple-500">{stats.totalActivities.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">+{stats.todayActivities} today</div>
        </Card>
        
        <Card>
          <div className="text-text-secondary text-sm mb-1">Active Users</div>
          <div className="text-3xl font-bold text-green-500">{stats.activeUsers}</div>
          <div className="text-xs text-text-secondary mt-1">in last {timeRange}</div>
        </Card>
        
        <Card>
          <div className="text-text-secondary text-sm mb-1">Engagement Rate</div>
          <div className="text-3xl font-bold text-orange-500">{stats.engagementRate}%</div>
          <div className="text-xs text-green-600 mt-1">+5% vs last period</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors */}
        <Card title="Top Contributors">
          <div className="space-y-3">
            {stats.topContributors.map((contributor, index) => (
              <div key={contributor.email} className="flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-text-secondary w-4">#{index + 1}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(contributor.email)}`}>
                    {getInitials(contributor.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{contributor.name}</div>
                    <div className="text-xs text-text-secondary">{contributor.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{contributor.comments + contributor.activities}</div>
                  <div className="text-xs text-text-secondary">
                    {contributor.comments}💬 {contributor.activities}📋
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Entity Breakdown */}
        <Card title="Activity by Entity Type">
          <div className="space-y-3">
            {stats.entityBreakdown.map((entity) => (
              <div key={entity.entityType} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEntityIcon(entity.entityType)}</span>
                  <span className="text-sm font-medium capitalize">{entity.entityType}s</span>
                </div>
                <div className="text-sm font-medium">{entity.count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-3">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="text-lg">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="text-sm">{activity.description}</div>
                <div className="text-xs text-text-secondary mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-text-secondary">
                {getEntityIcon(activity.entityType)} {activity.entityType}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button className="text-sm text-primary hover:text-primary/80">
            View all activity →
          </button>
        </div>
      </Card>
    </div>
  )
} 