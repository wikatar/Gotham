'use client';

import React, { useState } from 'react';
import PipelineBuilder from '@/components/pipelines/PipelineBuilder';
import PipelineScheduler from '@/components/pipelines/PipelineScheduler';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PipelinesPage() {
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('builder');
  // Mock data - in a real app this would come from the API
  const accountId = 'acc-123456';

  const handlePipelineSaved = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    setActiveTab('scheduler');
  };

  const handleScheduleSaved = () => {
    setActiveTab('builder');
    setSelectedPipeline(null);
    // In a real app you would refresh the list of pipelines
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Pipeline Manager</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger 
            value="scheduler" 
            disabled={!selectedPipeline}
          >
            Scheduler
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder" className="border rounded-lg p-4">
          <PipelineBuilder />
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
              <p className="mb-4">No pipeline selected. Build a pipeline first.</p>
              <Button onClick={() => setActiveTab('builder')}>
                Go to Builder
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 