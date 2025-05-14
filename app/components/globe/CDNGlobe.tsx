'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import dynamic from 'next/dynamic'

// Import data
import globeData from '../../data/globeData.json'

// Dynamic import of WorldMapVisualization for fallback
const WorldMapFallback = dynamic(() => import('./WorldMapVisualization'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-text-secondary text-sm">Loading Map...</div>
    </div>
  )
})

// Helper functions for trend icons
const getTrendIcon = (trend) => {
  switch(trend) {
    case 'up': return '↑';
    case 'down': return '↓';
    case 'stable': return '→';
    default: return '';
  }
}

const getTrendClass = (trend) => {
  switch(trend) {
    case 'up': return 'text-green-500';
    case 'down': return 'text-red-500';
    case 'stable': return 'text-amber-500';
    default: return '';
  }
}

const getCategoryColor = (category) => {
  if (!category) return '#ffffff';
  if (globeData.categoryInfo?.[category]?.color) {
    return globeData.categoryInfo[category].color;
  }
  switch(category) {
    case 'feedback': return '#4CAF50';
    case 'churn': return '#F44336';
    case 'service': return '#2196F3';
    default: return '#9c27b0';
  }
}

const getCategoryMetrics = (category, region) => {
  // Get historical data for this region and category if available
  const historyData = [];
  
  globeData.historical.forEach(day => {
    day.points.forEach(point => {
      if (point.region === region && point.category === category) {
        historyData.push({
          date: new Date(day.date).toLocaleDateString(),
          value: point.value
        });
      }
    });
  });
  
  // Get current point
  const currentPoint = globeData.points.find(
    p => p.region === region && p.category === category
  );
  
  if (currentPoint) {
    historyData.push({
      date: new Date(currentPoint.timestamp).toLocaleDateString(),
      value: currentPoint.value
    });
  }
  
  // Sort by date
  historyData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return historyData;
};

const getRelatedConnections = (region) => {
  return globeData.connections.filter(
    conn => conn.source === region || conn.target === region
  );
};

// Define the interface for the component props
interface CDNGlobeProps {
  initialCategory?: string | null;
}

