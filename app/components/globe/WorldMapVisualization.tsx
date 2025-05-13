'use client'

import { useState, useEffect, useRef } from 'react'
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

// World map geojson - use a more reliable source
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Default sample data if none is provided
const defaultPoints = [
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

// Default arc data
const defaultArcs = [
  { start: [-74.006, 40.7128], end: [151.2093, -33.8688], name: 'New York → Sydney' },
  { start: [-0.1278, 51.5074], end: [103.8198, 1.3521], name: 'London → Singapore' },
  { start: [-118.2437, 34.0522], end: [139.6503, 35.6762], name: 'Los Angeles → Tokyo' },
]

export default function WorldMapVisualization({ 
  initialPoints = defaultPoints,
  initialArcs = defaultArcs,
  initialCategory = null,
  showControls = true,
  onPointSelect = () => {},
  onCategoryChange = () => {}
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [showConnections, setShowConnections] = useState(true)
  const [pointsData, setPointsData] = useState(initialPoints)
  const [arcsData, setArcsData] = useState(initialArcs)
  const [tooltipContent, setTooltipContent] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [mapError, setMapError] = useState(false)
  const mapContainerRef = useRef(null)
  
  // Update when props change
  useEffect(() => {
    setPointsData(initialPoints)
  }, [initialPoints])
  
  useEffect(() => {
    setArcsData(initialArcs)
  }, [initialArcs])
  
  useEffect(() => {
    setActiveCategory(initialCategory)
  }, [initialCategory])
  
  // Filter points based on active category
  useEffect(() => {
    if (activeCategory) {
      setPointsData(initialPoints.filter(point => point.category === activeCategory))
    } else {
      setPointsData(initialPoints)
    }
    
    // Notify parent component of category change
    onCategoryChange(activeCategory)
  }, [activeCategory, initialPoints, onCategoryChange])
  
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize to adjust map dimensions
      setZoom(zoom => zoom + 0.001);
      setTimeout(() => setZoom(zoom => Math.floor(zoom * 1000) / 1000), 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Get unique categories from the points
  const categories = Array.from(new Set(initialPoints.map(point => point.category)))
  
  const getMarkerSize = (value) => {
    return Math.max(8, Math.min(value / 5, 20))
  }
  
  // Handle point selection
  const handlePointClick = (point) => {
    onPointSelect(point)
  }
  
  // Handle error for map rendering
  const handleMapError = () => {
    console.error("Error loading or rendering the map");
    setMapError(true);
  }
  
  // Update active category
  const handleCategoryChange = (category) => {
    setActiveCategory(current => current === category ? null : category)
  }
  
  return (
    <div className="h-full flex flex-col">
      {showControls && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === null ? 'primary' : 'secondary'}
              onClick={() => handleCategoryChange(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? 'primary' : 'secondary'}
                onClick={() => handleCategoryChange(category)}
                className="capitalize"
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
      )}
      
      <div 
        ref={mapContainerRef}
        className="flex-1 relative bg-background-elevated rounded-lg"
        style={{ minHeight: showControls ? '400px' : '100%' }}
      >
        {!mapError ? (
          <ComposableMap
            projectionConfig={{
              scale: 170,
              rotation: [0, 0, 0],
            }}
            style={{ 
              width: "100%", 
              height: "100%",
              background: "#1c1c1c" 
            }}
          >
            <ZoomableGroup 
              zoom={zoom} 
              center={[0, 0]} 
              maxZoom={5}
            >
              <rect
                x="-8000"
                y="-8000"
                width="16000"
                height="16000"
                fill="#1c1c1c"
              />
              
              <Geographies 
                geography={geoUrl}
                onError={handleMapError}
              >
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#2d2d2d"
                      stroke="#3d3d3d"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#3d3d3d", outline: "none" },
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
                  onClick={() => handlePointClick(point)}
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
                    fill={point.category === 'feedback' ? 'rgba(75, 192, 192, 0.8)' :
                          point.category === 'churn' ? 'rgba(255, 99, 132, 0.8)' :
                          'rgba(144, 202, 249, 0.8)'} 
                    stroke="#FFFFFF" 
                    strokeWidth={1} 
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-medium mb-2">Map Visualization</h3>
              <p className="text-text-secondary mb-4">
                Unable to load the world map. Check console for details.
              </p>
              <Button 
                onClick={() => setMapError(false)}
                variant="primary"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
        
        {tooltipContent && (
          <div 
            className="absolute glass-panel p-2 rounded-md text-sm pointer-events-none z-10"
            style={{ 
              left: `${tooltipPosition.x + 10}px`, 
              top: `${tooltipPosition.y + 10}px` 
            }}
          >
            {tooltipContent}
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 glass-panel p-3 rounded-md text-sm z-10">
          <div className="font-medium mb-2">Legend</div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-[rgba(75,192,192,0.8)] mr-2"></div>
            <span>Feedback</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-[rgba(255,99,132,0.8)] mr-2"></div>
            <span>Churn Risk</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-[rgba(54,162,235,0.8)] mr-2"></div>
            <span>Service Quality</span>
          </div>
        </div>
      </div>
    </div>
  )
} 