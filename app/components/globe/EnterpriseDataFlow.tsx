'use client'

import React, { useState, useEffect, useRef } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Dummy data for enterprise data flow
const flowNodes = [
  { id: 'customer-data', name: 'Customer Data Lake', type: 'source', category: 'feedback', x: 200, y: 150 },
  { id: 'crm', name: 'CRM System', type: 'process', category: 'service', x: 400, y: 100 },
  { id: 'analytics', name: 'Analytics Engine', type: 'process', category: 'churn', x: 600, y: 150 },
  { id: 'warehouse', name: 'Data Warehouse', type: 'storage', category: 'warehouse', x: 400, y: 350 },
  { id: 'bi', name: 'BI Dashboard', type: 'visualization', category: 'office', x: 800, y: 100 },
  { id: 'marketing', name: 'Marketing Platform', type: 'process', category: 'churn', x: 800, y: 250 },
  { id: 'ml', name: 'ML Prediction', type: 'process', category: 'service', x: 600, y: 300 },
  { id: 'external', name: 'External APIs', type: 'source', category: 'feedback', x: 200, y: 300 }
]

const flowConnections = [
  { source: 'customer-data', target: 'crm', value: 85, status: 'active' },
  { source: 'crm', target: 'analytics', value: 67, status: 'active' },
  { source: 'analytics', target: 'bi', value: 74, status: 'active' },
  { source: 'warehouse', target: 'analytics', value: 92, status: 'active' },
  { source: 'analytics', target: 'marketing', value: 56, status: 'warning' },
  { source: 'warehouse', target: 'ml', value: 83, status: 'active' },
  { source: 'ml', target: 'marketing', value: 42, status: 'error' },
  { source: 'external', target: 'warehouse', value: 65, status: 'active' },
  { source: 'customer-data', target: 'warehouse', value: 78, status: 'active' }
]

// Status indicators for flows
const flowMetrics = {
  'customer-data': { status: 'active', dataPoints: 1247, throughput: '1.2 GB/hr', latency: '125ms' },
  'crm': { status: 'active', dataPoints: 843, throughput: '650 MB/hr', latency: '210ms' },
  'analytics': { status: 'active', dataPoints: 2156, throughput: '3.4 GB/hr', latency: '180ms' },
  'warehouse': { status: 'active', dataPoints: 5827, throughput: '7.8 GB/hr', latency: '95ms' },
  'bi': { status: 'warning', dataPoints: 567, throughput: '450 MB/hr', latency: '320ms' },
  'marketing': { status: 'error', dataPoints: 328, throughput: '250 MB/hr', latency: '540ms' },
  'ml': { status: 'active', dataPoints: 1893, throughput: '1.8 GB/hr', latency: '205ms' },
  'external': { status: 'active', dataPoints: 756, throughput: '980 MB/hr', latency: '310ms' }
}

// Flow rate history for animation
const flowRateHistory = {
  'customer-data-crm': [75, 82, 78, 85, 89, 87, 85],
  'crm-analytics': [60, 65, 63, 67, 70, 68, 67],
  'analytics-bi': [70, 72, 74, 73, 75, 74, 74],
  'warehouse-analytics': [90, 91, 93, 90, 92, 94, 92],
  'analytics-marketing': [50, 55, 52, 54, 58, 56, 56],
  'warehouse-ml': [80, 83, 81, 85, 84, 83, 83],
  'ml-marketing': [35, 40, 38, 42, 45, 42, 42],
  'external-warehouse': [60, 65, 66, 64, 65, 67, 65],
  'customer-data-warehouse': [75, 78, 80, 77, 78, 80, 78]
}

// Helper function to get connection ID
const getConnectionId = (source: string, target: string) => `${source}-${target}`;

// Node type icons
const nodeTypeIcons = {
  'source': '📤',
  'process': '⚙️',
  'storage': '💾',
  'visualization': '📊'
};

type EnterpriseDataFlowProps = {
  filter: string | null;
}

