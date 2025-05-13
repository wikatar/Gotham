'use client'

import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

const modelTypes = [
  { id: 'regression', name: 'Regression', description: 'Predict continuous numerical values' },
  { id: 'classification', name: 'Classification', description: 'Categorize data into classes' },
  { id: 'clustering', name: 'Clustering', description: 'Group similar data points' },
  { id: 'timeseries', name: 'Time Series', description: 'Forecast future values based on historical patterns' },
  { id: 'anomaly', name: 'Anomaly Detection', description: 'Identify outliers and unusual patterns' }
]

const datasets = [
  { id: 'sales', name: 'Sales Data', source: 'CRM Database', rows: 12543, features: 32 },
  { id: 'customers', name: 'Customer Behavior', source: 'Web Analytics', rows: 45678, features: 64 },
  { id: 'inventory', name: 'Inventory Levels', source: 'ERP System', rows: 3214, features: 18 },
  { id: 'marketing', name: 'Marketing Campaign Results', source: 'Marketing Platform', rows: 870, features: 42 }
]

const recentModels = [
  { 
    id: 'model1', 
    name: 'Customer Churn Predictor', 
    type: 'classification',
    accuracy: 92.7,
    created: '2023-09-12T10:30:00Z',
    dataset: 'Customer Behavior',
    status: 'active'
  },
  { 
    id: 'model2', 
    name: 'Sales Forecast Q4', 
    type: 'timeseries',
    accuracy: 89.4,
    created: '2023-09-10T14:15:00Z',
    dataset: 'Sales Data',
    status: 'active'
  },
  { 
    id: 'model3', 
    name: 'Inventory Optimization', 
    type: 'regression',
    accuracy: 85.1,
    created: '2023-09-08T09:45:00Z',
    dataset: 'Inventory Levels',
    status: 'training'
  }
]

