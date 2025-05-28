'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GitBranch, 
  Database, 
  Cpu, 
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
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
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
    </CardContent>
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
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        {type === 'bar' ? <BarChart3 className="h-5 w-5" /> : <PieChart className="h-5 w-5" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {data.slice(0, 5).map((item, index) => {
          const maxValue = Math.max(...data.map(d => d.value))
          const percentage = (item.value / maxValue) * 100
          
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
    </CardContent>
  </Card>
)

export function LineageDashboard({ 
  entityId, 
  pipelineId, 
  title = "Lineage Dashboard" 
}: LineageDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const { stats, loading, error } = useLineageStats(entityId, pipelineId)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
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
          value={stats.totalSteps.toLocaleString()}
          icon={GitBranch}
          trend="neutral"
        />
        <StatCard
          title="Aktiva Pipelines"
          value={stats.pipelineCount}
          icon={Cpu}
          trend="neutral"
        />
        <StatCard
          title="Framgångsgrad"
          value={`${stats.successRate}%`}
          icon={CheckCircle}
          trend={stats.successRate > 90 ? 'up' : stats.successRate < 70 ? 'down' : 'neutral'}
        />
        <StatCard
          title="Datakällor"
          value={stats.sourceCount}
          icon={Database}
          trend="neutral"
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="performance">Prestanda</TabsTrigger>
          <TabsTrigger value="sources">Källor</TabsTrigger>
          <TabsTrigger value="activity">Aktivitet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step Types Distribution */}
            <ChartCard
              title="Steg-typer"
              data={stats.stepTypes?.map(st => ({
                label: st.step.replace(/_/g, ' '),
                value: st.count
              })) || []}
              type="bar"
            />

            {/* Success vs Failure */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Framgång vs Misslyckanden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Framgångsrika</span>
                    </div>
                    <span className="font-medium">{stats.successSteps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Misslyckade</span>
                    </div>
                    <span className="font-medium">{stats.failedSteps}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium text-gray-900">Framgångsgrad</span>
                    <Badge variant={stats.successRate > 90 ? 'default' : 'destructive'}>
                      {stats.successRate}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Performance */}
            <ChartCard
              title="Pipeline Prestanda"
              data={stats.pipelinePerformance?.map(pp => ({
                label: pp.pipelineId.substring(0, 20) + (pp.pipelineId.length > 20 ? '...' : ''),
                value: pp.count
              })) || []}
              type="bar"
            />

            {/* Agent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Agent Aktivitet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Agent aktivitetsdata kommer snart...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Distribution */}
            <ChartCard
              title="Källfördelning"
              data={stats.sourceDistribution?.map(sd => ({
                label: sd.source,
                value: sd.count
              })) || []}
              type="bar"
            />

            {/* Source Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Källdetaljer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.sourceDistribution?.slice(0, 5).map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{source.source}</div>
                        <div className="text-sm text-gray-600">{source.count} steg</div>
                      </div>
                      <Badge variant="outline">
                        {Math.round((source.count / stats.totalSteps) * 100)}%
                      </Badge>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daglig Aktivitet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.dailyActivity?.slice(0, 7).map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('sv-SE', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(day.count / Math.max(...stats.dailyActivity.map(d => d.count))) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-gray-900 text-right">
                      {day.count}
                    </div>
                  </div>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Activity */}
      {stats.lastActivity && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Senaste aktivitet: {new Date(stats.lastActivity).toLocaleString('sv-SE')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 