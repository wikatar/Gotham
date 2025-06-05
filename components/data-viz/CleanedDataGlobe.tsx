'use client'

import { useState, useEffect } from 'react'
import Card from '../../app/components/ui/Card'
import Button from '../../app/components/ui/Button'
import { Globe, BarChart3, PieChart, TrendingUp, Download, Maximize2 } from 'lucide-react'

// Simple Tab components
const TabButton = ({ id, label, active, onClick }: { 
  id: string; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
      active
        ? 'bg-blue-500 text-white border-b-2 border-blue-500'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
)

interface CleanedDataGlobeProps {
  sourceId: string
  pipelineId?: string
}

export default function CleanedDataGlobe({ sourceId, pipelineId }: CleanedDataGlobeProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('globe')
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/data/visualization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          pipelineId,
          type: 'globe'
        }),
      })
      
      const result = await response.json()
      
      if (result.error) {
        setError(result.message || 'Error loading visualization data')
        setData(null)
      } else {
        setData(result.data)
      }
    } catch (err) {
      console.error('Error fetching visualization data:', err)
      setError('Failed to load visualization data')
      setData(null)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [sourceId, pipelineId])

  const downloadData = () => {
    if (!data) return
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cleaned-data-${sourceId}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card title="Data Visualization">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
            {data && (
              <Button
                variant="secondary"
                onClick={downloadData}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
          
          <Button variant="secondary">
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-gray-200">
          <TabButton 
            id="globe" 
            label="Globe View" 
            active={activeTab === 'globe'} 
            onClick={() => setActiveTab('globe')}
          />
          <TabButton 
            id="charts" 
            label="Charts" 
            active={activeTab === 'charts'} 
            onClick={() => setActiveTab('charts')}
          />
          <TabButton 
            id="stats" 
            label="Statistics" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
          />
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium mb-2">Could not load visualization</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchData}>
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading visualization data...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No visualization data available</p>
          </div>
        ) : (
          <>
            {activeTab === 'globe' && (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Interactive Globe View</h3>
                  <p className="text-gray-600 mb-4">
                    3D visualization of your cleaned data points across geographical locations
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-3 rounded">
                      <div className="font-medium">Data Points</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {data.totalPoints?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="font-medium">Countries</div>
                      <div className="text-2xl font-bold text-green-600">
                        {data.countries?.length || 0}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="font-medium">Regions</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {data.regions?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
                
                {data.topLocations && (
                  <div>
                    <h4 className="font-medium mb-3">Top Locations</h4>
                    <div className="space-y-2">
                      {data.topLocations.slice(0, 5).map((location: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{location.name}</span>
                          <span className="text-sm text-gray-600">{location.count} points</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Distribution Chart</h4>
                    <p className="text-sm text-gray-600">
                      Data distribution across different categories
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <PieChart className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Category Breakdown</h4>
                    <p className="text-sm text-gray-600">
                      Proportional view of data categories
                    </p>
                  </div>
                </div>
                
                {data.chartData && (
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Data Trends</h4>
                    <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Chart visualization would appear here</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-blue-600">Total Records</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {data.totalRecords?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-sm text-green-600">Clean Records</div>
                    <div className="text-2xl font-bold text-green-800">
                      {data.cleanRecords?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded">
                    <div className="text-sm text-yellow-600">Data Quality</div>
                    <div className="text-2xl font-bold text-yellow-800">
                      {data.qualityScore || 0}%
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <div className="text-sm text-purple-600">Completeness</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {data.completeness || 0}%
                    </div>
                  </div>
                </div>
                
                {data.fieldStats && (
                  <div>
                    <h4 className="font-medium mb-3">Field Statistics</h4>
                    <div className="space-y-2">
                      {Object.entries(data.fieldStats).map(([field, stats]: [string, any]) => (
                        <div key={field} className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{field}</span>
                            <span className="text-sm text-gray-600">{stats.type}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Unique: </span>
                              <span className="font-medium">{stats.unique}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Null: </span>
                              <span className="font-medium">{stats.null}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Valid: </span>
                              <span className="font-medium">{stats.valid}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
} 