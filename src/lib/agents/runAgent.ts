import { PrismaClient, Agent } from '@prisma/client';
import OpenAI from 'openai';
import axios from 'axios';

const prisma = new PrismaClient();

// Mock OpenAI response for testing
const mockOpenAIResponse = (prompt: string) => {
  return {
    content: `Mock response to: ${prompt}\n\nThis is a simulated model response for testing purposes. The agent has processed your request and here's what I found:\n\n1. Input analyzed successfully\n2. Based on the data, I've identified some key patterns\n3. Recommended action: Notify team about these findings`,
    actionSuggested: 'Notify team'
  };
};

// Detect if a response suggests an action
const detectAction = (response: string): string | null => {
  // Simple regex to find action suggestions
  // This could be made more sophisticated based on the response format
  const actionMatch = response.match(/recommended action:?\s*([^\.]+)/i) || 
                     response.match(/suggested action:?\s*([^\.]+)/i) ||
                     response.match(/action:?\s*([^\.]+)/i);
  
  return actionMatch ? actionMatch[1].trim() : null;
};

// Build prompt based on agent type and input context
const buildPrompt = async (agent: Agent, inputContext: any): Promise<string> => {
  let prompt = '';
  
  // Add agent description if available
  if (agent.description) {
    prompt += `Agent Purpose: ${agent.description}\n\n`;
  }
  
  // Add default preamble based on agent type
  prompt += `You are an AI assistant helping with ${agent.actionType} tasks.\n\n`;
  
  // Add context-specific information
  if (inputContext.missionId) {
    // Fetch mission data
    try {
      const mission = await prisma.mission.findUnique({
        where: { id: inputContext.missionId }
      });
      
      if (mission) {
        prompt += `Mission Context: ${mission.name}\n`;
        prompt += `${mission.description || ''}\n\n`;
      }
    } catch (error) {
      console.error('Error fetching mission data:', error);
    }
  }
  
  // If there are cleaned data rows, fetch and include them
  if (inputContext.cleanedSchemaId) {
    try {
      const cleanedRows = await prisma.cleanedRow.findMany({
        where: { 
          cleanedSchemaId: inputContext.cleanedSchemaId,
          accountId: agent.accountId
        },
        take: 10 // Limit to 10 rows as examples
      });
      
      if (cleanedRows.length > 0) {
        prompt += `Data Context:\n`;
        prompt += `${JSON.stringify(cleanedRows.map(row => row.data), null, 2)}\n\n`;
      }
    } catch (error) {
      console.error('Error fetching cleaned data:', error);
    }
  }
  
  // Add user message if provided
  if (inputContext.message) {
    prompt += `Task: ${inputContext.message}\n\n`;
  }
  
  // Add any additional parameters from the input context
  if (inputContext.additionalContext) {
    prompt += `Additional Context: ${JSON.stringify(inputContext.additionalContext)}\n\n`;
  }
  
  // Add instructions based on agent action type
  switch (agent.actionType) {
    case 'slack':
      prompt += 'Provide a concise response suitable for a Slack message. If you identify an action that should be taken, clearly state it.';
      break;
    case 'email':
      prompt += 'Provide a well-formatted response suitable for an email. Include a clear subject line suggestion if appropriate.';
      break;
    case 'webhook':
      prompt += 'Provide a structured response that could be sent via webhook. If appropriate, include suggestions for key-value pairs.';
      break;
    default:
      prompt += 'Analyze the information and provide insights or suggested actions.';
  }
  
  return prompt;
};

// Run OpenAI model
const runOpenAIModel = async (prompt: string, agentParams: any): Promise<{response: string, actionTaken?: string}> => {
  try {
    // For real implementation, uncomment this code
    /*
    const openai = new OpenAI({
      apiKey: agentParams.apiKey || process.env.OPENAI_API_KEY,
    });
    
    const response = await openai.chat.completions.create({
      model: agentParams.model || 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }],
      temperature: agentParams.temperature || 0.7,
    });
    
    const responseText = response.choices[0]?.message?.content || '';
    */
    
    // For mock implementation
    console.log('Using mock OpenAI response for testing');
    const mockResponse = mockOpenAIResponse(prompt);
    const responseText = mockResponse.content;
    
    // Detect if an action is suggested
    const actionTaken = detectAction(responseText);
    
    return { 
      response: responseText,
      actionTaken
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Run HuggingFace model
const runHuggingFaceModel = async (prompt: string, agentParams: any): Promise<{response: string, actionTaken?: string}> => {
  try {
    // For mock implementation
    console.log('Using mock HuggingFace response for testing');
    const mockResponse = mockOpenAIResponse(prompt); // Reusing the mock function
    
    // Detect if an action is suggested
    const actionTaken = detectAction(mockResponse.content);
    
    return { 
      response: mockResponse.content,
      actionTaken
    };
    
    // For real implementation, uncomment this code
    /*
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${agentParams.model || 'meta-llama/Llama-2-70b-chat-hf'}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: agentParams.temperature || 0.7,
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${agentParams.apiKey || process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const responseText = response.data[0]?.generated_text || '';
    
    // Detect if an action is suggested
    const actionTaken = detectAction(responseText);
    
    return { 
      response: responseText,
      actionTaken
    };
    */
  } catch (error) {
    console.error('Error calling HuggingFace:', error);
    throw new Error(`HuggingFace API error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Run internal model
const runInternalModel = async (prompt: string, agentParams: any): Promise<{response: string, actionTaken?: string}> => {
  // This would be replaced with your internal model API call
  // For now, it's just a mock
  console.log('Using mock internal model response for testing');
  
  const mockResponse = mockOpenAIResponse(prompt); // Reusing the mock function
  
  // Detect if an action is suggested
  const actionTaken = detectAction(mockResponse.content);
  
  return { 
    response: mockResponse.content,
    actionTaken
  };
};

/**
 * Main function to run an agent with given input context
 */
export async function runAgent(agent: Agent, inputContext: any) {
  const startTime = Date.now();
  
  try {
    // Parse agent parameters
    const params = agent.parameters as any || {};
    
    // Build the prompt
    const prompt = await buildPrompt(agent, inputContext);
    
    // Determine model provider and execute
    let modelResponse;
    switch (params.modelProvider?.toLowerCase() || 'openai') {
      case 'huggingface':
        modelResponse = await runHuggingFaceModel(prompt, params);
        break;
      case 'internal':
        modelResponse = await runInternalModel(prompt, params);
        break;
      case 'openai':
      default:
        modelResponse = await runOpenAIModel(prompt, params);
    }
    
    const executionTime = Date.now() - startTime;
    
    // Save execution log
    const log = await prisma.agentExecutionLog.create({
      data: {
        accountId: agent.accountId,
        agentId: agent.id,
        prompt,
        response: modelResponse.response,
        inputContext: inputContext,
        executionTime,
        actionTaken: modelResponse.actionTaken || null,
        status: 'success'
      }
    });
    
    return {
      success: true,
      executionId: log.id,
      response: modelResponse.response,
      actionTaken: modelResponse.actionTaken,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Save error log
    await prisma.agentExecutionLog.create({
      data: {
        accountId: agent.accountId,
        agentId: agent.id,
        prompt: await buildPrompt(agent, inputContext),
        inputContext: inputContext,
        executionTime,
        status: 'error',
        error: errorMessage
      }
    });
    
    return {
      success: false,
      error: errorMessage,
      executionTime,
    };
  }
} 