// /api/pipeline/execute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Pipeline, PipelineNode } from '../schema';
import { PrismaClient } from '@prisma/client';
import { applyRule } from '../../orchestrator/rulesEngine';
import { executeModel } from '@/src/api/models/run';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validate the input request
const ExecutePipelineSchema = z.object({
  pipeline: PipelineSchema,
  input: z.record(z.any()),
  accountId: z.string().uuid()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = ExecutePipelineSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }
    
    const { pipeline, input, accountId } = validationResult.data;
    
    // Start execution tracking
    const execution = await prisma.log.create({
      data: {
        accountId,
        type: 'pipeline_execution',
        action: `Pipeline "${pipeline.name}" execution started`,
        resourceId: pipeline.id,
        resourceType: 'pipeline',
        metadata: {
          status: 'running',
          input
        },
      },
    });
    
    try {
      const result = await executePipeline(pipeline, input, accountId);
      
      // Update execution log with success
      await prisma.log.update({
        where: { id: execution.id },
        data: {
          metadata: {
            status: 'completed',
            input,
            result
          },
        },
      });
      
      return NextResponse.json({ 
        status: 'success',
        pipelineId: pipeline.id,
        result 
      });
    } catch (error) {
      // Update execution log with failure
      await prisma.log.update({
        where: { id: execution.id },
        data: {
          metadata: {
            status: 'failed',
            input,
            error: (error as Error).message
          },
        },
      });
      
      throw error;
    }
  } catch (error) {
    console.error('Pipeline execution failed:', error);
    return NextResponse.json({ 
      error: 'Pipeline execution failed', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}

// Execute a pipeline with provided input data
async function executePipeline(pipeline: Pipeline, inputData: any, accountId: string) {
  // Store the results of each node execution
  const nodeResults: Record<string, any> = {};
  
  // Execute each node in sequence, respecting dependencies
  for (const node of pipeline.nodes) {
    try {
      // Get inputs for this node from previous node results or use initial input
      const nodeInputs = getNodeInputs(node, nodeResults, inputData);
      
      // Execute the node based on its type
      const result = await executeNode(node, nodeInputs, accountId);
      
      // Store the result for potential use by downstream nodes
      nodeResults[node.id] = result;
    } catch (error) {
      console.error(`Error executing node ${node.id} (${node.name}):`, error);
      throw new Error(`Node ${node.id} (${node.name}) execution failed: ${(error as Error).message}`);
    }
  }
  
  // Return the full results and the final node's result separately
  const finalNodeId = pipeline.nodes[pipeline.nodes.length - 1]?.id;
  return {
    all: nodeResults,
    final: finalNodeId ? nodeResults[finalNodeId] : null
  };
}

// Get input data for a node based on its dependencies
function getNodeInputs(node: PipelineNode, nodeResults: Record<string, any>, initialInput: any) {
  // If the node has no specified inputs, use the initial input data
  if (!node.inputs || node.inputs.length === 0) {
    return initialInput;
  }
  
  // If the node has one input, return that directly
  if (node.inputs.length === 1) {
    const inputNodeId = node.inputs[0];
    return nodeResults[inputNodeId];
  }
  
  // If multiple inputs, return an array of input values
  return node.inputs.map(inputId => nodeResults[inputId]);
}

// Execute a single node based on its type
async function executeNode(node: PipelineNode, input: any, accountId: string) {
  switch (node.type) {
    case 'data':
      // Data nodes simply pass through or transform data
      return processDataNode(node, input);
      
    case 'model':
      // Execute an ML model
      return executeModelNode(node, input, accountId);
      
    case 'logic':
      // Apply logic/rules
      return executeLogicNode(node, input);
      
    case 'agent':
      // Trigger an action agent
      return executeAgentNode(node, input, accountId);
      
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

// Process a data node (transformation, filtering, etc.)
function processDataNode(node: PipelineNode, input: any) {
  // For now, this is just a passthrough
  // In a real implementation, this would apply transformations based on node.config
  console.log(`Processing data node: ${node.name}`);
  return input;
}

// Execute a model node
async function executeModelNode(node: PipelineNode, input: any, accountId: string) {
  console.log(`Executing model node: ${node.name}`);
  
  if (!node.config || !node.config.modelId) {
    throw new Error(`Model node ${node.id} is missing modelId in config`);
  }
  
  // Execute the model with the provided input
  const { execution } = await executeModel(
    node.config.modelId, 
    accountId, 
    input
  );
  
  return execution.output;
}

// Execute a logic node (rule evaluation)
function executeLogicNode(node: PipelineNode, input: any) {
  console.log(`Executing logic node: ${node.name}`);
  
  if (!node.config || !node.config.logic) {
    throw new Error(`Logic node ${node.id} is missing logic configuration`);
  }
  
  // Apply the rule logic to the input data
  const result = applyRule(node.config.logic, input);
  return { result, input };
}

// Execute an agent node
async function executeAgentNode(node: PipelineNode, input: any, accountId: string) {
  console.log(`Executing agent node: ${node.name}`);
  
  if (!node.config || !node.config.agentId) {
    throw new Error(`Agent node ${node.id} is missing agentId in config`);
  }
  
  // In a real implementation, this would trigger the agent
  // For now, we'll just log it
  await prisma.log.create({
    data: {
      accountId,
      type: 'agent_execution',
      action: `Agent triggered by pipeline node: ${node.name}`,
      resourceId: node.config.agentId,
      resourceType: 'agent',
      metadata: {
        nodeId: node.id,
        input
      },
    },
  });
  
  return { 
    status: 'executed', 
    agentId: node.config.agentId, 
    timestamp: new Date().toISOString() 
  };
} 