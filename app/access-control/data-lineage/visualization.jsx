'use client'

import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'

// Sample data for the graph
const sampleData = {
  nodes: [
    { id: 'source1', type: 'source', label: 'Customer Database', group: 'source' },
    { id: 'source2', type: 'source', label: 'Sales Database', group: 'source' },
    { id: 'source3', type: 'source', label: 'External API', group: 'source' },
    
    { id: 'transform1', type: 'transform', label: 'ETL Process', group: 'transform' },
    { id: 'transform2', type: 'transform', label: 'Data Cleaning', group: 'transform' },
    { id: 'transform3', type: 'transform', label: 'Aggregation', group: 'transform' },
    { id: 'transform4', type: 'transform', label: 'Join Operation', group: 'transform' },
    
    { id: 'dataset1', type: 'dataset', label: 'Customer Analytics', group: 'dataset' },
    { id: 'dataset2', type: 'dataset', label: 'Sales Overview', group: 'dataset' },
    { id: 'dataset3', type: 'dataset', label: 'Marketing Data', group: 'dataset' },
    
    { id: 'output1', type: 'output', label: 'Executive Dashboard', group: 'output' },
    { id: 'output2', type: 'output', label: 'Sales Report', group: 'output' },
    { id: 'output3', type: 'output', label: 'Predictive Model', group: 'output' }
  ],
  links: [
    { source: 'source1', target: 'transform1', value: 1 },
    { source: 'source2', target: 'transform1', value: 1 },
    { source: 'source2', target: 'transform2', value: 1 },
    { source: 'source3', target: 'transform2', value: 1 },
    
    { source: 'transform1', target: 'transform4', value: 1 },
    { source: 'transform2', target: 'transform3', value: 1 },
    { source: 'transform3', target: 'dataset1', value: 1 },
    { source: 'transform4', target: 'dataset2', value: 1 },
    { source: 'transform4', target: 'dataset3', value: 1 },
    
    { source: 'dataset1', target: 'output1', value: 1 },
    { source: 'dataset1', target: 'output3', value: 1 },
    { source: 'dataset2', target: 'output1', value: 1 },
    { source: 'dataset2', target: 'output2', value: 1 },
    { source: 'dataset3', target: 'output2', value: 1 },
    { source: 'dataset3', target: 'output3', value: 1 }
  ]
};

export default function DataLineageVisualization({ width = 800, height = 600 }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Create a group for the graph
    const g = svg.append('g');
    
    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.4, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Define arrow markers
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');
    
    // Create a force simulation
    const simulation = d3.forceSimulation(sampleData.nodes)
      .force('link', d3.forceLink(sampleData.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));
    
    // Define node colors based on type
    const colors = {
      source: '#4CAF50',    // Green
      transform: '#2196F3',  // Blue
      dataset: '#FF9800',    // Orange
      output: '#E91E63'      // Pink
    };
    
    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(sampleData.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value))
      .attr('marker-end', 'url(#arrowhead)');
    
    // Create node groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(sampleData.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d);
        event.stopPropagation();
      });
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', 10)
      .attr('fill', d => colors[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
    
    // Add labels to nodes
    node.append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .attr('pointer-events', 'none');
    
    // Update positions on each simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Enable full-page click to deselect
    svg.on('click', () => setSelectedNode(null));
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Return cleanup function
    return () => {
      simulation.stop();
    };
  }, [width, height]);
  
  return (
    <div className="relative">
      <svg ref={svgRef} className="border border-secondary/10 rounded-lg bg-background-paper"></svg>
      
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-background border border-secondary/20 rounded-lg p-4 shadow-lg w-64">
          <h3 className="font-medium mb-2">{selectedNode.label}</h3>
          <div className="text-sm mb-2">
            <span className="text-text-secondary">Type:</span> {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
          </div>
          <div className="border-t border-secondary/10 pt-2 mt-2">
            <h4 className="text-sm font-medium mb-1">Connected To:</h4>
            <ul className="text-xs space-y-1">
              {sampleData.links
                .filter(link => link.source.id === selectedNode.id || link.target.id === selectedNode.id)
                .map((link, i) => {
                  const connectedNode = link.source.id === selectedNode.id 
                    ? sampleData.nodes.find(n => n.id === link.target.id) 
                    : sampleData.nodes.find(n => n.id === link.source.id);
                  
                  return (
                    <li key={i} className="flex items-center">
                      <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: colors[connectedNode.type] }}></span>
                      {connectedNode.label}
                      <span className="ml-1 opacity-50">{link.source.id === selectedNode.id ? '→' : '←'}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-background border border-secondary/20 rounded-lg p-2 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-1 bg-green-500"></span>
            <span>Source</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-1 bg-blue-500"></span>
            <span>Transform</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-1 bg-orange-500"></span>
            <span>Dataset</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-1 bg-pink-500"></span>
            <span>Output</span>
          </div>
        </div>
      </div>
    </div>
  );
} 