'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PipelineExecutionDetail from '@/components/pipelines/PipelineExecutionDetail';
import Button from '../../components/ui/Button';
import Link from 'next/link';

export default function PipelineExecutionPage() {
  const params = useParams();
  const executionId = params.id as string;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pipeline Execution Details</h1>
        <Link href="/pipelines">
          <Button variant="secondary">Back to Pipelines</Button>
        </Link>
      </div>

      <PipelineExecutionDetail 
        executionId={executionId}
        onBack={() => window.history.back()}
      />
    </div>
  );
} 