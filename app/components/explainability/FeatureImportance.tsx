'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

type Model = {
  id: string;
  name: string;
  type: string;
  createdAt: Date;
  description: string;
  featuresCount: number;
};

type Feature = {
  id: string;
  name: string;
  importance: number;
  description: string;
  category: string;
};

type ModelFeatures = {
  modelId: string;
  features: Feature[];
};

// Sample data
const sampleModels: Model[] = [
  {
    id: 'model-001',
    name: 'Crime Pattern Predictor',
    type: 'Random Forest',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    description: 'Predicts crime patterns based on historical data and environmental factors',
    featuresCount: 24
  },
  {
    id: 'model-002',
    name: 'Criminal Profiler',
    type: 'Neural Network',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
    description: 'Creates criminal profiles based on behavior patterns and case similarities',
    featuresCount: 38
  },
  {
    id: 'model-003',
    name: 'Witness Statement Analyzer',
    type: 'Transformer',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    description: 'Analyzes witness statements for consistency and reliability',
    featuresCount: 16
  }
];

const sampleFeatures: ModelFeatures[] = [
  {
    modelId: 'model-001',
    features: [
      { id: 'f-001', name: 'Time of Day', importance: 0.92, description: 'Hour when crime occurred', category: 'Temporal' },
      { id: 'f-002', name: 'Weather Conditions', importance: 0.85, description: 'Weather conditions during crime', category: 'Environmental' },
      { id: 'f-003', name: 'Proximity to Transit', importance: 0.78, description: 'Distance to nearest public transit', category: 'Location' },
      { id: 'f-004', name: 'Day of Week', importance: 0.76, description: 'Day of the week crime occurred', category: 'Temporal' },
      { id: 'f-005', name: 'Population Density', importance: 0.73, description: 'Population density in area', category: 'Demographic' },
      { id: 'f-006', name: 'Previous Incidents', importance: 0.71, description: 'Number of previous incidents in area', category: 'Historical' },
      { id: 'f-007', name: 'Lighting Conditions', importance: 0.69, description: 'Lighting conditions at location', category: 'Environmental' },
      { id: 'f-008', name: 'Proximity to Bars', importance: 0.67, description: 'Distance to nearest bar or nightclub', category: 'Location' },
      { id: 'f-009', name: 'Police Patrol Frequency', importance: 0.65, description: 'Frequency of police patrols in area', category: 'Security' },
      { id: 'f-010', name: 'Income Level', importance: 0.64, description: 'Average income level in area', category: 'Demographic' },
      { id: 'f-011', name: 'Month of Year', importance: 0.62, description: 'Month when crime occurred', category: 'Temporal' },
      { id: 'f-012', name: 'Building Security', importance: 0.59, description: 'Security level of nearby buildings', category: 'Security' }
    ]
  },
  {
    modelId: 'model-002',
    features: [
      { id: 'f-101', name: 'Modus Operandi', importance: 0.95, description: 'Specific method of operation', category: 'Behavioral' },
      { id: 'f-102', name: 'Crime Scene Organization', importance: 0.89, description: 'Level of organization at crime scene', category: 'Behavioral' },
      { id: 'f-103', name: 'Violence Level', importance: 0.88, description: 'Level of violence used', category: 'Behavioral' },
      { id: 'f-104', name: 'Forensic Countermeasures', importance: 0.82, description: 'Efforts to conceal evidence', category: 'Behavioral' },
      { id: 'f-105', name: 'Victim Selection', importance: 0.81, description: 'Pattern in victim selection', category: 'Victimology' },
      { id: 'f-106', name: 'Time Between Crimes', importance: 0.78, description: 'Time interval between related crimes', category: 'Temporal' },
      { id: 'f-107', name: 'Geographic Movement', importance: 0.76, description: 'Movement patterns across locations', category: 'Spatial' },
      { id: 'f-108', name: 'Communication with Authorities', importance: 0.74, description: 'Communication attempts with police', category: 'Behavioral' },
      { id: 'f-109', name: 'Trophy Taking', importance: 0.73, description: 'Evidence of taking items as trophies', category: 'Behavioral' },
      { id: 'f-110', name: 'Signature Elements', importance: 0.71, description: 'Unique elements not necessary for crime', category: 'Behavioral' }
    ]
  },
  {
    modelId: 'model-003',
    features: [
      { id: 'f-201', name: 'Statement Consistency', importance: 0.94, description: 'Internal consistency of witness statement', category: 'Reliability' },
      { id: 'f-202', name: 'Detail Level', importance: 0.91, description: 'Level of detail in description', category: 'Content' },
      { id: 'f-203', name: 'Verifiable Elements', importance: 0.87, description: 'Elements that can be independently verified', category: 'Reliability' },
      { id: 'f-204', name: 'Sensory Information', importance: 0.85, description: 'Sensory details included in statement', category: 'Content' },
      { id: 'f-205', name: 'Emotional Content', importance: 0.83, description: 'Emotional content of statement', category: 'Psychological' },
      { id: 'f-206', name: 'Timeline Accuracy', importance: 0.82, description: 'Accuracy of timeline described', category: 'Reliability' },
      { id: 'f-207', name: 'Language Complexity', importance: 0.76, description: 'Complexity of language used', category: 'Linguistic' },
      { id: 'f-208', name: 'Unusual Details', importance: 0.74, description: 'Presence of unusual or unique details', category: 'Content' }
    ]
  }
];

