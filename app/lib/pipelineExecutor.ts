import { PrismaClient, Pipeline } from '@prisma/client'
import { db } from './db'

// Mock implementation of pipeline execution
// In a real implementation, this would process the nodes and edges based on their types
async function runPipeline(pipeline: Pipeline, input: any) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Parse the nodes and edges
  const nodes = pipeline.nodes as any
  
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
  
  return result
}

interface ExecutePipelineOptions {
  userId?: string;
}

export async function executePipeline(pipelineId: string, input: any, options: ExecutePipelineOptions = {}) {
  // Get the pipeline
  const pipeline = await db.pipeline.findUnique({
    where: { id: pipelineId }
  })
  
  if (!pipeline) {
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

  try {
    // Run the pipeline
    const result = await runPipeline(pipeline, input)

    // Update execution record with success
    await db.pipelineExecution.update({
      where: { id: exec.id },
      data: {
        endedAt: new Date(),
        status: 'success',
        output: result,
      },
    })

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
    throw err
  }
} 