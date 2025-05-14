'use client';

import React, { useState, useEffect } from 'react';
import PipelineBuilder from '@/components/pipelines/PipelineBuilder';
import PipelineScheduler from '@/components/pipelines/PipelineScheduler';
import PipelineHistory from '@/components/pipelines/PipelineHistory';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  missionId: string;
  createdAt: string;
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger 
            value="scheduler" 
            disabled={!selectedPipeline}
          >
            Scheduler
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            disabled={!selectedPipeline}
          >
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder" className="border rounded-lg p-4">
          <PipelineBuilder 
            missionId={missionId} 
            onPipelineSaved={handlePipelineSaved} 
          />
        </TabsContent>

        <TabsContent value="pipelines" className="border rounded-lg p-4">
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
                  <Card key={pipeline.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{pipeline.name}</CardTitle>
                      <CardDescription>
                        {pipeline.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          variant="outline"
                          onClick={() => runPipeline(pipeline.id)}
                          disabled={executing}
                        >
                          {executing ? 'Running...' : 'Run Now'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPipeline(pipeline.id);
                            setActiveTab('history');
                          }}
                        >
                          History
                        </Button>
                      </div>
                    </CardContent>
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
        </TabsContent>
        
        <TabsContent value="scheduler" className="border rounded-lg p-4">
          {selectedPipeline ? (
            <PipelineScheduler 
              pipelineId={selectedPipeline}
              accountId={accountId}
              onScheduleSaved={handleScheduleSaved}
            />
          ) : (
            <div className="text-center p-8">
              <p className="mb-4">No pipeline selected. Select a pipeline first.</p>
              <Button onClick={() => setActiveTab('pipelines')}>
                View Pipelines
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="border rounded-lg p-4">
          {selectedPipeline ? (
            <PipelineHistory 
              pipelineId={selectedPipeline}
              accountId={accountId}
              limit={20}
            />
          ) : (
            <div className="text-center p-8">
              <p className="mb-4">No pipeline selected. Select a pipeline first.</p>
              <Button onClick={() => setActiveTab('pipelines')}>
                View Pipelines
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 