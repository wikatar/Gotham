'use client'

import { useState, useEffect } from 'react'
import Card from '../../app/components/ui/Card'
import Button from '../../app/components/ui/Button'
import Badge from '../../app/components/ui/Badge'
import { Loader2, AlertCircle, ArrowUpDown, Scan, Zap } from 'lucide-react'
import InsightActionPanel from './InsightActionPanel'

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

interface AnomalyDisplayProps {
  sourceId?: string
  pipelineId?: string
}

export default function AnomalyDisplay({ sourceId, pipelineId }: AnomalyDisplayProps) {
  const [loading, setLoading] = useState(false)
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [method, setMethod] = useState<string>('auto')
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [availableFields, setAvailableFields] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedAnomaly, setSelectedAnomaly] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState('detection')

  const fetchAnomalies = async () => {
    if (!sourceId && !pipelineId) {
      setError('No data source or pipeline specified')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const requestBody: any = {
        method
      }
      
      if (sourceId) requestBody.sourceId = sourceId
      if (pipelineId) requestBody.pipelineId = pipelineId
      if (selectedField) requestBody.field = selectedField
      
      const response = await fetch('/api/insights/anomaly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.message || 'Error detecting anomalies')
        setAnomalies([])
      } else {
        setAnomalies(data.anomalies || [])
        
        // Extract available fields if we don't have them yet
        if (availableFields.length === 0 && data.anomalies && data.anomalies.length > 0) {
          setAvailableFields(data.anomalies.map((a: any) => a.field))
        }
      }
    } catch (err) {
      console.error('Error detecting anomalies:', err)
      setError('Failed to detect anomalies')
      setAnomalies([])
    }
    
    setLoading(false)
  }

  // Initial fetch
  useEffect(() => {
    fetchAnomalies()
  }, [sourceId, pipelineId])

  // Get the background color for the severity of the anomaly
  const getAnomalySeverityColor = (value: number, avg: number, max: number) => {
    const normalizedValue = Math.abs((value - avg) / (max - avg))
    
    if (normalizedValue > 0.7) return 'bg-red-100'
    if (normalizedValue > 0.4) return 'bg-yellow-100'
    return 'bg-blue-100'
  }

  // Calculate some stats for a field's anomalies
  const getFieldStats = (fieldAnomalies: any) => {
    const values = fieldAnomalies.anomalies.map((a: any) => a.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const sum = values.reduce((a: number, b: number) => a + b, 0)
    const avg = sum / values.length
    
    return { min, max, avg }
  }
  
  // Handle selecting an anomaly for action
  const handleSelectAnomaly = (fieldAnomalies: any, anomaly: any) => {
    // Format the anomaly for the action panel
    const formattedAnomaly = {
      ...anomaly,
      field: fieldAnomalies.field,
      type: 'anomaly',
      title: `Anomaly in ${fieldAnomalies.field}`,
      content: `Detected an anomaly with value ${anomaly.value} using ${fieldAnomalies.method} method. This is outside the normal range for this field.`,
      confidence: 90, // Default confidence for anomalies
      method: fieldAnomalies.method
    }
    
    setSelectedAnomaly(formattedAnomaly)
  }
  
  // Reset selected anomaly after action completion
  const handleActionComplete = () => {
    setSelectedAnomaly(null)
  }

  return (
    <Card title="Anomaly Detection">
      <p className="text-gray-600 mb-4">
        Identify unusual patterns and outliers in your data
      </p>
      
      {!selectedAnomaly ? (
        <>
          <div className="flex gap-2 mb-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-2">Detection Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="auto">Automatic</option>
                <option value="iqr">Interquartile Range (IQR)</option>
                <option value="zscore">Z-Score</option>
                <option value="percent">Percentile</option>
              </select>
            </div>
            
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-2">Field</label>
              <select
                value={selectedField || ''}
                onChange={(e) => setSelectedField(e.target.value || null)}
                disabled={availableFields.length === 0}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">All fields</option>
                {availableFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </div>
          
          <Button 
            className="w-full mb-4"
            variant="primary"
            disabled={loading}
            onClick={fetchAnomalies}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting Anomalies...
              </>
            ) : (
              <>
                <Scan className="mr-2 h-4 w-4" />
                Detect Anomalies
              </>
            )}
          </Button>
          
          {error ? (
            <div className="text-center py-6">
              <p className="text-lg font-medium mb-2">Could not detect anomalies</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : anomalies.length === 0 && !loading ? (
            <div className="text-center py-6">
              <p className="text-lg font-medium mb-2">No anomalies detected</p>
              <p className="text-sm text-gray-600">
                Either there are no anomalies in this dataset, or the selected method
                couldn't detect any significant outliers.
              </p>
            </div>
          ) : anomalies.length > 0 ? (
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex space-x-1 border-b border-gray-200">
                <TabButton 
                  id="detection" 
                  label="Detection Results" 
                  active={activeTab === 'detection'} 
                  onClick={() => setActiveTab('detection')}
                />
                <TabButton 
                  id="summary" 
                  label="Summary" 
                  active={activeTab === 'summary'} 
                  onClick={() => setActiveTab('summary')}
                />
              </div>

              {activeTab === 'detection' && (
                <div className="space-y-4">
                  {anomalies.map((fieldAnomalies, index) => {
                    const stats = getFieldStats(fieldAnomalies)
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-lg">{fieldAnomalies.field}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {fieldAnomalies.method}
                            </Badge>
                            <Badge variant="outline">
                              {fieldAnomalies.anomalies.length} anomalies
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          Range: {stats.min.toFixed(2)} - {stats.max.toFixed(2)} | 
                          Average: {stats.avg.toFixed(2)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {fieldAnomalies.anomalies.map((anomaly: any, anomalyIndex: number) => (
                            <div 
                              key={anomalyIndex}
                              className={`p-3 rounded border cursor-pointer hover:shadow-sm ${getAnomalySeverityColor(anomaly.value, stats.avg, stats.max)}`}
                              onClick={() => handleSelectAnomaly(fieldAnomalies, anomaly)}
                            >
                              <div className="font-medium">{anomaly.value}</div>
                              {anomaly.index !== undefined && (
                                <div className="text-xs text-gray-600">Row {anomaly.index}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {anomalies.length}
                      </div>
                      <div className="text-sm text-blue-600">Fields with Anomalies</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {anomalies.reduce((sum, field) => sum + field.anomalies.length, 0)}
                      </div>
                      <div className="text-sm text-yellow-600">Total Anomalies</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {method.toUpperCase()}
                      </div>
                      <div className="text-sm text-green-600">Detection Method</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {anomalies.map((fieldAnomalies, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{fieldAnomalies.field}</span>
                        <Badge variant="secondary">
                          {fieldAnomalies.anomalies.length} anomalies
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <InsightActionPanel
          insight={selectedAnomaly}
          onActionComplete={handleActionComplete}
          onCancel={() => setSelectedAnomaly(null)}
        />
      )}
    </Card>
  )
} 