export default function PredictiveAnalyticsPanel() {
  const [activeStep, setActiveStep] = useState(1)
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedDataset, setSelectedDataset] = useState('')
  const [modelName, setModelName] = useState('')
  const [trainingStatus, setTrainingStatus] = useState<null | 'training' | 'complete' | 'error'>(null)
  const [trainingProgress, setTrainingProgress] = useState(0)
  
  const startTraining = () => {
    if (!selectedModel || !selectedDataset || !modelName) return
    
    setTrainingStatus('training')
    setTrainingProgress(0)
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTrainingStatus('complete')
          return 100
        }
        return prev + 5
      })
    }, 300)
  }
  
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <Card title="Create Predictive Model" className="mb-6">
          {/* Step indicator */}
          <div className="flex mb-6">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex-1 flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step < activeStep ? 'bg-accent text-text-primary' :
                    step === activeStep ? 'bg-primary border-2 border-accent' :
                    'bg-secondary/20'
                  }`}
                >
                  {step < activeStep ? '✓' : step}
                </div>
                <div 
                  className={`h-1 flex-1 ${
                    step < activeStep ? 'bg-accent' : 'bg-secondary/20'
                  } ${step === 4 ? 'hidden' : ''}`}
                ></div>
                <div className="text-xs text-text-secondary mt-2 absolute" style={{ marginLeft: '-1rem' }}>
                  {step === 1 ? 'Select Model' : 
                   step === 2 ? 'Choose Data' :
                   step === 3 ? 'Configure' :
                   'Train & Deploy'}
                </div>
              </div>
            ))}
          </div>
          
          {/* Step 1: Select model type */}
          {activeStep === 1 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Select Model Type</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {modelTypes.map(model => (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedModel === model.id 
                        ? 'border-accent bg-primary' 
                        : 'border-secondary/20 hover:bg-secondary/5'
                    }`}
                  >
                    <div className="font-medium mb-1">{model.name}</div>
                    <div className="text-sm text-text-secondary">{model.description}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setActiveStep(2)} 
                  disabled={!selectedModel}
                >
                  Next: Choose Dataset
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Select dataset */}
          {activeStep === 2 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Select Dataset</h3>
              <div className="overflow-hidden rounded-lg border border-secondary/20 mb-6">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/10">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Source</th>
                      <th className="py-3 px-4 text-left font-medium">Rows</th>
                      <th className="py-3 px-4 text-left font-medium">Features</th>
                      <th className="py-3 px-4 text-left font-medium">Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map(dataset => (
                      <tr 
                        key={dataset.id} 
                        className={`border-t border-secondary/10 hover:bg-secondary/5 ${
                          selectedDataset === dataset.id ? 'bg-primary' : ''
                        }`}
                      >
                        <td className="py-3 px-4">{dataset.name}</td>
                        <td className="py-3 px-4">{dataset.source}</td>
                        <td className="py-3 px-4">{dataset.rows.toLocaleString()}</td>
                        <td className="py-3 px-4">{dataset.features}</td>
                        <td className="py-3 px-4">
                          <input 
                            type="radio" 
                            name="dataset" 
                            checked={selectedDataset === dataset.id}
                            onChange={() => setSelectedDataset(dataset.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="secondary"
                  onClick={() => setActiveStep(1)}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setActiveStep(3)} 
                  disabled={!selectedDataset}
                >
                  Next: Configure Model
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Configure model */}
          {activeStep === 3 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Configure Your Model</h3>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Model Name</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Enter a descriptive name for your model"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Target Column</label>
                  <select className="w-full px-4 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none">
                    <option value="">Select target variable</option>
                    <option value="sales">Total Sales</option>
                    <option value="churn">Churn Probability</option>
                    <option value="conversion">Conversion Rate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Training/Testing Split</label>
                  <div className="flex items-center">
                    <input 
                      type="range" 
                      min="50" 
                      max="90" 
                      step="5"
                      defaultValue="70"
                      className="w-full"
                    />
                    <span className="ml-2 text-sm text-text-secondary">70/30</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Hyperparameters</label>
                  <div className="p-3 border border-secondary/20 rounded-md bg-secondary/5">
                    <div className="text-sm text-text-secondary mb-2">
                      Advanced parameters will be auto-tuned during training
                    </div>
                    <a href="#" className="text-sm text-accent">Customize hyperparameters</a>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="secondary"
                  onClick={() => setActiveStep(2)}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setActiveStep(4)} 
                  disabled={!modelName}
                >
                  Next: Train Model
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: Train and deploy */}
          {activeStep === 4 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Train & Deploy Model</h3>
              
              <div className="mb-6 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                <h4 className="font-medium mb-2">Model Configuration Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-text-secondary">Model Type:</div>
                    <div className="font-medium capitalize">{selectedModel}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary">Dataset:</div>
                    <div className="font-medium">{datasets.find(d => d.id === selectedDataset)?.name}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary">Model Name:</div>
                    <div className="font-medium">{modelName}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary">Target:</div>
                    <div className="font-medium">Total Sales</div>
                  </div>
                </div>
              </div>
              
              {trainingStatus === null && (
                <div className="text-center p-6">
                  <Button onClick={startTraining} disabled={!modelName}>
                    Start Training
                  </Button>
                  <div className="mt-2 text-sm text-text-secondary">
                    Training might take several minutes depending on data size
                  </div>
                </div>
              )}
              
              {trainingStatus === 'training' && (
                <div className="p-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <div>Training in progress...</div>
                    <div>{trainingProgress}%</div>
                  </div>
                  <div className="w-full bg-background-elevated rounded-full h-2 mb-4">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${trainingProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-text-secondary">
                    <div className="mb-1">• Loading and preprocessing data</div>
                    {trainingProgress > 20 && (
                      <div className="mb-1">• Splitting into training and validation sets</div>
                    )}
                    {trainingProgress > 40 && (
                      <div className="mb-1">• Training model and tuning hyperparameters</div>
                    )}
                    {trainingProgress > 70 && (
                      <div className="mb-1">• Evaluating model performance</div>
                    )}
                    {trainingProgress > 90 && (
                      <div className="mb-1">• Preparing deployment</div>
                    )}
                  </div>
                </div>
              )}
              
              {trainingStatus === 'complete' && (
                <div className="text-center p-6">
                  <div className="text-2xl mb-2 text-accent">✓</div>
                  <div className="font-medium mb-1">Training Complete!</div>
                  <div className="text-sm text-text-secondary mb-4">
                    Your model achieved 91.2% accuracy on the test dataset
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Button>
                      Deploy Model
                    </Button>
                    <Button variant="secondary">
                      View Metrics
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="secondary"
                  onClick={() => setActiveStep(3)}
                  disabled={trainingStatus === 'training'}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      <div className="col-span-4">
        <Card title="Recent Models" className="mb-6">
          <div className="space-y-3">
            {recentModels.map(model => (
              <div key={model.id} className="p-3 border border-secondary/10 rounded-lg">
                <div className="font-medium">{model.name}</div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-text-secondary capitalize">{model.type}</div>
                  <div className="text-xs px-2 py-0.5 rounded-full bg-secondary/20">
                    {model.status === 'active' ? '● Active' : '○ Training'}
                  </div>
                </div>
                <div className="text-xs text-text-secondary">
                  Accuracy: {model.accuracy}% | Dataset: {model.dataset}
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Model Performance" className="h-64">
          <div className="flex items-center justify-center h-full text-text-secondary text-sm">
            Select a model to view performance metrics
          </div>
        </Card>
      </div>
    </div>
  )
} 