const EnterpriseDataFlow: React.FC<EnterpriseDataFlowProps> = ({ filter }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showNodeMetrics, setShowNodeMetrics] = useState(true);
  const [showConnectionMetrics, setShowConnectionMetrics] = useState(true);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [filteredNodes, setFilteredNodes] = useState(flowNodes);
  const [filteredConnections, setFilteredConnections] = useState(flowConnections);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Center the visualization on initial render
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate the bounding box of all nodes
      const minX = Math.min(...flowNodes.map(n => n.x));
      const maxX = Math.max(...flowNodes.map(n => n.x));
      const minY = Math.min(...flowNodes.map(n => n.y));
      const maxY = Math.max(...flowNodes.map(n => n.y));
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // Offset to center the visualization
      setViewportOffset({
        x: containerWidth / 2 - centerX,
        y: containerHeight / 2 - centerY
      });
    }
  }, []);
  
  // Handle filtering
  useEffect(() => {
    if (!filter) {
      setFilteredNodes(flowNodes);
      setFilteredConnections(flowConnections);
      return;
    }
    
    // Filter nodes by category
    const nodes = flowNodes.filter(node => node.category === filter);
    
    // Get node IDs to filter connections
    const nodeIds = nodes.map(node => node.id);
    
    // Filter connections that have both source and target in filtered nodes
    const connections = flowConnections.filter(conn => 
      nodeIds.includes(conn.source) && nodeIds.includes(conn.target)
    );
    
    setFilteredNodes(nodes);
    setFilteredConnections(connections);
    
    // Auto-center on the filtered nodes
    if (containerRef.current && nodes.length > 0) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate the bounding box of filtered nodes
      const minX = Math.min(...nodes.map(n => n.x));
      const maxX = Math.max(...nodes.map(n => n.x));
      const minY = Math.min(...nodes.map(n => n.y));
      const maxY = Math.max(...nodes.map(n => n.y));
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // Offset to center the visualization
      setViewportOffset({
        x: containerWidth / 2 - centerX,
        y: containerHeight / 2 - centerY
      });
    }
  }, [filter]);
  
  // Animation frame update
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 7);
    }, 800);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only handle left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setViewportOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };
  
  // Reset view to center
  const resetView = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate the bounding box of all (or filtered) nodes
      const nodes = filter ? filteredNodes : flowNodes;
      const minX = Math.min(...nodes.map(n => n.x));
      const maxX = Math.max(...nodes.map(n => n.x));
      const minY = Math.min(...nodes.map(n => n.y));
      const maxY = Math.max(...nodes.map(n => n.y));
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      
      // Offset to center the visualization
      setViewportOffset({
        x: containerWidth / 2 - centerX,
        y: containerHeight / 2 - centerY
      });
      setZoom(1);
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status border color
  const getStatusBorderColor = (status: string) => {
    switch(status) {
      case 'active': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'error': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };
  
  // Get node info for the selected node
  const getSelectedNodeInfo = () => {
    if (!selectedNode) return null;
    
    const node = flowNodes.find(n => n.id === selectedNode);
    const metrics = flowMetrics[selectedNode];
    
    if (!node || !metrics) return null;
    
    return { node, metrics };
  };
  
  // Calculate connection path with offset and zoom
  const getConnectionPath = (source: any, target: any) => {
    // Apply viewport transformations
    const sourceX = source.x * zoom + viewportOffset.x;
    const sourceY = source.y * zoom + viewportOffset.y;
    const targetX = target.x * zoom + viewportOffset.x;
    const targetY = target.y * zoom + viewportOffset.y;
    
    // Simple bezier curve
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2 - 40 * zoom; // Control point above the line
    
    return `M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`;
  };
  
  // Get current flow rate for animation
  const getCurrentFlowRate = (source: string, target: string) => {
    const connectionId = getConnectionId(source, target);
    const rates = flowRateHistory[connectionId];
    return rates ? rates[animationFrame] : 50;
  };

  // Get connection color based on status
  const getConnectionColor = (status: string) => {
    switch(status) {
      case 'active': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'error': return '#F44336';
      default: return '#909090';
    }
  };
  
  return (
    <Card 
      title="Enterprise Data Flow Visualization"
      className="p-0 overflow-hidden"
      actions={
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={resetView}
          >
            Reset View
          </Button>
          <Button 
            variant={showNodeMetrics ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setShowNodeMetrics(!showNodeMetrics)}
          >
            {showNodeMetrics ? 'Hide Node Metrics' : 'Show Node Metrics'}
          </Button>
          <Button 
            variant={showConnectionMetrics ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setShowConnectionMetrics(!showConnectionMetrics)}
          >
            {showConnectionMetrics ? 'Hide Flow Metrics' : 'Show Flow Metrics'}
          </Button>
        </div>
      }
    >
      <div 
        ref={containerRef}
        className="relative bg-background-elevated/60 h-[calc(100vh-400px)] min-h-[500px] p-4 overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div className="absolute top-4 left-4 bg-background-paper/80 p-2 rounded-md text-xs z-10 pointer-events-none backdrop-blur-sm">
          <div>Pan: Click and drag</div>
          <div>Zoom: Scroll wheel</div>
          <div>Zoom level: {Math.round(zoom * 100)}%</div>
        </div>
        
        {/* Grid lines for better spatial reference */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: `translate(${viewportOffset.x % (100 * zoom)}px, ${viewportOffset.y % (100 * zoom)}px)` }}>
          <div className="grid" style={{ gridTemplateColumns: `repeat(auto-fill, ${100 * zoom}px)`, gridTemplateRows: `repeat(auto-fill, ${100 * zoom}px)` }}>
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={`grid-cell-${i}`} className="border border-secondary/5" style={{ width: `${100 * zoom}px`, height: `${100 * zoom}px` }}></div>
            ))}
          </div>
        </div>
        
        {/* SVG for connections */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#FFFFFF" />
            </marker>
            
            {/* Define gradients for different connection statuses */}
            <linearGradient id="gradient-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC107" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFC107" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="gradient-error" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F44336" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F44336" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          
          {filteredConnections.map(conn => {
            const source = filteredNodes.find(n => n.id === conn.source);
            const target = filteredNodes.find(n => n.id === conn.target);
            
            if (!source || !target) return null;
            
            const flowRate = getCurrentFlowRate(conn.source, conn.target);
            const strokeWidth = Math.max(1, flowRate / 20) * zoom;
            
            return (
              <g key={`${conn.source}-${conn.target}`}>
                <path
                  d={getConnectionPath(source, target)}
                  fill="none"
                  stroke={`url(#gradient-${conn.status})`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${5 * zoom},${5 * zoom}`}
                  className="connection-path"
                  markerEnd="url(#arrowhead)"
                />
                
                {showConnectionMetrics && (
                  <text
                    x={(source.x * zoom + target.x * zoom) / 2 + viewportOffset.x}
                    y={(source.y * zoom + target.y * zoom) / 2 - 15 * zoom + viewportOffset.y}
                    className="text-xs fill-current text-white"
                    textAnchor="middle"
                    style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)', fontSize: `${12 * zoom}px` }}
                  >
                    {`${flowRate}%`}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Nodes */}
        {filteredNodes.map(node => {
          const nodeMetrics = flowMetrics[node.id];
          // Apply viewport transformations
          const nodeX = node.x * zoom + viewportOffset.x;
          const nodeY = node.y * zoom + viewportOffset.y;
          
          return (
            <div
              key={node.id}
              className={`absolute px-4 py-2 border-2 ${
                selectedNode === node.id 
                  ? 'border-[#FF3333] shadow-lg shadow-[#FF3333]/20' 
                  : getStatusBorderColor(nodeMetrics.status)
              } rounded-md bg-background-paper text-white transition-all hover:shadow-md backdrop-blur-sm cursor-pointer`}
              style={{ 
                left: nodeX, 
                top: nodeY, 
                transform: 'translate(-50%, -50%)',
                fontSize: `${zoom}rem`,
                padding: `${0.5 * zoom}rem ${1 * zoom}rem`,
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent dragging when clicking on a node
                setSelectedNode(node.id === selectedNode ? null : node.id);
              }}
            >
              <div className="flex items-center">
                <span className="text-xl mr-2">{nodeTypeIcons[node.type]}</span>
                <div>
                  <div className="font-medium">{node.name}</div>
                  <div className="flex items-center text-xs text-text-secondary">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(nodeMetrics.status)} mr-1`}></div>
                    <span className="capitalize">{node.type}</span>
                  </div>
                </div>
              </div>
              
              {showNodeMetrics && (
                <div className="mt-2 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>Data Points:</div>
                  <div className="text-right">{nodeMetrics.dataPoints.toLocaleString()}</div>
                  <div>Throughput:</div>
                  <div className="text-right">{nodeMetrics.throughput}</div>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Selected Node Details Sidebar */}
        {selectedNode && getSelectedNodeInfo() && (
          <div className="absolute top-4 right-4 w-64 bg-background-paper rounded-md shadow-lg p-4 border-2 border-[#FF3333]/30 z-20">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium">{getSelectedNodeInfo()?.node.name}</h3>
              <button 
                className="text-text-secondary hover:text-text-primary"
                onClick={() => setSelectedNode(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(getSelectedNodeInfo()?.metrics.status)} mr-2`}></div>
                <span className="capitalize">{getSelectedNodeInfo()?.metrics.status}</span>
              </div>
              
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">Type:</span>
                  <span className="capitalize">{getSelectedNodeInfo()?.node.type}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">Category:</span>
                  <span className="capitalize">{getSelectedNodeInfo()?.node.category}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">Data Points:</span>
                  <span>{getSelectedNodeInfo()?.metrics.dataPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">Throughput:</span>
                  <span>{getSelectedNodeInfo()?.metrics.throughput}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-text-secondary">Latency:</span>
                  <span>{getSelectedNodeInfo()?.metrics.latency}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button variant="secondary" size="sm">View Details</Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-secondary/20">
        <h3 className="font-medium mb-2">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(nodeTypeIcons).map(([type, icon]) => (
            <div key={type} className="flex items-center">
              <span className="text-lg mr-1">{icon}</span>
              <span className="capitalize">{type}</span>
            </div>
          ))}
          
          <div className="w-px h-4 bg-secondary/30 mx-2"></div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Error</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnterpriseDataFlow; 