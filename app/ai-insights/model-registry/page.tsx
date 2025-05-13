'use client'

import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Sample model providers
const modelProviders = [
  {
    id: 'local',
    name: 'Local Models',
    description: 'Run models locally using scikit-learn and PyTorch',
    logo: '🧠',
    status: 'active',
    models: [
      { id: 'sklearn-lr', name: 'Linear Regression (scikit-learn)', type: 'regression' },
      { id: 'sklearn-rf', name: 'Random Forest (scikit-learn)', type: 'classification' },
      { id: 'pytorch-nn', name: 'Neural Network (PyTorch)', type: 'classification' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Access OpenAI models for text analysis and generation',
    logo: '🤖',
    status: 'active',
    models: [
      { id: 'gpt-4', name: 'GPT-4', type: 'text-generation' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', type: 'text-generation' },
      { id: 'davinci-003', name: 'Davinci-003', type: 'text-generation' }
    ]
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Use pre-trained models from the Hugging Face hub',
    logo: '🤗',
    status: 'active',
    models: [
      { id: 'bert-base', name: 'BERT Base', type: 'text-embedding' },
      { id: 'roberta', name: 'RoBERTa', type: 'text-embedding' },
      { id: 't5', name: 'T5', type: 'text-generation' }
    ]
  },
  {
    id: 'langchain',
    name: 'LangChain Integration',
    description: 'Connect with LangChain for advanced AI pipelines',
    logo: '⛓️',
    status: 'inactive',
    models: []
  }
];

function ModelCard({ model, isSelected, onSelect }) {
  return (
    <div 
      className={`p-4 border rounded-md cursor-pointer transition-all ${
        isSelected ? 'border-accent bg-primary/10' : 'border-secondary/20 hover:bg-secondary/5'
      }`}
      onClick={() => onSelect(model.id)}
    >
      <div className="font-medium">{model.name}</div>
      <div className="text-sm text-text-secondary mt-1">Type: {model.type}</div>
    </div>
  );
}

function ProviderCard({ provider, isExpanded, onToggle }) {
  return (
    <Card className="mb-4">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">{provider.logo}</div>
          <div>
            <div className="font-medium">{provider.name}</div>
            <div className="text-sm text-text-secondary">{provider.description}</div>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full mr-3 ${
            provider.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-gray-400/20 text-gray-500'
          }`}>
            {provider.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          <div className="text-lg">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-secondary/10">
          {provider.models.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {provider.models.map(model => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  isSelected={false} 
                  onSelect={() => {}} 
                />
              ))}
              <div className="p-4 border border-dashed border-secondary/20 rounded-md flex items-center justify-center">
                <Button variant="secondary">Add Model</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-text-secondary mb-3">No models configured for this provider</div>
              <Button variant="secondary">Configure Provider</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function ModelRegistryPage() {
  const [expandedProviders, setExpandedProviders] = useState(['local']);
  
  const toggleProvider = (providerId) => {
    if (expandedProviders.includes(providerId)) {
      setExpandedProviders(expandedProviders.filter(id => id !== providerId));
    } else {
      setExpandedProviders([...expandedProviders, providerId]);
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Model Registry</h1>
        <p className="text-text-secondary">Manage AI/ML models and provider integrations</p>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="secondary">Import Model</Button>
          <Button variant="secondary">Add Provider</Button>
        </div>
        <div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search models..." 
              className="px-4 py-2 pl-8 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            />
            <div className="absolute left-3 top-2.5 text-text-secondary">🔍</div>
          </div>
        </div>
      </div>
      
      <div>
        {modelProviders.map(provider => (
          <ProviderCard 
            key={provider.id}
            provider={provider}
            isExpanded={expandedProviders.includes(provider.id)}
            onToggle={() => toggleProvider(provider.id)}
          />
        ))}
      </div>
      
      <Card title="Model Pipeline Creation" className="mt-6">
        <div className="text-center p-6">
          <div className="text-3xl mb-3">🔄</div>
          <h3 className="text-lg font-medium mb-2">Create Model Pipeline</h3>
          <p className="text-text-secondary mb-4 max-w-lg mx-auto">
            Combine models from different providers into a unified pipeline for complex AI workflows with preprocessing, model execution, and post-processing steps.
          </p>
          <Button>Create Pipeline</Button>
        </div>
      </Card>
    </AppLayout>
  );
} 