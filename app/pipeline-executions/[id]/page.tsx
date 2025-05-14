'use client';

import { useParams, useRouter } from 'next/navigation';
import PipelineExecutionDetail from '@/components/pipelines/PipelineExecutionDetail';
import { Button } from '@/components/ui/button';

export default function PipelineExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const executionId = params.id as string;
  
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="outline" 
        onClick={handleBack}
        className="mb-4"
      >
        ← Back
      </Button>
      
      <PipelineExecutionDetail 
        executionId={executionId}
      />
    </div>
  );
} 