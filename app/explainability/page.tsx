'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ModelExplainer from '../components/explainability/ModelExplainer';
import DecisionTracker from '../components/explainability/DecisionTracker';
import AuditLog from '../components/explainability/AuditLog';
import InsightChain from '../components/explainability/InsightChain';
import FeatureImportance from '../components/explainability/FeatureImportance';

export default function ExplainabilityPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'decisions' | 'audit' | 'insights' | 'features'>('models');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading explainability platform...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Explainability</h1>
            <p className="text-text-secondary">
              Understand AI decisions, trace insights, and audit model behavior
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary">Export Report</Button>
            <Button variant="primary">Model Settings</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-secondary/20 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'models' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('models')}
        >
          Model Explainer
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'decisions' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('decisions')}
        >
          Decision Tracking
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'audit' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Logs
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'insights' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('insights')}
        >
          Insight Chains
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'features' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('features')}
        >
          Feature Importance
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'models' && (
        <ModelExplainer 
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      )}

      {activeTab === 'decisions' && (
        <DecisionTracker 
          selectedDecision={selectedDecision}
          onSelectDecision={setSelectedDecision}
        />
      )}

      {activeTab === 'audit' && (
        <AuditLog />
      )}

      {activeTab === 'insights' && (
        <InsightChain />
      )}

      {activeTab === 'features' && (
        <FeatureImportance 
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      )}
    </AppLayout>
  );
} 