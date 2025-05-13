'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Import data
import globeData from '../../data/globeData.json'

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

export default function CDNGlobe() {
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef(null)
  
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
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'updateCategory',
        category: category === activeCategory ? null : category
      }, '*')
    }
  }
  
  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'pointSelected') {
        // Find the point data by coordinates
        const point = globeData.points.find(
          p => p.lat === event.data.lat && p.lng === event.data.lng
        )
        
        if (point) {
          setSelectedPoint(point)
        }
      } else if (event.data.type === 'iframeReady') {
        setIframeLoaded(true)
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])
  
  // Generate HTML content for the iframe
  const iframeContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; background: transparent; }
    .globe-container { width: 100%; height: 100vh; }
  </style>
  <script src="https://unpkg.com/three@0.137.0/build/three.min.js"></script>
  <script src="https://unpkg.com/globe.gl@2.26.5/dist/globe.gl.min.js"></script>
</head>
<body>
  <div class="globe-container" id="globeViz"></div>
  <script>
    // Globe data
    const globeData = ${JSON.stringify(globeData)};
    
    // Initialize globe
    let currentCategory = null;
    let globe;
    
    function initGlobe() {
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
        });
      
      updatePoints();
      globe(document.getElementById('globeViz'));
      
      // Notify parent that the iframe is ready
      window.parent.postMessage({ type: 'iframeReady' }, '*');
    }
    
    function updatePoints() {
      // Filter points based on current category
      let points = [...globeData.points];
      if (currentCategory) {
        points = points.filter(point => point.category === currentCategory);
      }
      
      // Format points for visualization
      const formattedPoints = points.map(point => ({
        ...point,
        color: point.category === 'feedback' ? 'rgba(75, 192, 192, 0.8)' :
               point.category === 'churn' ? 'rgba(255, 99, 132, 0.8)' :
               'rgba(54, 162, 235, 0.8)',
      }));
      
      // Update globe
      if (globe) {
        globe
          .pointsData(formattedPoints)
          .pointColor('color')
          .pointAltitude(0.01)
          .pointRadius(0.5)
          .pointLabel(point => \`\${point.region}: \${point.value} (\${point.category})\`);
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
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        {/* Category Filters */}
        <div className="flex flex-wrap space-x-2">
          <Button
            variant={activeCategory === null ? 'primary' : 'secondary'}
            onClick={() => handleCategoryToggle(null)}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? 'primary' : 'secondary'}
              onClick={() => handleCategoryToggle(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Main Globe Visualization */}
      <Card title="Global Analytics" className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 relative">
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
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-background-elevated bg-opacity-80 p-3 rounded-md text-sm backdrop-blur-sm">
            <div className="font-medium mb-2">Legend</div>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[rgba(75,192,192,0.8)] mr-2"></div>
                <span>Feedback</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[rgba(255,99,132,0.8)] mr-2"></div>
                <span>Churn Risk</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[rgba(54,162,235,0.8)] mr-2"></div>
                <span>Service Quality</span>
              </div>
            </div>
          </div>
          
          {/* Selected Point Info */}
          {selectedPoint && (
            <div className="absolute top-4 left-4 bg-background-elevated bg-opacity-80 p-4 rounded-md text-sm max-w-md backdrop-blur-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-base">{selectedPoint.region}</h3>
                <button 
                  onClick={() => setSelectedPoint(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-y-2 mb-3">
                <div className="text-text-secondary">Category:</div>
                <div className="font-medium capitalize">{selectedPoint.category}</div>
                <div className="text-text-secondary">Value:</div>
                <div className="font-medium">{selectedPoint.value}</div>
                <div className="text-text-secondary">Trend:</div>
                <div className={`font-medium flex items-center ${getTrendClass(selectedPoint.trend)}`}>
                  {getTrendIcon(selectedPoint.trend)} {selectedPoint.trend}
                </div>
                {globeData.regionInfo[selectedPoint.region]?.details && (
                  <>
                    <div className="text-text-secondary">Details:</div>
                    <div className="font-medium text-xs">{globeData.regionInfo[selectedPoint.region].details}</div>
                  </>
                )}
              </div>
              <Button 
                variant="primary"
                className="w-full mt-2"
                onClick={() => {
                  if (selectedPoint.region && globeData.regionInfo[selectedPoint.region]?.dashboardId) {
                    console.log(`Navigate to dashboard: ${globeData.regionInfo[selectedPoint.region].dashboardId}`)
                  }
                }}
              >
                View Dashboard
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
} 