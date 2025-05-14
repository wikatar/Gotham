'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface DecisionTrackerProps {
  selectedDecision: string | null;
  onSelectDecision: (decisionId: string) => void;
}

interface Decision {
  id: string;
  timestamp: string;
  modelId: string;
  modelName: string;
  decisionType: string;
  outcome: string;
  confidence: number;
  inputs: { [key: string]: any };
  impactLevel: 'low' | 'medium' | 'high';
  status: 'reviewed' | 'pending' | 'flagged';
}

export default function DecisionTracker({
  selectedDecision,
  onSelectDecision
}: DecisionTrackerProps) {
  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: 'decision-1',
      timestamp: '2023-11-05 14:23:45',
      modelId: 'model-1',
      modelName: 'Anomaly Detector',
      decisionType: 'Anomaly Detection',
      outcome: 'Anomaly Detected',
      confidence: 0.92,
      inputs: {
        sensor_data: { temperature: 89.5, pressure: 1023, humidity: 0.54 },
        timeframe: '2023-11-05 12:00 - 14:00'
      },
      impactLevel: 'high',
      status: 'flagged'
    },
    {
      id: 'decision-2',
      timestamp: '2023-11-05 10:12:33',
      modelId: 'model-3',
      modelName: 'Semantic Classifier',
      decisionType: 'Text Classification',
      outcome: 'Sentiment: Positive',
      confidence: 0.88,
      inputs: {
        text: 'The new system works perfectly and has exceeded our expectations!'
      },
      impactLevel: 'low',
      status: 'reviewed'
    },
    {
      id: 'decision-3',
      timestamp: '2023-11-04 19:45:22',
      modelId: 'model-2',
      modelName: 'Forecasting Engine',
      decisionType: 'Time Series Forecast',
      outcome: 'Growth Trend Predicted',
      confidence: 0.79,
      inputs: {
        historical_data: '12 months',
        data_points: 365,
        seasonality: 'detected'
      },
      impactLevel: 'medium',
      status: 'pending'
    },
    {
      id: 'decision-4',
      timestamp: '2023-11-04 08:33:10',
      modelId: 'model-4',
      modelName: 'Regression Analyzer',
      decisionType: 'Regression Analysis',
      outcome: 'Correlation Identified',
      confidence: 0.95,
      inputs: {
        variables: ['price', 'volume', 'market_cap'],
        timeframe: '6 months'
      },
      impactLevel: 'medium',
      status: 'reviewed'
    },
    {
      id: 'decision-5',
      timestamp: '2023-11-03 22:17:05',
      modelId: 'model-1',
      modelName: 'Anomaly Detector',
      decisionType: 'Anomaly Detection',
      outcome: 'No Anomaly Detected',
      confidence: 0.97,
      inputs: {
        sensor_data: { temperature: 72.3, pressure: 1012, humidity: 0.48 },
        timeframe: '2023-11-03 20:00 - 22:00'
      },
      impactLevel: 'low',
      status: 'reviewed'
    }
  ]);

  const [selectedDecisionDetail, setSelectedDecisionDetail] = useState<Decision | null>(
    decisions.find(d => d.id === selectedDecision) || null
  );
  
  // Handle selecting a decision
  const handleSelectDecision = (decisionId: string) => {
    const decision = decisions.find(d => d.id === decisionId) || null;
    setSelectedDecisionDetail(decision);
    onSelectDecision(decisionId);
  };

  // Get impact level badge color
  const getImpactLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusColor = (status: 'reviewed' | 'pending' | 'flagged') => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Decision List */}
      <div className="lg:col-span-1">
        <Card title="Recent Decisions">
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search decisions..."
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              {decisions.map(decision => (
                <div 
                  key={decision.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    decision.id === selectedDecisionDetail?.id 
                      ? 'bg-primary/10 border-l-4 border-primary' 
                      : 'bg-background-elevated hover:bg-background-paper'
                  }`}
                  onClick={() => handleSelectDecision(decision.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{decision.decisionType}</div>
                    <div className={`px-2 py-0.5 text-xs rounded-full ${getImpactLevelColor(decision.impactLevel)}`}>
                      {decision.impactLevel.charAt(0).toUpperCase() + decision.impactLevel.slice(1)} Impact
                    </div>
                  </div>
                  <div className="text-sm text-text-secondary">{decision.outcome}</div>
                  <div className="flex justify-between items-center text-xs text-text-secondary mt-1">
                    <div>{decision.modelName}</div>
                    <div>{decision.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Decision Details */}
      <div className="lg:col-span-2">
        {selectedDecisionDetail ? (
          <div className="space-y-6">
            <Card>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedDecisionDetail.decisionType}</h2>
                    <div className="text-text-secondary">{selectedDecisionDetail.modelName} • {selectedDecisionDetail.timestamp}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedDecisionDetail.status)}`}>
                    {selectedDecisionDetail.status.charAt(0).toUpperCase() + selectedDecisionDetail.status.slice(1)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Outcome</div>
                    <div className="text-sm font-bold">{selectedDecisionDetail.outcome}</div>
                  </div>
                  
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Confidence</div>
                    <div className="text-sm font-bold">{(selectedDecisionDetail.confidence * 100).toFixed(1)}%</div>
                  </div>
                  
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Impact</div>
                    <div className="text-sm font-bold capitalize">{selectedDecisionDetail.impactLevel}</div>
                  </div>
                  
                  <div className="bg-background-elevated p-2 rounded-md text-center">
                    <div className="text-xs text-text-secondary">Decision ID</div>
                    <div className="text-sm font-bold">{selectedDecisionDetail.id}</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Decision Inputs */}
            <Card title="Decision Inputs">
              <div className="p-4">
                <div className="bg-background-elevated p-3 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{JSON.stringify(selectedDecisionDetail.inputs, null, 2)}</pre>
                </div>
              </div>
            </Card>
            
            {/* Decision Explanation */}
            <Card title="AI Reasoning">
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Key Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Sensor Temperature</span>
                          <span className="text-sm text-red-500">+43%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background-paper rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Historical Pattern</span>
                          <span className="text-sm text-red-500">+27%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background-paper rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: '52%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Pressure Reading</span>
                          <span className="text-sm text-yellow-500">+12%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background-paper rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Humidity Level</span>
                          <span className="text-sm text-green-500">-8%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background-paper rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '22%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Reasoning Process</h3>
                    <div className="space-y-2">
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            1
                          </div>
                          <div>
                            <div className="font-medium">Input Analysis</div>
                            <div className="text-sm text-text-secondary">
                              Sensor data evaluated against normal operating parameters
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            2
                          </div>
                          <div>
                            <div className="font-medium">Pattern Matching</div>
                            <div className="text-sm text-text-secondary">
                              Historical anomaly patterns compared with current readings
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            3
                          </div>
                          <div>
                            <div className="font-medium">Threshold Evaluation</div>
                            <div className="text-sm text-text-secondary">
                              Temperature exceeded critical threshold by 23%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-background-elevated p-3 rounded-md">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            4
                          </div>
                          <div>
                            <div className="font-medium">Decision Output</div>
                            <div className="text-sm text-text-secondary">
                              Anomaly detected with 92% confidence
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="secondary" size="sm">
                    Generate Alternative Explanation
                  </Button>
                  <Button variant="primary" size="sm">
                    Run What-If Analysis
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="secondary">
                Mark as Reviewed
              </Button>
              <div className="space-x-2">
                <Button variant="secondary">
                  Export Decision Record
                </Button>
                <Button variant="primary">
                  Override Decision
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-medium mb-2">No Decision Selected</h3>
            <p className="text-text-secondary mb-4">
              Select a decision from the list to view details and explanations.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
} 