export default function CDNGlobe({ initialCategory = null }: CDNGlobeProps) {
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [showDetailPanel, setShowDetailPanel] = useState(false)
  const [hoverPoint, setHoverPoint] = useState(null)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [showFallback, setShowFallback] = useState(false)
  const iframeRef = useRef(null)
  
  // Update when initialCategory changes
  useEffect(() => {
    setActiveCategory(initialCategory)
    
    // Send message to iframe to update category filter
    if (!showFallback && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'updateCategory',
        category: initialCategory
      }, '*')
    }
  }, [initialCategory, showFallback])
  
  // Check WebGL support when component mounts
  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        const isSupported = !!gl
        setWebGLSupported(isSupported)
        // If not supported, show the fallback
        if (!isSupported) {
          setShowFallback(true)
        }
      } catch (e) {
        console.error('Error detecting WebGL support:', e)
        setWebGLSupported(false)
        setShowFallback(true)
      }
    }
    
    // Run check only on client side
    if (typeof window !== 'undefined') {
      checkWebGLSupport()
    }
  }, [])
  
  // Get available categories
  const categories = useMemo(() => {
    const categorySet = new Set()
    globeData.points.forEach(point => {
      categorySet.add(point.category)
    })
    return Array.from(categorySet)
  }, [])
  
  // Filter points based on active category
  const filteredPoints = useMemo(() => {
    let points = [...globeData.points]
    
    if (activeCategory) {
      points = points.filter(point => point.category === activeCategory)
    }
    
    return points
  }, [activeCategory])
  
  const handleCategoryToggle = (category) => {
    setActiveCategory(current => current === category ? null : category)
    
    // Send message to iframe to update category filter
    if (!showFallback && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'updateCategory',
        category: category === activeCategory ? null : category
      }, '*')
    }
  }
  
  // Handle messages from the iframe
  useEffect(() => {
    if (showFallback) return
    
    const handleMessage = (event) => {
      if (event.data.type === 'pointSelected') {
        // Find the point data by coordinates
        const point = globeData.points.find(
          p => p.lat === event.data.lat && p.lng === event.data.lng
        )
        
        if (point) {
          setSelectedPoint(point)
          setShowDetailPanel(true)
        }
      } else if (event.data.type === 'pointHover') {
        // Find the point data by coordinates
        const point = globeData.points.find(
          p => p.lat === event.data.lat && p.lng === event.data.lng
        )
        
        if (point) {
          setHoverPoint(point)
          // We're no longer positioning a tooltip since we now show a fixed-position info panel
        } else {
          setHoverPoint(null)
        }
      } else if (event.data.type === 'pointHoverOut') {
        setHoverPoint(null)
      } else if (event.data.type === 'iframeReady') {
        setIframeLoaded(true)
      } else if (event.data.type === 'webGLError') {
        console.warn('WebGL error in iframe, showing fallback')
        setShowFallback(true)
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [showFallback])
  
  // Generate HTML content for the iframe
  const iframeContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; background: transparent; }
    .globe-container { width: 100%; height: 100vh; }
    .fallback-message { 
      display: none; 
      position: absolute; 
      top: 50%; 
      left: 50%; 
      transform: translate(-50%, -50%);
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      color: #888;
    }
  </style>
  <script src="https://unpkg.com/three@0.137.0/build/three.min.js"></script>
  <script src="https://unpkg.com/globe.gl@2.26.5/dist/globe.gl.min.js"></script>
</head>
<body>
  <div class="globe-container" id="globeViz"></div>
  <div class="fallback-message" id="errorMessage">
    <h3>3D Globe Visualization is not supported in this browser</h3>
    <p>Using 2D map visualization instead</p>
  </div>
  <script>
    // Globe data
    const globeData = ${JSON.stringify(globeData).replace(/\\/g, '\\\\').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')};
    
    // Initialize globe
    let currentCategory = null;
    let globe;
    
    function initGlobe() {
      try {
        // Check WebGL support
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
          throw new Error('WebGL not supported');
        }
        
        // Create the globe
        globe = Globe()
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
          .width(window.innerWidth)
          .height(window.innerHeight)
          .backgroundColor('rgba(0,0,0,0)')
          .onPointClick(point => {
            window.parent.postMessage({
              type: 'pointSelected',
              lat: point.lat,
              lng: point.lng
            }, '*');
          })
          .onPointHover((point, prevPoint) => {
            if (point) {
              const evt = event || window.event;
              window.parent.postMessage({
                type: 'pointHover',
                lat: point.lat,
                lng: point.lng,
                x: evt ? evt.clientX : 0,
                y: evt ? evt.clientY : 0
              }, '*');
            } else {
              window.parent.postMessage({
                type: 'pointHoverOut'
              }, '*');
            }
          });
        
        updatePoints();
        globe(document.getElementById('globeViz'));
        
        // Notify parent that the iframe is ready
        window.parent.postMessage({ type: 'iframeReady' }, '*');
      } catch (error) {
        console.error('Error initializing 3D globe:', error);
        document.getElementById('errorMessage').style.display = 'block';
        window.parent.postMessage({ type: 'webGLError' }, '*');
      }
    }
    
    function updatePoints() {
      // Filter points based on current category
      let points = [...globeData.points];
      if (currentCategory) {
        points = points.filter(point => point.category === currentCategory);
      }
      
      // Format points for visualization
      const formattedPoints = points.map(point => {
        const color = point.category === 'feedback' ? 'rgba(75, 192, 192, 0.8)' :
                     point.category === 'churn' ? 'rgba(255, 99, 132, 0.8)' :
                     point.category === 'service' ? 'rgba(54, 162, 235, 0.8)' :
                     'rgba(156, 39, 176, 0.8)';
                     
        return {
        ...point,
          color: color,
          radius: point.value / 80, // Scale based on value
        };
      });
      
      // Update globe
      if (globe) {
        globe
          .pointsData(formattedPoints)
          .pointColor('color')
          .pointAltitude(0.01)
          .pointRadius('radius')
          .pointLabel(() => ''); // We'll handle the labels ourselves with a tooltip
      }
    }
    
    // Listen for messages from parent
    window.addEventListener('message', function(event) {
      if (event.data.type === 'updateCategory') {
        currentCategory = event.data.category;
        updatePoints();
      }
    });
    
    // Handle resize
    window.addEventListener('resize', function() {
      if (globe) {
        globe
          .width(window.innerWidth)
          .height(window.innerHeight);
      }
    });
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initGlobe);
  </script>
</body>
</html>
  `
  
  // Prepare data for the WorldMapFallback component
  const mapPoints = useMemo(() => {
    return filteredPoints.map(point => ({
      coordinates: [point.lng, point.lat],
      name: point.region,
      value: point.value,
      category: point.category
    }))
  }, [filteredPoints])
  
  return (
    <div className="h-full flex flex-col">
      {/* Main Visualization */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 relative">
          {!showFallback ? (
            <>
              <iframe
                ref={iframeRef}
                srcDoc={iframeContent}
                className="w-full h-[calc(100vh-300px)]"
                style={{ border: 'none', background: 'transparent' }}
                title="3D Globe Visualization"
              />
              
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background-paper bg-opacity-75">
                  <div className="text-text-secondary">Loading 3D Globe Visualization...</div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-[calc(100vh-300px)]">
              <WorldMapFallback 
                initialPoints={mapPoints}
                initialCategory={activeCategory}
                onPointSelect={(point) => {
                  const selectedData = globeData.points.find(
                    p => p.lat === point.coordinates[1] && p.lng === point.coordinates[0]
                  )
                  if (selectedData) {
                    setSelectedPoint(selectedData)
                    setShowDetailPanel(true)
                  }
                }}
                onPointHover={(point) => {
                  if (point) {
                    const hoverData = globeData.points.find(
                      p => p.lat === point.coordinates[1] && p.lng === point.coordinates[0]
                    )
                    if (hoverData) {
                      setHoverPoint(hoverData)
                    }
                  } else {
                    setHoverPoint(null)
                  }
                }}
                onCategoryChange={setActiveCategory}
              />
            </div>
          )}
          
          {/* Hover Info Panel - Using the compact format for hover state */}
          {hoverPoint && !selectedPoint && (
            <div className="absolute bottom-24 left-6 bg-background-elevated/90 p-3 rounded-md text-xs backdrop-blur-sm shadow-lg border border-[#FF3333]/30 max-w-[260px] animate-fade-in transition-all duration-300 pointer-events-none">
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-medium text-sm">{hoverPoint.region}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-y-1.5 mb-1.5">
                <div className="text-text-secondary">Category:</div>
                <div className="font-medium capitalize">
                  {globeData.categoryInfo?.[hoverPoint.category]?.name || hoverPoint.category}
                </div>
                
                <div className="text-text-secondary">Value:</div>
                <div className="font-medium">
                  {hoverPoint.value}
                  {globeData.categoryInfo?.[hoverPoint.category]?.unit ? 
                    ` ${globeData.categoryInfo[hoverPoint.category].unit}` : ''}
                </div>
                
                <div className="text-text-secondary">Trend:</div>
                <div className={`font-medium flex items-center ${getTrendClass(hoverPoint.trend)}`}>
                  {getTrendIcon(hoverPoint.trend)} {hoverPoint.trend}
                </div>
              </div>
              
              <div className="text-xs opacity-75 text-center italic">Click for details</div>
            </div>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-16 right-6 bg-background-elevated/80 p-2.5 rounded-md text-xs backdrop-blur-sm shadow-lg border border-secondary/30">
            <div className="font-medium mb-1.5">Legend</div>
            <div className="grid grid-cols-1 gap-1">
              {categories.map(category => (
                <div key={category} className="flex items-center">
                  <div 
                    className="w-2.5 h-2.5 rounded-full mr-1.5" 
                    style={{ backgroundColor: getCategoryColor(category) }}
                  ></div>
                  <span>{globeData.categoryInfo?.[category]?.name || category}</span>
              </div>
              ))}
            </div>
          </div>
          
          {/* Compact Selected Point Info - Only show when selected but detail panel not open */}
          {selectedPoint && !showDetailPanel && (
            <div className="absolute bottom-16 left-6 bg-background-elevated/90 p-3 rounded-md text-xs backdrop-blur-sm shadow-lg border border-[#FF3333]/30 max-w-[260px] animate-fade-in transition-all duration-300">
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-medium text-sm">{selectedPoint.region}</h3>
                <button 
                  onClick={() => setSelectedPoint(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-y-1.5 mb-2">
                <div className="text-text-secondary">Category:</div>
                <div className="font-medium capitalize">
                  {globeData.categoryInfo?.[selectedPoint.category]?.name || selectedPoint.category}
                </div>
                
                <div className="text-text-secondary">Value:</div>
                <div className="font-medium">
                  {selectedPoint.value}
                  {globeData.categoryInfo?.[selectedPoint.category]?.unit ? 
                    ` ${globeData.categoryInfo[selectedPoint.category].unit}` : ''}
                </div>
                
                <div className="text-text-secondary">Trend:</div>
                <div className={`font-medium flex items-center ${getTrendClass(selectedPoint.trend)}`}>
                  {getTrendIcon(selectedPoint.trend)} {selectedPoint.trend}
                </div>
              </div>
              
              <Button 
                variant="primary"
                className="w-full mt-1.5 text-xs py-1"
                onClick={() => setShowDetailPanel(true)}
              >
                View Details
              </Button>
            </div>
          )}
          
          {/* Detailed Information Panel */}
          {selectedPoint && showDetailPanel && (
            <div className="absolute top-6 left-6 bottom-16 max-h-[calc(100vh-320px)] bg-background-paper/95 backdrop-blur-md border border-secondary/30 w-64 shadow-xl overflow-y-auto animate-slide-in transition-all duration-300 z-10 rounded-md">
              <div className="sticky top-0 bg-background-paper/90 backdrop-blur-md p-3 border-b border-secondary/30 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-medium">{selectedPoint.region}</h2>
                  <button 
                    onClick={() => {
                      setShowDetailPanel(false)
                    }}
                    className="p-1 rounded-full hover:bg-secondary/20 text-text-secondary"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="text-xs text-text-secondary">
                  {globeData.regionInfo?.[selectedPoint.region]?.details || 'Regional data overview'}
                </div>
              </div>
              
              <div className="p-3">
                {/* Key Metrics */}
                <div className="mb-4">
                  <h3 className="text-xs uppercase text-text-secondary mb-1.5 font-medium tracking-wider">Key Metrics</h3>
                  
                  <div className="bg-background-elevated rounded-md p-2.5 mb-2 border border-secondary/30">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-1.5" 
                        style={{ backgroundColor: getCategoryColor(selectedPoint.category) }}
                      ></div>
                      <div className="font-medium text-xs">
                        {globeData.categoryInfo?.[selectedPoint.category]?.name || selectedPoint.category}
                      </div>
                      <div className={`ml-auto font-medium flex items-center text-xs ${getTrendClass(selectedPoint.trend)}`}>
                        {getTrendIcon(selectedPoint.trend)} {selectedPoint.value}
                        {globeData.categoryInfo?.[selectedPoint.category]?.unit ? 
                          ` ${globeData.categoryInfo[selectedPoint.category].unit}` : ''}
                      </div>
                    </div>
                    
                    <div className="text-xs text-text-secondary mt-1">
                      {globeData.categoryInfo?.[selectedPoint.category]?.description || 'Category metrics'}
                    </div>
                  </div>
                  
                  {/* Other categories for this region */}
                  {categories
                    .filter(cat => cat !== selectedPoint.category)
                    .map(cat => {
                      const point = globeData.points.find(
                        p => p.region === selectedPoint.region && p.category === cat
                      )
                      if (!point) return null
                      
                      return (
                        <div key={cat} className="bg-background-elevated rounded-md p-2.5 mb-2 border border-secondary/30">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-1.5" 
                              style={{ backgroundColor: getCategoryColor(cat) }}
                            ></div>
                            <div className="font-medium text-xs">
                              {globeData.categoryInfo?.[cat]?.name || cat}
                            </div>
                            <div className={`ml-auto font-medium flex items-center text-xs ${getTrendClass(point.trend)}`}>
                              {getTrendIcon(point.trend)} {point.value}
                              {globeData.categoryInfo?.[cat]?.unit ? 
                                ` ${globeData.categoryInfo[cat].unit}` : ''}
                            </div>
                          </div>
                          
                          <div className="text-xs text-text-secondary mt-1">
                            {globeData.categoryInfo?.[cat]?.description || 'Category metrics'}
                          </div>
                        </div>
                      )
                  })}
                </div>
                
                {/* Historical Data */}
                <div className="mb-4">
                  <h3 className="text-xs uppercase text-text-secondary mb-1.5 font-medium tracking-wider">Historical Trends</h3>
                  
                  {getCategoryMetrics(selectedPoint.category, selectedPoint.region).length > 0 ? (
                    <div className="bg-background-elevated rounded-md p-2.5 border border-secondary/30">
                      <div className="h-16 relative">
                        {/* Simple trend visualization */}
                        <div className="flex items-end h-full relative">
                          {getCategoryMetrics(selectedPoint.category, selectedPoint.region).map((point, i, arr) => {
                            const maxValue = Math.max(...arr.map(p => p.value));
                            const height = (point.value / maxValue) * 100;
                            const width = `${100 / arr.length}%`;
                            
                            return (
                              <div 
                                key={i} 
                                className="flex-1 mx-0.5 group cursor-pointer relative"
                                title={`${point.date}: ${point.value}`}
                              >
                                <div 
                                  className="w-full bg-[#FF3333]" 
                                  style={{ 
                                    height: `${height}%`,
                                    opacity: i === arr.length - 1 ? 1 : 0.6
                                  }}
                                ></div>
                                <div className="absolute bottom-0 left-0 right-0 text-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  {point.value}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="text-xs text-text-secondary mt-1.5 flex justify-between">
                        <span>
                          {getCategoryMetrics(selectedPoint.category, selectedPoint.region)[0]?.date || ''}
                        </span>
                        <span>
                          {getCategoryMetrics(selectedPoint.category, selectedPoint.region).slice(-1)[0]?.date || ''}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-text-secondary">No historical data available</div>
                  )}
                </div>
                
                {/* Connections */}
                {getRelatedConnections(selectedPoint.region).length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs uppercase text-text-secondary mb-1.5 font-medium tracking-wider">Connections</h3>
                    
                    {getRelatedConnections(selectedPoint.region).map((conn, i) => (
                      <div key={i} className="bg-background-elevated rounded-md p-2.5 mb-1.5 border border-secondary/30">
                        <div className="flex items-center text-xs">
                          <div className="font-medium">
                            {conn.source === selectedPoint.region ? conn.target : conn.source}
                          </div>
                          <div className="text-text-secondary mx-1.5">
                            {conn.source === selectedPoint.region ? '→' : '←'}
                          </div>
                          <div className="text-xs capitalize bg-background-paper px-1.5 py-0.5 rounded">
                            {conn.type}
                          </div>
                          <div className="ml-auto font-medium">
                            {conn.value}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button 
                    variant="primary"
                    className="text-xs py-1.5"
                onClick={() => {
                  if (selectedPoint.region && globeData.regionInfo[selectedPoint.region]?.dashboardId) {
                    console.log(`Navigate to dashboard: ${globeData.regionInfo[selectedPoint.region].dashboardId}`)
                  }
                }}
              >
                View Dashboard
              </Button>
                  
                  <Button 
                    variant="secondary"
                    className="text-xs py-1.5"
                    onClick={() => {
                      console.log(`Generate report for ${selectedPoint.region}`)
                    }}
                  >
                    Generate Report
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    className="col-span-2 text-xs py-1.5"
                    onClick={() => {
                      console.log(`Deep dive into ${selectedPoint.region} data`)
                    }}
                  >
                    Data Deep Dive
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 