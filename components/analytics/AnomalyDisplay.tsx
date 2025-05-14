'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Loader2, AlertCircle, ArrowUpDown, Scan, Zap } from 'lucide-react'
import { Badge } from '../ui/badge'
import InsightActionPanel from './InsightActionPanel'

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
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
          Anomaly Detection
        </CardTitle>
        <CardDescription>
          Identify unusual patterns and outliers in your data
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!selectedAnomaly ? (
          <>
            <div className="flex gap-2 mb-4">
              <div className="w-1/2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Detection method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic</SelectItem>
                    <SelectItem value="iqr">Interquartile Range (IQR)</SelectItem>
                    <SelectItem value="zscore">Z-Score</SelectItem>
                    <SelectItem value="percent">Percentile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-1/2">
                <Select 
                  value={selectedField || ''} 
                  onValueChange={setSelectedField}
                  disabled={availableFields.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All fields" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All fields</SelectItem>
                    {availableFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              className="w-full mb-4"
              variant="default"
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
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : anomalies.length === 0 && !loading ? (
              <div className="text-center py-6">
                <p className="text-lg font-medium mb-2">No anomalies detected</p>
                <p className="text-sm text-muted-foreground">
                  Either there are no anomalies in this dataset, or the selected method
                  couldn't detect any significant outliers.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {anomalies.map((fieldAnomalies, index) => {
                  if (fieldAnomalies.anomalies.length === 0) return null
                  
                  const stats = getFieldStats(fieldAnomalies)
                  
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-3 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{fieldAnomalies.field}</h3>
                          <p className="text-xs text-muted-foreground">
                            {fieldAnomalies.anomalies.length} anomalies detected using {fieldAnomalies.method} method
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {Math.round(fieldAnomalies.anomalies.length / 
                            (fieldAnomalies.totalRows || fieldAnomalies.anomalies.length * 10) * 100)}% are anomalies
                        </Badge>
                      </div>
                      
                      <div className="overflow-auto max-h-48">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-2 font-medium text-xs">Value</th>
                              <th className="text-left p-2 font-medium text-xs">Timestamp</th>
                              <th className="text-left p-2 font-medium text-xs">Other Data</th>
                              <th className="text-left p-2 font-medium text-xs">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fieldAnomalies.anomalies.slice(0, 5).map((anomaly: any, i: number) => (
                              <tr key={i} className={`hover:bg-muted/20 ${
                                getAnomalySeverityColor(anomaly.value, stats.avg, stats.max)
                              }`}>
                                <td className="p-2 font-mono">
                                  {typeof anomaly.value === 'number' 
                                    ? anomaly.value.toFixed(2) 
                                    : anomaly.value}
                                </td>
                                <td className="p-2">
                                  {new Date(anomaly.createdAt).toLocaleString()}
                                </td>
                                <td className="p-2 truncate max-w-[200px]">
                                  {Object.entries(anomaly.row)
                                    .filter(([key]) => key !== fieldAnomalies.field)
                                    .slice(0, 3)
                                    .map(([key, value]) => (
                                      <div key={key} className="text-xs">
                                        <span className="text-muted-foreground">{key}: </span>
                                        <span>{String(value).substring(0, 30)}</span>
                                      </div>
                                    ))}
                                </td>
                                <td className="p-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => handleSelectAnomaly(fieldAnomalies, anomaly)}
                                  >
                                    <Zap className="h-3.5 w-3.5 mr-1" />
                                    Act
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {fieldAnomalies.anomalies.length > 5 && (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          Showing 5 of {fieldAnomalies.anomalies.length} anomalies
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <InsightActionPanel 
              insight={selectedAnomaly} 
              onActionComplete={handleActionComplete}
            />
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAnomaly(null)}
              >
                Back to Anomalies
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 