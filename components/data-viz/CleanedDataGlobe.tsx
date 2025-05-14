'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '../ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import of globe component from app
const GlobeVisualization = dynamic(() => import('@/app/components/globe/GlobeVisualization'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
})

interface CleanedDataGlobeProps {
  sourceId?: string
  pipelineId?: string
  height?: string
}

export default function CleanedDataGlobe({ 
  sourceId, 
  pipelineId, 
  height = 'calc(100vh - 300px)'
}: CleanedDataGlobeProps) {
  const [loading, setLoading] = useState(true)
  const [geoData, setGeoData] = useState<any>(null)
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [showAnomalies, setShowAnomalies] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch geo data
  useEffect(() => {
    setLoading(true)
    setError(null)
    
    // Construct the request body
    const requestBody: any = {}
    if (sourceId) requestBody.sourceId = sourceId
    if (pipelineId) requestBody.pipelineId = pipelineId
    
    fetch('/api/data/cleaned/globe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.message || 'Error fetching geographic data')
          setGeoData(null)
        } else {
          setGeoData(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching geo data:', err)
        setError('Failed to load geographic data')
        setGeoData(null)
        setLoading(false)
      })
  }, [sourceId, pipelineId])

  // Fetch anomalies when needed
  const fetchAnomalies = async () => {
    if (!sourceId && !pipelineId) return
    
    try {
      const requestBody: any = {}
      if (sourceId) requestBody.sourceId = sourceId
      if (pipelineId) requestBody.pipelineId = pipelineId
      requestBody.method = 'iqr' // Use IQR method for anomaly detection
      
      const response = await fetch('/api/insights/anomaly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      if (data.error) {
        console.error('Error fetching anomalies:', data.error)
        return
      }
      
      // Format anomalies for visualization
      const geoAnomalies = []
      
      for (const fieldAnomalies of data.anomalies) {
        for (const anomaly of fieldAnomalies.anomalies) {
          // Extract lat/long from the anomaly data
          const row = anomaly.row
          
          const lat = row.latitude || row.lat || row.Latitude || row.LAT
          const lng = row.longitude || row.lng || row.Longitude || row.LONG || row.LON
          
          if (lat && lng) {
            const latitude = typeof lat === 'string' ? parseFloat(lat) : lat
            const longitude = typeof lng === 'string' ? parseFloat(lng) : lng
            
            // Validate coordinates
            if (!isNaN(latitude) && !isNaN(longitude) && 
                latitude >= -90 && latitude <= 90 && 
                longitude >= -180 && longitude <= 180) {
              geoAnomalies.push({
                id: anomaly.id,
                lat: latitude,
                lng: longitude,
                value: 1,
                fieldName: fieldAnomalies.field,
                anomalyValue: anomaly.value,
                isAnomaly: true
              })
            }
          }
        }
      }
      
      setAnomalies(geoAnomalies)
    } catch (err) {
      console.error('Error fetching anomalies:', err)
    }
  }

  // Format data for globe visualization
  const globeData = showAnomalies && anomalies.length > 0 
    ? anomalies 
    : geoData?.points || []

  // Toggle anomaly display and fetch if needed
  const handleToggleAnomalies = async () => {
    if (!showAnomalies && anomalies.length === 0) {
      await fetchAnomalies()
    }
    setShowAnomalies(!showAnomalies)
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Geographic Data Visualization</h2>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showAnomalies ? "default" : "outline"}
              onClick={handleToggleAnomalies}
              disabled={loading || !geoData}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Show Anomalies
            </Button>
          </div>
        </div>
        
        {geoData && (
          <p className="text-sm text-muted-foreground mt-1">
            Displaying {showAnomalies ? anomalies.length : geoData.total} data points
            {showAnomalies ? ' (anomalies)' : ''} from cleaned data
          </p>
        )}
      </div>
      
      <div style={{ height }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading geographic data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-md p-4">
              <p className="text-lg font-medium mb-2">Unable to load map data</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground">This data may not contain geographic coordinates, or the format may not be recognized.</p>
            </div>
          </div>
        ) : geoData && geoData.total > 0 ? (
          <GlobeVisualization 
            points={globeData}
            highlightColor={showAnomalies ? "#FF3333" : "#33BBFF"}
            pointColor={showAnomalies ? "#FF7777" : "#77DDFF"}
            pointSize={showAnomalies ? 0.5 : 0.3}
            atmosphereColor={showAnomalies ? "#FF000015" : "#0077FF15"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-md p-4">
              <p className="text-lg font-medium mb-2">No geographic data available</p>
              <p className="text-sm text-muted-foreground">
                The selected data does not contain any valid geographic coordinates.
                Please select a different dataset or add location data.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 