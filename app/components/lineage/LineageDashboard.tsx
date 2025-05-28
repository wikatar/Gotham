'use client'

import React, { useState } from 'react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { 
  GitBranch, 
  Database, 
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'
import { useLineageStats } from '@/app/hooks/useLineage'

interface LineageDashboardProps {
  entityId?: string
  pipelineId?: string
  title?: string
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: { 
  title: string
  value: string | number
  change?: string
  icon: any
  trend?: 'up' | 'down' | 'neutral'
}) => (
  <Card title={title}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </Card>
)

const ChartCard = ({ 
  title, 
  data, 
  type = 'bar' 
}: { 
  title: string
  data: Array<{ label: string; value: number }>
  type?: 'bar' | 'pie'
}) => (
  <Card 
    title={
      <div className="flex items-center gap-2">
        {type === 'bar' ? <BarChart3 className="h-5 w-5" /> : <PieChart className="h-5 w-5" />}
        {title}
      </div>
    }
  >
    <div className="space-y-3">
      {data.slice(0, 5).map((item, index) => {
        const maxValue = Math.max(...data.map(d => d.value))
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        
        return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 truncate">
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-gray-900 text-right">
              {item.value}
            </div>
          </div>
        )
      })}
    </div>
  </Card>
)

export function LineageDashboard({ 
  entityId, 
  pipelineId, 
  title = "Lineage Dashboard" 
}: LineageDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')
  const { stats, loading, error } = useLineageStats(entityId, pipelineId)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} title="Laddar...">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Fel vid laddning</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  const mockStepTypes = [
    { step: 'data_extraction', count: 45 },
    { step: 'data_cleaning', count: 38 },
    { step: 'data_transformation', count: 32 },
    { step: 'data_validation', count: 28 },
    { step: 'data_loading', count: 25 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Översikt för de senaste {timeRange === '7d' ? '7 dagarna' : timeRange === '30d' ? '30 dagarna' : '90 dagarna'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border rounded px-3 py-1"
          >
            <option value="7d">7 dagar</option>
            <option value="30d">30 dagar</option>
            <option value="90d">90 dagar</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Totala Steg"
          value={stats.totalSteps?.toLocaleString() || '0'}
          icon={GitBranch}
          trend="neutral"
        />
        <StatCard
          title="Aktiva Pipelines"
          value={stats.pipelineCount || 0}
          icon={Database}
          trend="neutral"
        />
        <StatCard
          title="Framgångsgrad"
          value={`${stats.successRate || 0}%`}
          icon={CheckCircle}
          trend={stats.successRate > 90 ? 'up' : stats.successRate < 70 ? 'down' : 'neutral'}
        />
        <StatCard
          title="Datakällor"
          value={stats.sourceCount || 0}
          icon={Database}
          trend="neutral"
        />
      </div>

      {/* Simple Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'performance', 'sources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'overview' && 'Översikt'}
              {tab === 'performance' && 'Prestanda'}
              {tab === 'sources' && 'Källor'}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step Types Distribution */}
          <ChartCard
            title="Steg-typer"
            data={mockStepTypes.map(st => ({
              label: st.step.replace(/_/g, ' '),
              value: st.count
            }))}
            type="bar"
          />

          {/* Success vs Failure */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Framgång vs Misslyckanden
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Framgångsrika</span>
                </div>
                <span className="font-medium">{Math.floor(stats.totalSteps * (stats.successRate / 100)) || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Misslyckade</span>
                </div>
                <span className="font-medium">{Math.floor(stats.totalSteps * ((100 - stats.successRate) / 100)) || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Prestanda-mätvärden">
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Prestanda-data kommer snart</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 gap-6">
          <Card title="Datakällor">
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Käll-analys kommer snart</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
} 