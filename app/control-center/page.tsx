'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import HistoricalMetricsChart from '../components/charts/HistoricalMetricsChart'
import ActionFeed from '../components/dashboard/ActionFeed'
import { useIncidentCreation } from '../hooks/useIncidentCreation'

// Mock account ID (replace with proper auth)
const MOCK_ACCOUNT_ID = 'mock-account-id'

// SWR fetcher function
const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function ControlCenterPage() {
  // State for last update time display
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  
  // Filters
  const [showInactiveAgentsOnly, setShowInactiveAgentsOnly] = useState(false)
  const [showCriticalAnomaliesOnly, setShowCriticalAnomaliesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Incident creation hook
  const { createIncident, creating } = useIncidentCreation()
  
  // Fetch the latest snapshot
  const { data: snapshotData, error: snapshotError, mutate: refreshSnapshot } = useSWR(
    '/api/control/snapshot/latest',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )
  
  // Fetch agent statistics
  const { data: agentData, error: agentError, mutate: refreshAgentData } = useSWR(
    `/api/control/agent-stats?accountId=${MOCK_ACCOUNT_ID}`,
    fetcher,
    { refreshInterval: 30000 }
  )
  
  // Fetch anomaly statistics
  const { data: anomalyData, error: anomalyError, mutate: refreshAnomalyData } = useSWR(
    `/api/control/anomaly-stats?accountId=${MOCK_ACCOUNT_ID}`,
    fetcher,
    { refreshInterval: 30000 }
  )
  
  // Update the last update time whenever any data refreshes
  useEffect(() => {
    if (snapshotData?.success || agentData?.success || anomalyData?.success) {
      setLastUpdateTime(new Date())
    }
  }, [snapshotData, agentData, anomalyData])
  
  // Refresh all data
  const handleRefresh = () => {
    refreshSnapshot()
    refreshAgentData()
    refreshAnomalyData()
    setLastUpdateTime(new Date())
  }
  
  // Filter agents based on search and inactive filter
  const filteredAgents = agentData?.data?.agents?.filter(agent => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Filter by inactive status if selected
    const matchesInactiveFilter = !showInactiveAgentsOnly || !agent.hasRecentActivity
    
    return matchesSearch && matchesInactiveFilter
  }) || []
  
  // Filter anomalies based on search and severity filter
  const filteredAnomalies = anomalyData?.data?.latestAnomalies?.filter(anomaly => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      anomaly.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter by critical severity if selected
    const matchesSeverityFilter = !showCriticalAnomaliesOnly || anomaly.severity === 'critical'
    
    return matchesSearch && matchesSeverityFilter
  }) || []
  
  // Helper function to get health status color
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'critical': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }
  
  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  const isLoading = !snapshotData || !agentData || !anomalyData
  const hasError = snapshotError || agentError || anomalyError
  
  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Control Center</h1>
          <p className="text-text-secondary">Real-time monitoring and control of system operations</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-text-secondary">
            {lastUpdateTime ? (
              <>Last updated: {formatDistanceToNow(lastUpdateTime, { addSuffix: true })}</>
            ) : (
              <>Loading data...</>
            )}
          </div>
          <Button 
            variant="secondary" 
            onClick={() => createIncident({
              title: 'Manual Control Center Report',
              description: 'Incident created from Control Center monitoring',
              sourceType: 'manual',
              severity: 'medium',
              tags: ['control-center', 'manual']
            })}
            disabled={creating}
          >
            📋 Create Incident
          </Button>
          <Button variant="secondary" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Error State */}
      {hasError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading data. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="flex justify-center my-12">
          <div className="animate-pulse text-text-secondary">
            Loading control center data...
          </div>
        </div>
      )}
      
      {/* Dashboard Content */}
      {!isLoading && !hasError && (
        <>
          {/* System Health Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card 
              title="System Health" 
              className={`${getHealthColor(snapshotData.data.systemHealthStatus)}`}
            >
              <div className="text-center py-4">
                <div className="text-3xl font-bold mb-2">
                  {snapshotData.data.systemHealthStatus.toUpperCase()}
                </div>
                <div>
                  {snapshotData.data.systemHealthStatus === 'healthy' && 'All systems operational'}
                  {snapshotData.data.systemHealthStatus === 'warning' && 'Some systems need attention'}
                  {snapshotData.data.systemHealthStatus === 'critical' && 'Critical issues detected'}
                </div>
              </div>
            </Card>
            
            <Card title="Agent Status">
              <div className="text-center py-4">
                <div className="flex justify-center gap-6">
                  <div>
                    <div className="text-3xl font-bold text-green-500">
                      {snapshotData.data.activeAgents}
                    </div>
                    <div className="text-sm text-text-secondary">Active</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-500">
                      {snapshotData.data.failedAgents}
                    </div>
                    <div className="text-sm text-text-secondary">Failed</div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card title="Anomalies">
              <div className="text-center py-4">
                <div className="flex justify-center gap-6">
                  <div>
                    <div className="text-3xl font-bold text-orange-500">
                      {snapshotData.data.totalAnomalies - snapshotData.data.resolvedAnomalies}
                    </div>
                    <div className="text-sm text-text-secondary">Active</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-500">
                      {snapshotData.data.resolvedAnomalies}
                    </div>
                    <div className="text-sm text-text-secondary">Resolved</div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card title="Critical Incidents">
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-red-500">
                  {snapshotData.data.criticalIncidents}
                </div>
                <div className="text-sm text-text-secondary">
                  {snapshotData.data.criticalIncidents === 0 
                    ? 'No critical incidents' 
                    : 'Incidents requiring attention'}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Visualization and Action Feed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <HistoricalMetricsChart title="System Metrics History" timeRange={7} />
            </div>
            <div>
              <ActionFeed title="Recent Agent Actions" limit={8} />
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search agents or anomalies..."
                className="w-full px-4 py-2 border border-secondary/30 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInactiveAgentsOnly}
                  onChange={(e) => setShowInactiveAgentsOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Show only inactive agents</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showCriticalAnomaliesOnly}
                  onChange={(e) => setShowCriticalAnomaliesOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Show only critical anomalies</span>
              </label>
            </div>
          </div>
          
          {/* Agents Section */}
          <Card title="Agents" className="mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-secondary/5 border-b border-secondary/10">
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Last Execution</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Last Action</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-center text-sm text-text-secondary">
                        No agents found.
                      </td>
                    </tr>
                  ) : (
                    filteredAgents.map((agent) => (
                      <tr key={agent.id} className="border-b border-secondary/10 hover:bg-secondary/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{agent.name}</div>
                          {agent.description && (
                            <div className="text-xs text-text-secondary">{agent.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            agent.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {agent.triggerType} / {agent.actionType}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {agent.lastExecution ? (
                            <>
                              <div className="whitespace-nowrap">
                                {new Date(agent.lastExecution.createdAt).toLocaleString()}
                              </div>
                              <div className={`text-xs ${
                                agent.lastExecution.status === 'success' 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {agent.lastExecution.status}
                              </div>
                            </>
                          ) : (
                            <span className="text-text-secondary">Never executed</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {agent.lastExecution?.actionTaken || 'No action'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <Button variant="secondary" size="xs">
                              Details
                            </Button>
                            <Button variant="primary" size="xs">
                              Run
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Anomalies Section */}
          <Card title="Latest Anomalies" className="mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-secondary/5 border-b border-secondary/10">
                    <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Severity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Detected</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnomalies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-center text-sm text-text-secondary">
                        No anomalies found.
                      </td>
                    </tr>
                  ) : (
                    filteredAnomalies.map((anomaly) => (
                      <tr key={anomaly.id} className="border-b border-secondary/10 hover:bg-secondary/5">
                        <td className="px-4 py-3">
                          <div className="font-medium">{anomaly.description}</div>
                          {anomaly.resourceType && (
                            <div className="text-xs text-text-secondary">
                              {anomaly.resourceType}: {anomaly.resourceId}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {anomaly.type}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(anomaly.severity)}`}>
                            {anomaly.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {new Date(anomaly.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            anomaly.resolved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {anomaly.resolved ? 'Resolved' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex space-x-2">
                            <a href={anomaly.detailUrl}>
                              <Button variant="secondary" size="xs">
                                Details
                              </Button>
                            </a>
                            {!anomaly.resolved && (
                              <Button variant="primary" size="xs">
                                Resolve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Rules/Triggers Section */}
          <Card title="Active Rules & Triggers">
            <div className="p-4 text-center text-text-secondary">
              <p>Rules and triggers functionality will be available in the next update.</p>
            </div>
          </Card>
        </>
      )}
    </AppLayout>
  )
} 