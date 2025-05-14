'use client';

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Types for the insight chain
type InsightNode = {
  id: string;
  type: 'data' | 'process' | 'insight' | 'decision';
  label: string;
  description: string;
  confidence?: number;
  timestamp: Date;
  sources?: string[];
};

type InsightEdge = {
  source: string;
  target: string;
  label?: string;
};

type InsightChainData = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  nodes: InsightNode[];
  edges: InsightEdge[];
};

// Sample data
const sampleInsightChains: InsightChainData[] = [
  {
    id: 'chain-001',
    name: 'Criminal Pattern Recognition',
    description: 'Insight chain for detecting patterns in criminal activity across Gotham City',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    nodes: [
      {
        id: 'n1',
        type: 'data',
        label: 'GCPD Crime Reports',
        description: 'Raw crime reports from GCPD database for the last 30 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        sources: ['GCPD Database']
      },
      {
        id: 'n2',
        type: 'data',
        label: 'Witness Statements',
        description: 'Collected witness statements from relevant cases',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
        sources: ['GCPD Interviews']
      },
      {
        id: 'n3',
        type: 'process',
        label: 'Data Preprocessing',
        description: 'Cleaned and normalized crime data, extracted key entities and locations',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      },
      {
        id: 'n4',
        type: 'process',
        label: 'Spatiotemporal Analysis',
        description: 'Analyzed crime patterns across time and locations',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
      {
        id: 'n5',
        type: 'insight',
        label: 'Distinct MO Pattern',
        description: 'Identified a unique modus operandi in jewelry store robberies',
        confidence: 0.87,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      },
      {
        id: 'n6',
        type: 'insight',
        label: 'Temporal Connection',
        description: 'Crimes occur specifically during weather events that reduce visibility',
        confidence: 0.79,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      },
      {
        id: 'n7',
        type: 'process',
        label: 'Suspect Analysis',
        description: 'Cross-referenced MO with known criminals',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      },
      {
        id: 'n8',
        type: 'insight',
        label: 'Primary Suspect Identified',
        description: 'Mr. Freeze identified as primary suspect based on pattern and methods',
        confidence: 0.92,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        id: 'n9',
        type: 'decision',
        label: 'Resource Allocation',
        description: 'Redirected GCPD resources to monitor diamond district during storm forecast',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      }
    ],
    edges: [
      { source: 'n1', target: 'n3' },
      { source: 'n2', target: 'n3' },
      { source: 'n3', target: 'n4' },
      { source: 'n4', target: 'n5', label: 'Derived' },
      { source: 'n4', target: 'n6', label: 'Derived' },
      { source: 'n5', target: 'n7' },
      { source: 'n6', target: 'n7' },
      { source: 'n7', target: 'n8', label: 'Concluded' },
      { source: 'n8', target: 'n9', label: 'Informed' }
    ]
  },
  {
    id: 'chain-002',
    name: 'Organized Crime Network Analysis',
    description: 'Mapping connections between organized crime families in Gotham',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    nodes: [
      {
        id: 'n1',
        type: 'data',
        label: 'Financial Transactions',
        description: 'Suspicious financial transactions tracked by GCPD',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        sources: ['Gotham Bank Records']
      },
      {
        id: 'n2',
        type: 'data',
        label: 'Surveillance Data',
        description: 'Surveillance footage and reports from known meeting spots',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
        sources: ['GCPD Surveillance']
      },
      {
        id: 'n3',
        type: 'process',
        label: 'Network Analysis',
        description: 'Applied graph analysis to identify connections between individuals',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      },
      {
        id: 'n4',
        type: 'insight',
        label: 'Hidden Connection',
        description: 'Identified previously unknown connection between Falcone and Maroni families',
        confidence: 0.84,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
      },
      {
        id: 'n5',
        type: 'decision',
        label: 'Increased Surveillance',
        description: 'Allocated resources to monitor newly identified connections',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      }
    ],
    edges: [
      { source: 'n1', target: 'n3' },
      { source: 'n2', target: 'n3' },
      { source: 'n3', target: 'n4', label: 'Discovered' },
      { source: 'n4', target: 'n5', label: 'Led to' }
    ]
  }
];

export default function InsightChain() {
  const [insightChains, setInsightChains] = useState<InsightChainData[]>(sampleInsightChains);
  const [selectedChain, setSelectedChain] = useState<InsightChainData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChains = searchQuery.trim() === '' 
    ? insightChains 
    : insightChains.filter(chain => 
        chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chain.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectChain = (chain: InsightChainData) => {
    setSelectedChain(chain);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNodeTypeColor = (type: InsightNode['type']) => {
    switch(type) {
      case 'data': return 'bg-blue-500';
      case 'process': return 'bg-purple-500';
      case 'insight': return 'bg-green-500';
      case 'decision': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getNodeTypeName = (type: InsightNode['type']) => {
    switch(type) {
      case 'data': return 'Data Source';
      case 'process': return 'Process';
      case 'insight': return 'Insight';
      case 'decision': return 'Decision';
      default: return 'Unknown';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Insight Chains</h2>
          <p className="text-sm text-text-secondary mt-1">
            Trace how data sources lead to insights and decisions
          </p>
        </div>
        <Button variant="primary">Create New Chain</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Available Chains" className="mb-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search insight chains..."
                className="w-full px-3 py-2 border border-secondary/30 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredChains.length > 0 ? (
                filteredChains.map(chain => (
                  <div 
                    key={chain.id} 
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedChain?.id === chain.id 
                        ? 'bg-primary/10 border-l-4 border-primary' 
                        : 'bg-background-elevated hover:bg-background-elevated/80'
                    }`}
                    onClick={() => handleSelectChain(chain)}
                  >
                    <div className="font-medium">{chain.name}</div>
                    <div className="text-sm text-text-secondary line-clamp-2">{chain.description}</div>
                    <div className="text-xs text-text-secondary mt-2">Created: {formatDate(chain.createdAt)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-text-secondary">
                  No insight chains found
                </div>
              )}
            </div>
          </Card>
          
          <Card title="Chain Details" className="mb-4 lg:mb-0">
            {selectedChain ? (
              <div>
                <h3 className="text-lg font-medium mb-2">{selectedChain.name}</h3>
                <p className="text-text-secondary mb-4">{selectedChain.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-background-elevated p-3 rounded-md">
                    <div className="text-sm text-text-secondary">Nodes</div>
                    <div className="text-xl font-bold">{selectedChain.nodes.length}</div>
                  </div>
                  <div className="bg-background-elevated p-3 rounded-md">
                    <div className="text-sm text-text-secondary">Connections</div>
                    <div className="text-xl font-bold">{selectedChain.edges.length}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="text-sm">Data Source</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div className="text-sm">Process</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="text-sm">Insight</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <div className="text-sm">Decision</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="secondary" size="sm">Export Chain</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-text-secondary">
                Select an insight chain to view details
              </div>
            )}
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card title="Insight Chain Visualization" className="h-full">
            {selectedChain ? (
              <div>
                <div className="mb-4 p-3 bg-background-elevated rounded-md">
                  <p className="text-sm text-text-secondary">
                    The insight chain shows how data flows through analysis processes to generate insights and inform decisions.
                  </p>
                </div>
                
                <div className="space-y-4 mb-4">
                  {selectedChain.nodes.map((node) => (
                    <div key={node.id} className="flex items-start p-4 border border-secondary/20 rounded-md">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0 ${getNodeTypeColor(node.type)}`}>
                        {node.type === 'data' && <span>D</span>}
                        {node.type === 'process' && <span>P</span>}
                        {node.type === 'insight' && <span>I</span>}
                        {node.type === 'decision' && <span>D</span>}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{node.label}</div>
                            <div className="text-xs text-text-secondary mb-1">{getNodeTypeName(node.type)}</div>
                          </div>
                          <div className="text-xs text-text-secondary">{formatDate(node.timestamp)}</div>
                        </div>
                        <p className="text-sm">{node.description}</p>
                        
                        {node.confidence && (
                          <div className="mt-2">
                            <div className="text-xs text-text-secondary mb-1">Confidence: {(node.confidence * 100).toFixed(0)}%</div>
                            <div className="w-full h-1.5 bg-background-paper rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${node.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {node.sources && node.sources.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-text-secondary">Sources:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {node.sources.map((source, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-background-elevated rounded-full">
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <div className="text-xs text-text-secondary">Connected to:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedChain.edges
                              .filter(edge => edge.source === node.id || edge.target === node.id)
                              .map((edge, i) => {
                                const connectedNodeId = edge.source === node.id ? edge.target : edge.source;
                                const connectedNode = selectedChain.nodes.find(n => n.id === connectedNodeId);
                                const direction = edge.source === node.id ? 'outgoing' : 'incoming';
                                
                                return connectedNode ? (
                                  <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                                    direction === 'outgoing' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {direction === 'outgoing' ? '→ ' : '← '}
                                    {connectedNode.label}
                                    {edge.label && ` (${edge.label})`}
                                  </span>
                                ) : null;
                              })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">No Chain Selected</h3>
                <p className="text-text-secondary text-center max-w-md">
                  Select an insight chain from the list to view its visualization and explore how insights were derived.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 