const categoryColors: Record<string, string> = {
  Temporal: 'bg-blue-100 text-blue-800',
  Environmental: 'bg-green-100 text-green-800',
  Location: 'bg-purple-100 text-purple-800',
  Demographic: 'bg-yellow-100 text-yellow-800',
  Historical: 'bg-indigo-100 text-indigo-800',
  Security: 'bg-red-100 text-red-800',
  Behavioral: 'bg-orange-100 text-orange-800',
  Victimology: 'bg-pink-100 text-pink-800',
  Spatial: 'bg-cyan-100 text-cyan-800',
  Reliability: 'bg-emerald-100 text-emerald-800',
  Content: 'bg-violet-100 text-violet-800',
  Psychological: 'bg-rose-100 text-rose-800',
  Linguistic: 'bg-amber-100 text-amber-800'
};

type FeatureImportanceProps = {
  selectedModel: string | null;
  onSelectModel: (id: string) => void;
};

export default function FeatureImportance({ selectedModel, onSelectModel }: FeatureImportanceProps) {
  const [models] = useState<Model[]>(sampleModels);
  const [features] = useState<ModelFeatures[]>(sampleFeatures);
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [thresholdValue, setThresholdValue] = useState<number>(0.6);
  
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      onSelectModel(models[0].id);
    }
  }, [selectedModel, models, onSelectModel]);
  
  const selectedModelData = models.find(model => model.id === selectedModel);
  const modelFeatures = features.find(f => f.modelId === selectedModel)?.features || [];
  
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    modelFeatures.forEach(feature => categories.add(feature.category));
    return Array.from(categories);
  };
  
  const uniqueCategories = getUniqueCategories();
  
  const filteredFeatures = modelFeatures.filter(feature => {
    // Apply category filter
    if (categoryFilter !== 'all' && feature.category !== categoryFilter) return false;
    
    // Apply importance threshold
    if (feature.importance < thresholdValue) return false;
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return feature.name.toLowerCase().includes(query) || 
             feature.description.toLowerCase().includes(query) ||
             feature.category.toLowerCase().includes(query);
    }
    
    return true;
  });
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Sort features by importance (highest first)
  const sortedFeatures = [...filteredFeatures].sort((a, b) => b.importance - a.importance);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Feature Importance Analysis</h2>
          <p className="text-sm text-text-secondary mt-1">
            Understand which features have the most influence on model predictions
          </p>
        </div>
      </div>
      
      {/* Model Selection */}
      <Card title="Select Model" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map(model => (
            <div 
              key={model.id}
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                selectedModel === model.id 
                  ? 'border-[#FF3333] bg-[#300000] text-white shadow-md' 
                  : 'border-secondary/20 hover:border-secondary/40'
              }`}
              onClick={() => onSelectModel(model.id)}
            >
              <div className="font-medium mb-1">{model.name}</div>
              <div className="text-sm text-text-secondary mb-2">{model.type}</div>
              <div className="text-xs text-text-secondary">Created: {formatDate(model.createdAt)}</div>
              <div className="text-xs text-text-secondary">Features: {model.featuresCount}</div>
            </div>
          ))}
        </div>
      </Card>
      
      {selectedModelData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <Card title="Feature Filters" className="mb-6 lg:mb-0">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Search Features</label>
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      className="w-full px-3 py-2 border border-secondary/30 rounded-md"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Importance Threshold: {thresholdValue.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={thresholdValue}
                      onChange={(e) => setThresholdValue(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>0.00</span>
                      <span>0.50</span>
                      <span>1.00</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Feature Category</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={categoryFilter === 'all' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setCategoryFilter('all')}
                        className={categoryFilter === 'all' ? 'bg-[#FF3333] border-[#FF3333] hover:bg-[#CC0000]' : ''}
                      >
                        All
                      </Button>
                      {uniqueCategories.map(category => (
                        <Button
                          key={category}
                          variant={categoryFilter === category ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setCategoryFilter(category)}
                          className={categoryFilter === category ? 'bg-[#FF3333] border-[#FF3333] hover:bg-[#CC0000]' : ''}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card title="Model Information" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-lg mb-2">{selectedModelData.name}</div>
                    <div className="text-text-secondary mb-4">{selectedModelData.description}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">
                        <span className="text-text-secondary">Type: </span>
                        {selectedModelData.type}
                      </div>
                      <div className="text-sm">
                        <span className="text-text-secondary">Created: </span>
                        {formatDate(selectedModelData.createdAt)}
                      </div>
                      <div className="text-sm">
                        <span className="text-text-secondary">Features: </span>
                        {selectedModelData.featuresCount}
                      </div>
                      <div className="text-sm">
                        <span className="text-text-secondary">Status: </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-sm text-text-secondary mb-2">Feature Importance Distribution</div>
                    <div className="h-20 flex items-end space-x-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const min = i / 10;
                        const max = (i + 1) / 10;
                        const count = modelFeatures.filter(f => f.importance >= min && f.importance < max).length;
                        const maxCount = Math.max(...Array.from({ length: 10 }, (_, j) => {
                          const minJ = j / 10;
                          const maxJ = (j + 1) / 10;
                          return modelFeatures.filter(f => f.importance >= minJ && f.importance < maxJ).length;
                        }));
                        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        
                        return (
                          <div key={i} className="flex flex-col items-center flex-1">
                            <div 
                              className="w-full bg-primary/80" 
                              style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                            ></div>
                            <div className="text-xs mt-1">{(min * 10).toFixed(0)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card title={`Feature Importance (${sortedFeatures.length} features)`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-secondary/20">
                        <th className="px-4 py-3">Feature</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Importance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFeatures.length > 0 ? (
                        sortedFeatures.map((feature) => (
                          <tr key={feature.id} className="border-b border-secondary/10 hover:bg-background-elevated">
                            <td className="px-4 py-3">
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-text-secondary text-xs">{feature.description}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[feature.category] || 'bg-gray-100 text-gray-800'}`}>
                                {feature.category}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-24 h-2 bg-background-paper rounded-full overflow-hidden mr-2">
                                  <div 
                                    className="h-full bg-primary"
                                    style={{ width: `${feature.importance * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{(feature.importance * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-text-secondary">
                            No features match the current filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 