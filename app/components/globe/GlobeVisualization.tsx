'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

// Sample data for location points
const samplePoints = [
  { lat: 40.7128, lng: -74.006, name: 'New York', value: 84, category: 'Office' },
  { lat: 34.0522, lng: -118.2437, name: 'Los Angeles', value: 67, category: 'Office' },
  { lat: 51.5074, lng: -0.1278, name: 'London', value: 93, category: 'Office' },
  { lat: 48.8566, lng: 2.3522, name: 'Paris', value: 42, category: 'Partner' },
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo', value: 78, category: 'Office' },
  { lat: 1.3521, lng: 103.8198, name: 'Singapore', value: 56, category: 'Partner' },
  { lat: -33.8688, lng: 151.2093, name: 'Sydney', value: 39, category: 'Warehouse' },
  { lat: 55.7558, lng: 37.6173, name: 'Moscow', value: 27, category: 'Warehouse' },
  { lat: 19.4326, lng: -99.1332, name: 'Mexico City', value: 45, category: 'Warehouse' },
]

// Arc data for connections
const sampleArcs = [
  { startLat: 40.7128, startLng: -74.006, endLat: -33.8688, endLng: 151.2093, color: 'rgba(144, 202, 249, 0.6)' },
  { startLat: 51.5074, startLng: -0.1278, endLat: 1.3521, endLng: 103.8198, color: 'rgba(144, 202, 249, 0.6)' },
  { startLat: 34.0522, startLng: -118.2437, endLat: 35.6762, endLng: 139.6503, color: 'rgba(144, 202, 249, 0.6)' },
]

export default function GlobeVisualization() {
  const globeRef = useRef<any>()
  const [pointsData, setPointsData] = useState(samplePoints)
  const [arcsData, setArcsData] = useState(sampleArcs)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showArcs, setShowArcs] = useState(true)
  
  useEffect(() => {
    if (globeRef.current) {
      // Initial globe rotation animation
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.5
      
      // Set initial camera position
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 })
    }
  }, [])
  
  useEffect(() => {
    if (activeCategory) {
      setPointsData(samplePoints.filter(point => point.category === activeCategory))
    } else {
      setPointsData(samplePoints)
    }
  }, [activeCategory])
  
  const categories = Array.from(new Set(samplePoints.map(point => point.category)))
  
  const globeConfig = {
    globeImageUrl: '//unpkg.com/three-globe/example/img/earth-dark.jpg',
    bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
    backgroundImageUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button
            variant={activeCategory === null ? 'primary' : 'secondary'}
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? 'primary' : 'secondary'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={showArcs ? 'primary' : 'secondary'}
            onClick={() => setShowArcs(!showArcs)}
          >
            {showArcs ? 'Hide Connections' : 'Show Connections'}
          </Button>
        </div>
      </div>
      
      <Card title="Global Data Visualization" className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          <div className="w-full h-[calc(100vh-250px)]">
            <Globe
              ref={globeRef}
              width={1000}
              height={800}
              {...globeConfig}
              pointsData={pointsData}
              pointLabel="name"
              pointColor={() => 'rgba(144, 202, 249, 1)'}
              pointAltitude={0.01}
              pointRadius="value"
              pointsMerge={true}
              arcsData={showArcs ? arcsData : []}
              arcColor="color"
              arcDashLength={0.4}
              arcDashGap={0.2}
              arcDashAnimateTime={1500}
              arcsTransitionDuration={1000}
              backgroundColor="rgba(0,0,0,0)"
            />
          </div>
          
          <div className="absolute bottom-4 right-4 glass-panel p-3 rounded-md text-sm">
            <div className="font-medium mb-2">Legend</div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-[rgba(144,202,249,1)] mr-2"></div>
              <span>Location point</span>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-1 bg-[rgba(144,202,249,0.6)] mr-2"></div>
              <span>Connection</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 