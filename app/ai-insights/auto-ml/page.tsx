'use client'

import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Step 1: Problem Definition Component
function ProblemDefinitionStep({ modelConfig, setModelConfig, onNext }) {
  const [selectedType, setSelectedType] = useState(modelConfig.problemType || '')
  
  const problemTypes = [
    { 
      id: 'classification', 
      name: 'Classification', 
      description: 'Predict categories or classes',
      icon: '🏷️',
      examples: 'Customer churn, Spam detection, Sentiment analysis'
    },
    { 
      id: 'regression', 
      name: 'Regression', 
      description: 'Predict numerical values',
      icon: '📊',
      examples: 'Price prediction, Sales forecasting, Demand estimation'
    },
    { 
      id: 'clustering', 
      name: 'Clustering', 
      description: 'Group similar data points',
      icon: '🔍',
      examples: 'Customer segmentation, Anomaly detection, Document grouping'
    },
    { 
      id: 'timeseries', 
      name: 'Time Series', 
      description: 'Analyze sequential data over time',
      icon: '📈',
      examples: 'Stock price prediction, Weather forecasting, Sales trends'
    }
  ]
  
  const handleContinue = () => {
    setModelConfig({
      ...modelConfig,
      problemType: selectedType
    })
    onNext()
  }
  
  return (
    <div>
      <p className="text-text-secondary mb-6">
        First, let's define what type of problem you're trying to solve with machine learning.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {problemTypes.map(type => (
          <div 
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`p-4 border rounded-md cursor-pointer transition-all ${
              selectedType === type.id 
                ? 'border-accent bg-primary/10' 
                : 'border-secondary/20 hover:bg-secondary/5'
            }`}
          >
            <div className="flex items-center mb-2">
              <div className="text-2xl mr-2">{type.icon}</div>
              <div className="font-medium">{type.name}</div>
            </div>
            <p className="text-sm text-text-secondary mb-2">{type.description}</p>
            <div className="text-xs text-text-secondary">
              <span className="font-medium">Examples:</span> {type.examples}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={!selectedType}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

// Step 2: Data Selection Component
function DataSelectionStep({ modelConfig, setModelConfig, onNext, onBack }) {
  const [selectedDataset, setSelectedDataset] = useState(modelConfig.dataset || '')
  const [targetColumn, setTargetColumn] = useState(modelConfig.targetColumn || '')
  
  // Sample data sources
  const dataSources = [
    { id: 'ds1', name: 'Customer Database', type: 'SQL Database', tables: ['customers', 'orders', 'interactions'] },
    { id: 'ds2', name: 'Marketing Campaign Data', type: 'CSV Files', tables: ['campaign_results', 'ad_performance'] },
    { id: 'ds3', name: 'Product Analytics', type: 'API Connection', tables: ['product_usage', 'feature_engagement'] },
    { id: 'ds4', name: 'Sales Data', type: 'Excel Files', tables: ['quarterly_sales', 'sales_by_region'] }
  ]
  
  // Sample datasets based on the problem type
  const datasets = [
    { id: 'dataset1', name: 'Customer Churn Data', source: 'ds1', description: 'Historical customer data with churn indicators', rows: 25000, columns: 18 },
    { id: 'dataset2', name: 'Marketing Campaign Results', source: 'ds2', description: 'Performance data from past campaigns', rows: 1200, columns: 24 },
    { id: 'dataset3', name: 'Product Usage Metrics', source: 'ds3', description: 'User engagement with product features', rows: 50000, columns: 32 },
    { id: 'dataset4', name: 'Sales Forecast Data', source: 'ds4', description: 'Historical sales with seasonal patterns', rows: 3600, columns: 15 }
  ]
  
  // Sample columns for the selected dataset
  const datasetColumns = {
    'dataset1': [
      { name: 'customer_id', type: 'string' },
      { name: 'tenure', type: 'number' },
      { name: 'monthly_charges', type: 'number' },
      { name: 'total_charges', type: 'number' },
      { name: 'gender', type: 'categorical' },
      { name: 'senior_citizen', type: 'boolean' },
      { name: 'partner', type: 'boolean' },
      { name: 'dependents', type: 'boolean' },
      { name: 'phone_service', type: 'boolean' },
      { name: 'multiple_lines', type: 'categorical' },
      { name: 'internet_service', type: 'categorical' },
      { name: 'online_security', type: 'categorical' },
      { name: 'online_backup', type: 'categorical' },
      { name: 'tech_support', type: 'categorical' },
      { name: 'streaming_tv', type: 'categorical' },
      { name: 'contract', type: 'categorical' },
      { name: 'paperless_billing', type: 'boolean' },
      { name: 'churn', type: 'boolean' }
    ],
    'dataset2': [
      // ...columns for dataset2
    ],
    'dataset3': [
      // ...columns for dataset3
    ],
    'dataset4': [
      // ...columns for dataset4
    ]
  }
  
  const handleContinue = () => {
    setModelConfig({
      ...modelConfig,
      dataset: selectedDataset,
      targetColumn: targetColumn
    })
    onNext()
  }
  
  return (
    <div>
      <p className="text-text-secondary mb-6">
        Select a dataset and target column for your {modelConfig.problemType} model.
      </p>
      
      {/* Dataset selection */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-3">Choose Dataset</h3>
        <div className="grid grid-cols-2 gap-4">
          {datasets.map(dataset => (
            <div 
              key={dataset.id}
              onClick={() => setSelectedDataset(dataset.id)}
              className={`p-4 border rounded-md cursor-pointer transition-all ${
                selectedDataset === dataset.id 
                  ? 'border-accent bg-primary/10' 
                  : 'border-secondary/20 hover:bg-secondary/5'
              }`}
            >
              <div className="font-medium">{dataset.name}</div>
              <p className="text-sm text-text-secondary my-1">{dataset.description}</p>
              <div className="flex justify-between text-xs text-text-secondary">
                <div>{dataset.rows.toLocaleString()} rows</div>
                <div>{dataset.columns} columns</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Target column selection */}
      {selectedDataset && (
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Select Target Column</h3>
          <p className="text-sm text-text-secondary mb-3">
            This is what your model will learn to predict.
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {datasetColumns[selectedDataset]?.map(column => (
              <div
                key={column.name}
                onClick={() => setTargetColumn(column.name)}
                className={`p-3 border rounded-md cursor-pointer transition-all ${
                  targetColumn === column.name 
                    ? 'border-accent bg-primary/10' 
                    : 'border-secondary/20 hover:bg-secondary/5'
                }`}
              >
                <div className="font-medium text-sm">{column.name}</div>
                <div className="text-xs text-text-secondary">Type: {column.type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between pt-4 border-t border-secondary/10">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={!selectedDataset || !targetColumn}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

// Step 3: Feature Selection Component
function FeatureSelectionStep({ modelConfig, setModelConfig, onNext, onBack }) {
  const [selectedFeatures, setSelectedFeatures] = useState(modelConfig.features || [])
  
  // Sample columns from selected dataset with feature importance scores
  const allFeatures = {
    'dataset1': [
      { name: 'tenure', type: 'number', importance: 0.85, description: 'How long the customer has been with the company' },
      { name: 'monthly_charges', type: 'number', importance: 0.78, description: 'The amount charged to the customer monthly' },
      { name: 'total_charges', type: 'number', importance: 0.72, description: 'The total amount charged to the customer' },
      { name: 'contract', type: 'categorical', importance: 0.68, description: 'The contract term of the customer' },
      { name: 'internet_service', type: 'categorical', importance: 0.65, description: 'Customer's internet service provider' },
      { name: 'online_security', type: 'categorical', importance: 0.62, description: 'Whether the customer has online security service' },
      { name: 'payment_method', type: 'categorical', importance: 0.58, description: 'The customer's payment method' },
      { name: 'tech_support', type: 'categorical', importance: 0.55, description: 'Whether the customer has tech support' },
      { name: 'online_backup', type: 'categorical', importance: 0.52, description: 'Whether the customer has online backup' },
      { name: 'paperless_billing', type: 'boolean', importance: 0.48, description: 'Whether the customer has paperless billing' },
      { name: 'dependents', type: 'boolean', importance: 0.42, description: 'Whether the customer has dependents' },
      { name: 'phone_service', type: 'boolean', importance: 0.38, description: 'Whether the customer has phone service' },
      { name: 'multiple_lines', type: 'categorical', importance: 0.35, description: 'Whether the customer has multiple lines' },
      { name: 'partner', type: 'boolean', importance: 0.32, description: 'Whether the customer has a partner' },
      { name: 'gender', type: 'categorical', importance: 0.25, description: 'Customer gender' },
      { name: 'senior_citizen', type: 'boolean', importance: 0.22, description: 'Whether the customer is a senior citizen' },
      { name: 'streaming_tv', type: 'categorical', importance: 0.18, description: 'Whether the customer has streaming TV' }
    ],
    // For other datasets if needed
  }
  
  const availableFeatures = allFeatures[modelConfig.dataset] || []
  
  const toggleFeature = (featureName) => {
    if (selectedFeatures.includes(featureName)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== featureName))
    } else {
      setSelectedFeatures([...selectedFeatures, featureName])
    }
  }
  
  const selectTopNFeatures = (n) => {
    const topFeatures = availableFeatures
      .sort((a, b) => b.importance - a.importance)
      .slice(0, n)
      .map(f => f.name)
    setSelectedFeatures(topFeatures)
  }
  
  const handleContinue = () => {
    setModelConfig({
      ...modelConfig,
      features: selectedFeatures
    })
    onNext()
  }
  
  const featureImportanceColor = (importance) => {
    if (importance > 0.7) return 'bg-green-500'
    if (importance > 0.4) return 'bg-yellow-500'
    return 'bg-blue-500'
  }
  
  return (
    <div>
      <p className="text-text-secondary mb-4">
        Select which features to include in your {modelConfig.problemType} model for predicting <span className="font-medium">{modelConfig.targetColumn}</span>.
      </p>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          <span className="font-medium">{selectedFeatures.length}</span> of {availableFeatures.length} features selected
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => selectTopNFeatures(5)}
          >
            Select Top 5
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => selectTopNFeatures(10)}
          >
            Select Top 10
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setSelectedFeatures(availableFeatures.map(f => f.name))}
          >
            Select All
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setSelectedFeatures([])}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[400px] pr-2">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-secondary/10">
            <tr>
              <th className="py-2 px-3 text-left font-medium">Select</th>
              <th className="py-2 px-3 text-left font-medium">Feature</th>
              <th className="py-2 px-3 text-left font-medium">Type</th>
              <th className="py-2 px-3 text-left font-medium">Importance</th>
              <th className="py-2 px-3 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {availableFeatures
              .sort((a, b) => b.importance - a.importance)
              .map(feature => (
                <tr 
                  key={feature.name} 
                  className="border-b border-secondary/10 hover:bg-secondary/5 cursor-pointer"
                  onClick={() => toggleFeature(feature.name)}
                >
                  <td className="py-2 px-3">
                    <input 
                      type="checkbox" 
                      checked={selectedFeatures.includes(feature.name)} 
                      onChange={() => {}} // Handled by row click
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="py-2 px-3 font-medium">{feature.name}</td>
                  <td className="py-2 px-3">{feature.type}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-secondary/10 rounded-full mr-2 overflow-hidden">
                        <div 
                          className={`h-full ${featureImportanceColor(feature.importance)}`} 
                          style={{width: `${feature.importance * 100}%`}}
                        ></div>
                      </div>
                      <div>{(feature.importance * 100).toFixed(0)}%</div>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-text-secondary">{feature.description}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t border-secondary/10">
        <Button
          variant="secondary"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={selectedFeatures.length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default function AutoMLPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [modelConfig, setModelConfig] = useState({
    problemType: '',
    dataset: '',
    targetColumn: '',
    features: [],
    modelType: '',
    parameters: {}
  })
  
  const goToNextStep = () => {
    setCurrentStep(currentStep + 1)
  }
  
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Auto ML</h1>
        <p className="text-text-secondary">Create machine learning models without coding</p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step}
              className={`flex items-center ${step < 5 ? 'flex-1' : ''}`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-primary text-text-primary' 
                    : step < currentStep 
                      ? 'bg-accent text-text-primary' 
                      : 'bg-secondary/20 text-text-secondary'
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div 
                  className={`h-1 flex-1 mx-2 ${
                    step < currentStep ? 'bg-accent' : 'bg-secondary/20'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-text-secondary">
          <div>Problem Definition</div>
          <div>Data Selection</div>
          <div>Feature Selection</div>
          <div>Model Selection</div>
          <div>Review & Train</div>
        </div>
      </div>
      
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-medium mb-4">
            {currentStep === 1 && 'Define Your Problem'}
            {currentStep === 2 && 'Select Your Data'}
            {currentStep === 3 && 'Select Features'}
            {currentStep === 4 && 'Choose Model Type'}
            {currentStep === 5 && 'Review & Train Model'}
          </h2>
          
          {currentStep === 1 && (
            <ProblemDefinitionStep 
              modelConfig={modelConfig}
              setModelConfig={setModelConfig}
              onNext={goToNextStep}
            />
          )}
          
          {currentStep === 2 && (
            <DataSelectionStep 
              modelConfig={modelConfig}
              setModelConfig={setModelConfig}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}
          
          {currentStep === 3 && (
            <FeatureSelectionStep
              modelConfig={modelConfig}
              setModelConfig={setModelConfig}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}
          
          {currentStep > 3 && (
            <div className="min-h-[300px] flex items-center justify-center">
              <p className="text-text-secondary">
                Step {currentStep} content will go here
              </p>
            </div>
          )}
          
          {currentStep > 3 && (
            <div className="flex justify-between mt-6 pt-4 border-t border-secondary/10">
              <Button
                variant="secondary"
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              
              <Button
                onClick={goToNextStep}
                disabled={currentStep === 5}
              >
                {currentStep < 5 ? 'Continue' : 'Start Training'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </AppLayout>
  );
} 