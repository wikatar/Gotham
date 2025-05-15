'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ExplanationStep {
  step: number;
  reasoning: string;
  evidence?: string;
}

interface ReasonChain {
  id: string;
  sourceType: 'agent' | 'rule' | 'anomaly';
  sourceId: string;
  conclusion: string;
  explanationSteps: ExplanationStep[];
  inputContext: Record<string, any>;
  createdAt: string;
}

interface ReasonChainViewerProps {
  reasonChain: ReasonChain;
  className?: string;
}

export default function ReasonChainViewer({ reasonChain, className = '' }: ReasonChainViewerProps) {
  const [showJson, setShowJson] = useState(false);
  
  const { conclusion, explanationSteps, inputContext, sourceType } = reasonChain;
  
  // Sort steps by step number
  const sortedSteps = [...explanationSteps].sort((a, b) => a.step - b.step);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get source type display name
  const getSourceTypeDisplay = (type: string) => {
    switch (type) {
      case 'agent': return 'AI Agent';
      case 'rule': return 'Business Rule';
      case 'anomaly': return 'Anomaly Detection';
      default: return type;
    }
  };
  
  return (
    <div className={`animate-fade-in ${className}`}>
      <Card title="Decision Explanation" className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Context</h3>
          <div className="bg-secondary/5 p-3 rounded">
            <p className="mb-2">
              <span className="font-medium">Source:</span> {getSourceTypeDisplay(sourceType)}
            </p>
            <p className="mb-2">
              <span className="font-medium">When:</span> {formatDate(reasonChain.createdAt)}
            </p>
            <p>
              <span className="font-medium">Input:</span>
            </p>
            <div className="pl-4 mt-1 text-sm">
              {Object.entries(inputContext).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-medium">{key}:</span>{' '}
                  {typeof value === 'object' 
                    ? JSON.stringify(value) 
                    : String(value)}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Reasoning Process</h3>
          <div className="space-y-4">
            {sortedSteps.map((step, index) => (
              <div key={index} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {step.step}
                  </div>
                  {index < sortedSteps.length - 1 && (
                    <div className="w-0.5 bg-secondary/30 h-full mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="bg-secondary/5 p-3 rounded">
                    <p>{step.reasoning}</p>
                    {step.evidence && (
                      <div className="mt-2 text-sm text-text-secondary">
                        <span className="font-medium">Evidence:</span> {step.evidence}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Conclusion</h3>
          <div className="bg-primary/10 p-3 rounded border-l-4 border-primary">
            <p>{conclusion}</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? 'Hide JSON' : 'Show JSON'}
          </Button>
        </div>
        
        {showJson && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Raw Data</h3>
            <pre className="bg-secondary/5 p-3 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(reasonChain, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
} 