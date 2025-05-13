'use client'

import { useState, useEffect } from 'react'
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker, 
  Line, 
  ZoomableGroup 
} from 'react-simple-maps'
import Card from '../ui/Card'
import Button from '../ui/Button'

// World map geojson
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json"

// Sample data for location points
const samplePoints = [
  { coordinates: [-74.006, 40.7128], name: 'New York', value: 84, category: 'Office' },
  { coordinates: [-118.2437, 34.0522], name: 'Los Angeles', value: 67, category: 'Office' },
  { coordinates: [-0.1278, 51.5074], name: 'London', value: 93, category: 'Office' },
  { coordinates: [2.3522, 48.8566], name: 'Paris', value: 42, category: 'Partner' },
  { coordinates: [139.6503, 35.6762], name: 'Tokyo', value: 78, category: 'Office' },
  { coordinates: [103.8198, 1.3521], name: 'Singapore', value: 56, category: 'Partner' },
  { coordinates: [151.2093, -33.8688], name: 'Sydney', value: 39, category: 'Warehouse' },
  { coordinates: [37.6173, 55.7558], name: 'Moscow', value: 27, category: 'Warehouse' },
  { coordinates: [-99.1332, 19.4326], name: 'Mexico City', value: 45, category: 'Warehouse' },
]

// Arc data for connections
const sampleArcs = [
  { start: [-74.006, 40.7128], end: [151.2093, -33.8688], name: 'New York → Sydney' },
  { start: [-0.1278, 51.5074], end: [103.8198, 1.3521], name: 'London → Singapore' },
  { start: [-118.2437, 34.0522], end: [139.6503, 35.6762], name: 'Los Angeles → Tokyo' },
]

export default function WorldMapVisualization() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showConnections, setShowConnections] = useState(true)
  const [pointsData, setPointsData] = useState(samplePoints)
  const [arcsData, setArcsData] = useState(sampleArcs)
  const [tooltipContent, setTooltipContent] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  
  useEffect(() => {
    if (activeCategory) {
      setPointsData(samplePoints.filter(point => point.category === activeCategory))
    } else {
      setPointsData(samplePoints)
    }
  }, [activeCategory])
  
  const categories = Array.from(new Set(samplePoints.map(point => point.category)))
  
  const getMarkerSize = (value: number) => {
    return Math.max(8, Math.min(value / 5, 20))
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
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
            variant={showConnections ? 'primary' : 'secondary'}
            onClick={() => setShowConnections(!showConnections)}
          >
            {showConnections ? 'Hide Connections' : 'Show Connections'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
          >
            -
          </Button>
          <Button
            variant="secondary"
            onClick={() => setZoom(prev => Math.min(4, prev + 0.5))}
          >
            +
          </Button>
        </div>
      </div>
      
      <Card title="Global Data Visualization" className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 relative bg-background-elevated rounded-lg">
          <ComposableMap
            projectionConfig={{
              scale: 170,
            }}
            width={800}
            height={400}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup zoom={zoom} center={[0, 0]} maxZoom={5}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#333333"
                      stroke="#505050"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#404040", outline: "none" },
                        pressed: { fill: "#505050", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              
              {showConnections && arcsData.map((arc, i) => (
                <Line
                  key={`arc-${i}`}
                  from={arc.start}
                  to={arc.end}
                  stroke="rgba(144, 202, 249, 0.6)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  onMouseEnter={(e) => {
                    setTooltipContent(arc.name)
                    setTooltipPosition({ x: e.clientX, y: e.clientY })
                  }}
                  onMouseLeave={() => {
                    setTooltipContent(null)
                  }}
                />
              ))}
              
              {pointsData.map((point, i) => (
                <Marker 
                  key={`marker-${i}`} 
                  coordinates={point.coordinates}
                  onMouseEnter={(e) => {
                    setTooltipContent(`${point.name} (${point.category}): ${point.value}`)
                    setTooltipPosition({ x: e.clientX, y: e.clientY })
                  }}
                  onMouseLeave={() => {
                    setTooltipContent(null)
                  }}
                >
                  <circle 
                    r={getMarkerSize(point.value)} 
                    fill="rgba(144, 202, 249, 0.8)" 
                    stroke="#FFFFFF" 
                    strokeWidth={1} 
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
          
          {tooltipContent && (
            <div 
              className="absolute glass-panel p-2 rounded-md text-sm pointer-events-none"
              style={{ 
                left: `${tooltipPosition.x + 10}px`, 
                top: `${tooltipPosition.y + 10}px` 
              }}
            >
              {tooltipContent}
            </div>
          )}
          
          <div className="absolute bottom-4 right-4 glass-panel p-3 rounded-md text-sm">
            <div className="font-medium mb-2">Legend</div>
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-[rgba(144,202,249,0.8)] mr-2"></div>
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