import { PrismaClient, Pipeline } from '@prisma/client'
import { db } from './db'
import { logLineageStep, createPipelineExecutionId } from './logLineage'

// Mock implementation of pipeline execution
// In a real implementation, this would process the nodes and edges based on their types
async function runPipeline(pipeline: Pipeline, input: any, executionId: string) {
  // Log pipeline start
  await logLineageStep({
    pipelineId: executionId,
    agentId: 'pipeline_executor',
    input: {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      inputData: input
    },
    output: {
      status: 'started',
      timestamp: new Date().toISOString()
    },
    step: 'pipeline_start',
    source: 'Pipeline Executor'
  });

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Parse the nodes and edges
  const nodes = pipeline.nodes as any
  
  // Log node processing
  await logLineageStep({
    pipelineId: executionId,
    agentId: 'pipeline_executor',
    input: {
      nodes: nodes,
      nodeCount: Array.isArray(nodes) ? nodes.length : 1
    },
    output: {
      processedNodes: Array.isArray(nodes) ? nodes.length : 1,
      status: 'nodes_processed'
    },
    step: 'pipeline_node_processing',
    source: 'Pipeline Executor'
  });
  
  // Simple simulation - in a real implementation this would actually process each node
  const result = {
    executedAt: new Date().toISOString(),
    pipelineId: pipeline.id,
    processedNodeCount: Array.isArray(nodes) ? nodes.length : 1,
    input,
    output: {
      result: "Pipeline execution completed",
      timestamp: new Date().toISOString()
    }
  }
  
  // Log pipeline completion
  await logLineageStep({
    pipelineId: executionId,
    agentId: 'pipeline_executor',
    input: {
      pipelineId: pipeline.id,
      processedNodes: result.processedNodeCount
    },
    output: result,
    step: 'pipeline_complete',
    source: 'Pipeline Executor'
  });
  
  return result
}

interface ExecutePipelineOptions {
  userId?: string;
}

export async function executePipeline(pipelineId: string, input: any, options: ExecutePipelineOptions = {}) {
  const executionId = createPipelineExecutionId('pipeline_execution');
  
  // Log execution start
  await logLineageStep({
    pipelineId: executionId,
    agentId: 'pipeline_service',
    input: {
      pipelineId,
      inputData: input,
      options
    },
    output: {
      status: 'execution_started',
      timestamp: new Date().toISOString()
    },
    step: 'execution_start',
    source: 'Pipeline Service'
  });

  // Get the pipeline
  const pipeline = await db.pipeline.findUnique({
    where: { id: pipelineId }
  })
  
  if (!pipeline) {
    // Log pipeline not found
    await logLineageStep({
      pipelineId: executionId,
      agentId: 'pipeline_service',
      input: { pipelineId },
      output: {
        error: `Pipeline with ID ${pipelineId} not found`,
        status: 'pipeline_not_found'
      },
      step: 'execution_failed',
      source: 'Pipeline Service'
    });
    
    throw new Error(`Pipeline with ID ${pipelineId} not found`)
  }
  
  // Extract options
  const { userId } = options;
  
  // Create execution record with user ID if provided
  const exec = await db.pipelineExecution.create({
    data: {
      pipelineId: pipeline.id,
      input,
      status: 'pending',
      accountId: pipeline.accountId,
      ...(userId ? { userId } : {}),
    },
  })

  // Log execution record created
  await logLineageStep({
    entityId: pipeline.id,
    pipelineId: executionId,
    agentId: 'pipeline_service',
    input: {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      userId
    },
    output: {
      executionId: exec.id,
      status: 'execution_record_created'
    },
    step: 'execution_record_created',
    source: 'Pipeline Service'
  });

  try {
    // Run the pipeline
    const result = await runPipeline(pipeline, input, executionId)

    // Update execution record with success
    await db.pipelineExecution.update({
      where: { id: exec.id },
      data: {
        endedAt: new Date(),
        status: 'success',
        output: result,
      },
    })

    // Log execution success
    await logLineageStep({
      entityId: pipeline.id,
      pipelineId: executionId,
      agentId: 'pipeline_service',
      input: {
        executionId: exec.id,
        pipelineId: pipeline.id
      },
      output: {
        success: true,
        result,
        executionTime: new Date().getTime() - exec.createdAt.getTime(),
        status: 'execution_completed'
      },
      step: 'execution_success',
      source: 'Pipeline Service'
    });

    return result
  } catch (err) {
    // Update execution record with error
    await db.pipelineExecution.update({
      where: { id: exec.id },
      data: {
        endedAt: new Date(),
        status: 'error',
        error: (err as Error).message,
      },
    })
    
    // Log execution failure
    await logLineageStep({
      entityId: pipeline.id,
      pipelineId: executionId,
      agentId: 'pipeline_service',
      input: {
        executionId: exec.id,
        pipelineId: pipeline.id
      },
      output: {
        success: false,
        error: (err as Error).message,
        status: 'execution_failed'
      },
      step: 'execution_failed',
      source: 'Pipeline Service'
    });
    
    throw err
  }
} 