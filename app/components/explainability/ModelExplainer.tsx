'use client';

import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ModelExplainerProps {
  selectedModel: string | null;
  onSelectModel: (modelId: string) => void;
}

interface ModelType {
  id: string;
  name: string;
  type: string;
  version: string;
  accuracy: number;
  lastUpdated: string;
  complexity: 'low' | 'medium' | 'high';
  features: number;
  description: string;
}

export default function ModelExplainer({
  selectedModel,
  onSelectModel
}: ModelExplainerProps) {
  const [models, setModels] = useState<ModelType[]>([
    {
      id: 'model-1',
      name: 'Anomaly Detector',
      type: 'Isolation Forest',
      version: '2.1.0',
      accuracy: 94.2,
      lastUpdated: '2023-10-15',
      complexity: 'medium',
      features: 18,
      description: 'Detects anomalies in time series data using isolation forest algorithm with adaptive thresholds.'
    },
    {
      id: 'model-2',
      name: 'Forecasting Engine',
      type: 'ARIMA + LSTM Hybrid',
      version: '3.0.1',
      accuracy: 89.7,
      lastUpdated: '2023-11-02',
      complexity: 'high',
      features: 26,
      description: 'Combines statistical ARIMA with deep learning LSTM for time series forecasting with seasonality handling.'
    },
    {
      id: 'model-3',
      name: 'Semantic Classifier',
      type: 'Transformer',
      version: '2.0.0',
      accuracy: 96.3,
      lastUpdated: '2023-09-28',
      complexity: 'high',
      features: 42,
      description: 'Classifies and extracts semantic meaning from unstructured text data using transformer architecture.'
    },
    {
      id: 'model-4',
      name: 'Regression Analyzer',
      type: 'XGBoost',
      version: '1.5.2',
      accuracy: 92.1,
      lastUpdated: '2023-10-10',
      complexity: 'medium',
      features: 32,
      description: 'Performs gradient boosted regression for numerical predictions with feature importance analysis.'
    },
    {
      id: 'model-5',
      name: 'Clustering Engine',
      type: 'DBSCAN',
      version: '1.2.0',
      accuracy: 88.5,
      lastUpdated: '2023-08-22',
      complexity: 'low',
      features: 12,
      description: 'Groups similar data points together using density-based spatial clustering algorithm.'
    }
  ]);

  const [activeModelId, setActiveModelId] = useState<string | null>(selectedModel);
  const [modelDetails, setModelDetails] = useState<any | null>(null);
  const [modelExplanation, setModelExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Select a default model if none is selected
  useEffect(() => {
    if (!activeModelId && models.length > 0) {
      setActiveModelId(models[0].id);
      onSelectModel(models[0].id);
    }
  }, [models, activeModelId, onSelectModel]);

  // Handle model selection
  const handleSelectModel = (modelId: string) => {
    setActiveModelId(modelId);
    onSelectModel(modelId);
    setModelDetails(null);
    setModelExplanation(null);
    
    // Load model details
    setIsLoading(true);
    setTimeout(() => {
      setModelDetails({
        architecture: [
          { layer: 'Input', nodes: 32, activation: 'None' },
          { layer: 'Dense', nodes: 64, activation: 'ReLU' },
          { layer: 'Dropout', rate: 0.2 },
          { layer: 'Dense', nodes: 32, activation: 'ReLU' },
          { layer: 'Output', nodes: 1, activation: 'Sigmoid' }
        ],
        parameters: 6240,
        trainingData: {
          samples: 28540,
          split: '80/20',
          augmentation: 'None'
        },
        performance: {
          accuracy: 0.942,
          precision: 0.938,
          recall: 0.925,
          f1Score: 0.931
        },
        biasMetrics: {
          genderBias: 0.03,
          ageBias: 0.05,
          geographicBias: 0.02
        }
      });
      
      setModelExplanation(`This model implements a density-based clustering algorithm that groups data points based on their proximity in a multi-dimensional feature space. It identifies core samples in areas of high density and expands clusters from them.

The key characteristics of this model include:

1. No predefined number of clusters required
2. Can find arbitrarily shaped clusters
3. Robust to outliers
4. Uses the concept of "density reachability" to form clusters

The model works by defining a neighborhood around each point and counting how many other points fall within that neighborhood. Points with more neighbors than a threshold are considered "core points." A cluster is formed by connecting core points that are within each other's neighborhoods.

Interpretability is provided through:
- Distance metrics between points
- Density visualization
- Silhouette coefficients to measure cluster quality
- Dimensional reduction techniques (PCA, t-SNE) for visualization

The model undergoes regular evaluations for bias by testing on diverse datasets and monitoring performance across different demographic groups.`);
      
      setIsLoading(false);
    }, 800);
  };

  // Get complexity color
  const getComplexityColor = (complexity: 'low' | 'medium' | 'high') => {
    if (complexity === 'low') return 'bg-green-100 text-green-800';
    if (complexity === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Find the active model
  const activeModel = models.find(m => m.id === activeModelId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Models List */}
      <div className="lg:col-span-1">
        <Card title="AI Models">
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search models..."
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              {models.map(model => (
                <div 
                  key={model.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    model.id === activeModelId 
                      ? 'bg-primary/10 border-l-4 border-primary' 
                      : 'bg-background-elevated hover:bg-background-paper'
                  }`}
                  onClick={() => handleSelectModel(model.id)}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{model.name}</div>
                    <div className={`px-2 py-0.5 text-xs rounded-full ${getComplexityColor(model.complexity)}`}>
                      {model.complexity}
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary">{model.type}</div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <div>Accuracy: {model.accuracy}%</div>
                    <div>v{model.version}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Model Details */}
      <div className="lg:col-span-2">
        {activeModel ? (
          <div className="space-y-6">
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-semibold">{activeModel.name}</h2>
                    <div className="text-text-secondary">{activeModel.type} • v{activeModel.version}</div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Export Explanation
                  </Button>
                </div>
                
                <p className="my-3">{activeModel.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Accuracy</div>
                    <div className="text-lg font-bold">{activeModel.accuracy}%</div>
                  </div>
                  
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Features</div>
                    <div className="text-lg font-bold">{activeModel.features}</div>
                  </div>
                  
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Complexity</div>
                    <div className="text-lg font-bold capitalize">{activeModel.complexity}</div>
                  </div>
                  
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Last Updated</div>
                    <div className="text-lg font-bold">{activeModel.lastUpdated}</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {modelDetails && (
                  <Card title="Model Architecture & Metrics">
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Architecture</h3>
                          <div className="space-y-2">
                            {modelDetails.architecture.map((layer: any, idx: number) => (
                              <div key={idx} className="flex items-center">
                                <div className="w-12 h-12 rounded-md bg-primary/20 flex items-center justify-center mr-3">
                                  {layer.layer.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium">{layer.layer}</div>
                                  <div className="text-sm text-text-secondary">
                                    {layer.nodes ? `Nodes: ${layer.nodes}` : ''}
                                    {layer.activation ? ` | Activation: ${layer.activation}` : ''}
                                    {layer.rate ? `Rate: ${layer.rate}` : ''}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-text-secondary">
                            Total Parameters: {modelDetails.parameters.toLocaleString()}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Performance</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Accuracy</span>
                                <span>{(modelDetails.performance.accuracy * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-background-paper rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: `${modelDetails.performance.accuracy * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Precision</span>
                                <span>{(modelDetails.performance.precision * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-background-paper rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500" 
                                  style={{ width: `${modelDetails.performance.precision * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Recall</span>
                                <span>{(modelDetails.performance.recall * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-background-paper rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500" 
                                  style={{ width: `${modelDetails.performance.recall * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>F1 Score</span>
                                <span>{(modelDetails.performance.f1Score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-background-paper rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-500" 
                                  style={{ width: `${modelDetails.performance.f1Score * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-medium mb-2 mt-6">Bias Analysis</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Gender Bias</span>
                                <span>{(modelDetails.biasMetrics.genderBias * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-background-paper rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500" 
                                  style={{ width: `${modelDetails.biasMetrics.genderBias * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Age Bias</span>
                                <span>{(modelDetails.biasMetrics.ageBias * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-background-paper rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500" 
                                  style={{ width: `${modelDetails.biasMetrics.ageBias * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Geographic Bias</span>
                                <span>{(modelDetails.biasMetrics.geographicBias * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 bg-background-paper rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500" 
                                  style={{ width: `${modelDetails.biasMetrics.geographicBias * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
                
                {modelExplanation && (
                  <Card title="Model Explanation">
                    <div className="p-4">
                      <div className="prose max-w-none">
                        {modelExplanation.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className={idx === 0 ? 'font-medium' : ''}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-3">
                        <Button variant="secondary" size="sm">
                          Generate Alternative Explanation
                        </Button>
                        <Button variant="primary" size="sm">
                          Test with Sample Data
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-medium mb-2">No Model Selected</h3>
            <p className="text-text-secondary mb-4">
              Select a model from the list to view details and explanations.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
} 