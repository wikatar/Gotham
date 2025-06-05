'use client';

import React, { useState, useEffect } from 'react';
import PipelineBuilder from '@/components/pipelines/PipelineBuilder';
import PipelineScheduler from '@/components/pipelines/PipelineScheduler';
import PipelineHistory from '@/components/pipelines/PipelineHistory';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  missionId: string;
  createdAt: string;
}

// Simple Tab components since we don't have the UI library
const TabButton = ({ id, label, active, disabled, onClick }: { 
  id: string; 
  label: string; 
  active: boolean; 
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
      active
        ? 'bg-blue-500 text-white border-b-2 border-blue-500'
        : disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
)

// Simple toast function
const toast = ({ title, description, variant }: { 
  title: string; 
  description: string; 
  variant?: string;
}) => {
  console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`)
  // In a real app, this would show a proper toast notification
}

export default function PipelinesPage() {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  
  // Mock data - in a real app this would come from authentication
  const accountId = 'demo-account';
  const missionId = 'mission-abc';

  // Fetch pipelines for this mission
  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pipelines?missionId=${missionId}&accountId=${accountId}`);
      if (response.ok) {
        const data = await response.json();
        setPipelines(data.pipelines);
      }
    } catch (error) {
      console.error('Failed to fetch pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load pipelines on initial render
  useEffect(() => {
    fetchPipelines();
  }, []);

  const handlePipelineSaved = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    setActiveTab('scheduler');
    fetchPipelines(); // Refresh the list
  };

  const handleScheduleSaved = () => {
    setActiveTab('pipelines');
    setSelectedPipeline(null);
    fetchPipelines(); // Refresh the list
  };
  
  const runPipeline = async (pipelineId: string) => {
    setExecuting(true);
    try {
      const response = await fetch('/api/pipelines/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipelineId,
          input: { timestamp: new Date().toISOString() }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to run pipeline');
      }
      
      const data = await response.json();
      toast({
        title: 'Pipeline executed successfully',
        description: `Pipeline ${pipelineId} executed successfully.`,
      });
      
      // Automatically navigate to history tab to see results
      setSelectedPipeline(pipelineId);
      setActiveTab('history');
      
    } catch (error) {
      console.error('Error running pipeline:', error);
      toast({
        title: 'Pipeline execution failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Pipeline Manager</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200 mb-4">
        <TabButton 
          id="builder" 
          label="Builder" 
          active={activeTab === 'builder'} 
          onClick={() => setActiveTab('builder')}
        />
        <TabButton 
          id="pipelines" 
          label="Pipelines" 
          active={activeTab === 'pipelines'} 
          onClick={() => setActiveTab('pipelines')}
        />
        <TabButton 
          id="scheduler" 
          label="Scheduler" 
          active={activeTab === 'scheduler'} 
          disabled={!selectedPipeline}
          onClick={() => setActiveTab('scheduler')}
        />
        <TabButton 
          id="history" 
          label="History" 
          active={activeTab === 'history'} 
          disabled={!selectedPipeline}
          onClick={() => setActiveTab('history')}
        />
      </div>
        
      {activeTab === 'builder' && (
        <div className="border rounded-lg p-4">
          <PipelineBuilder 
            missionId={missionId} 
            onPipelineSaved={handlePipelineSaved} 
          />
        </div>
      )}

      {activeTab === 'pipelines' && (
        <div className="border rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Pipelines</h2>
              <Button onClick={() => setActiveTab('builder')}>
                Create New Pipeline
              </Button>
            </div>
            
            {loading ? (
              <p>Loading pipelines...</p>
            ) : pipelines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pipelines.map(pipeline => (
                  <Card key={pipeline.id} title={pipeline.name}>
                    <p className="text-gray-600 mb-4">
                      {pipeline.description || 'No description provided'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Created: {new Date(pipeline.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedPipeline(pipeline.id);
                          setActiveTab('scheduler');
                        }}
                      >
                        Schedule
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => runPipeline(pipeline.id)}
                        disabled={executing}
                      >
                        {executing ? 'Running...' : 'Run Now'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedPipeline(pipeline.id);
                          setActiveTab('history');
                        }}
                      >
                        History
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border rounded-lg">
                <p className="mb-4">No pipelines found for this mission.</p>
                <Button onClick={() => setActiveTab('builder')}>
                  Create Your First Pipeline
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'scheduler' && selectedPipeline && (
        <div className="border rounded-lg p-4">
          <PipelineScheduler 
            pipelineId={selectedPipeline} 
            onScheduleSaved={handleScheduleSaved} 
          />
        </div>
      )}

      {activeTab === 'history' && selectedPipeline && (
        <div className="border rounded-lg p-4">
          <PipelineHistory pipelineId={selectedPipeline} />
        </div>
      )}
    </div>
  );
} 