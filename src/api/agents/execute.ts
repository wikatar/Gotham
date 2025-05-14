// Agent execution module
// Handles executing agents with different action types

import { PrismaClient, Agent } from '@prisma/client';
import axios from 'axios';
import nodemailer from 'nodemailer';

interface ExecutionOptions {
  timeout?: number;
}

interface ExecutionResult {
  success: boolean;
  action: string;
  timestamp: string;
  actionDetail: string;
  response?: any;
  error?: string;
}

/**
 * Execute an agent with the provided payload
 */
export async function executeAgent(
  accountId: string,
  agent: Agent,
  payload: Record<string, any>,
  options: ExecutionOptions = {}
): Promise<ExecutionResult> {
  console.log('stub: executeAgent');
  
  // Default execution result
  const result: ExecutionResult = {
    success: false,
    action: agent.actionType,
    timestamp: new Date().toISOString(),
    actionDetail: '',
  };
  
  try {
    // Execute the agent based on its action type
    switch (agent.actionType) {
      case 'webhook':
        return await executeWebhookAgent(agent, payload, options);
      
      case 'email':
        return await executeEmailAgent(agent, payload, options);
      
      case 'slack':
        return await executeSlackAgent(agent, payload, options);
      
      case 'zapier':
        return await executeZapierAgent(agent, payload, options);
      
      case 'custom':
        return await executeCustomAgent(agent, payload, options);
      
      default:
        result.error = `Unsupported action type: ${agent.actionType}`;
        return result;
    }
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Execute a webhook agent
 */
async function executeWebhookAgent(
  agent: Agent,
  payload: Record<string, any>,
  options: ExecutionOptions
): Promise<ExecutionResult> {
  console.log('stub: executeWebhookAgent');
  
  const result: ExecutionResult = {
    success: false,
    action: 'webhook',
    timestamp: new Date().toISOString(),
    actionDetail: '',
  };
  
  try {
    // Get webhook URL from agent parameters
    const params = agent.parameters as Record<string, any> || {};
    const webhookUrl = params.url;
    
    if (!webhookUrl) {
      result.error = 'Webhook URL not defined in agent parameters';
      return result;
    }
    
    // Additional webhook parameters
    const method = params.method || 'POST';
    const headers = params.headers || {
      'Content-Type': 'application/json',
    };
    
    // Execute the webhook
    const response = await axios({
      method,
      url: webhookUrl,
      data: payload,
      headers,
      timeout: options.timeout || 30000,
    });
    
    result.success = true;
    result.actionDetail = `Webhook ${method} to ${webhookUrl}`;
    result.response = {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
    
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Execute an email agent
 */
async function executeEmailAgent(
  agent: Agent,
  payload: Record<string, any>,
  options: ExecutionOptions
): Promise<ExecutionResult> {
  console.log('stub: executeEmailAgent');
  
  const result: ExecutionResult = {
    success: false,
    action: 'email',
    timestamp: new Date().toISOString(),
    actionDetail: '',
  };
  
  try {
    // Get email parameters from agent parameters
    const params = agent.parameters as Record<string, any> || {};
    const { 
      smtp, 
      from, 
      to, 
      cc, 
      bcc, 
      subject,
      template,
    } = params;
    
    if (!smtp || !from || !to) {
      result.error = 'Email parameters incomplete. Required: smtp, from, to';
      return result;
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport(smtp);
    
    // Prepare email content
    let html = '';
    let text = '';
    
    if (template) {
      // In a real implementation, we would use a templating engine here
      html = template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
        return payload[key] || match;
      });
      
      // Simple text version
      text = html.replace(/<[^>]*>/g, '');
    } else {
      // Simple default email with payload as JSON
      html = `<pre>${JSON.stringify(payload, null, 2)}</pre>`;
      text = JSON.stringify(payload, null, 2);
    }
    
    // Send email
    const emailResult = await transporter.sendMail({
      from,
      to,
      cc,
      bcc,
      subject: subject || 'Notification from Monolith Analytics',
      html,
      text,
    });
    
    result.success = true;
    result.actionDetail = `Email sent to ${to}`;
    result.response = emailResult;
    
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Execute a Slack agent
 */
async function executeSlackAgent(
  agent: Agent,
  payload: Record<string, any>,
  options: ExecutionOptions
): Promise<ExecutionResult> {
  console.log('stub: executeSlackAgent');
  
  const result: ExecutionResult = {
    success: false,
    action: 'slack',
    timestamp: new Date().toISOString(),
    actionDetail: '',
  };
  
  try {
    // Get Slack parameters from agent parameters
    const params = agent.parameters as Record<string, any> || {};
    const { webhookUrl, channel, username, icon_emoji, template } = params;
    
    if (!webhookUrl) {
      result.error = 'Slack webhook URL not defined in agent parameters';
      return result;
    }
    
    // Prepare message text
    let text = '';
    
    if (template) {
      // In a real implementation, we would use a templating engine here
      text = template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
        return payload[key] || match;
      });
    } else {
      // Simple default message with payload as JSON
      text = `Notification from Monolith Analytics:\n\`\`\`${JSON.stringify(payload, null, 2)}\`\`\``;
    }
    
    // Prepare blocks if any are defined
    let blocks = params.blocks || [];
    
    // Replace placeholders in blocks
    if (blocks.length > 0) {
      blocks = JSON.parse(
        JSON.stringify(blocks).replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
          return payload[key] || match;
        })
      );
    }
    
    // Send to Slack
    const response = await axios.post(
      webhookUrl,
      {
        text,
        channel,
        username,
        icon_emoji,
        ...(blocks.length > 0 ? { blocks } : {}),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: options.timeout || 30000,
      }
    );
    
    result.success = true;
    result.actionDetail = `Slack message sent to ${channel || 'default channel'}`;
    result.response = response.data;
    
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Execute a Zapier agent
 */
async function executeZapierAgent(
  agent: Agent,
  payload: Record<string, any>,
  options: ExecutionOptions
): Promise<ExecutionResult> {
  console.log('stub: executeZapierAgent');
  
  const result: ExecutionResult = {
    success: false,
    action: 'zapier',
    timestamp: new Date().toISOString(),
    actionDetail: '',
  };
  
  try {
    // Get Zapier parameters from agent parameters
    const params = agent.parameters as Record<string, any> || {};
    const { webhookUrl } = params;
    
    if (!webhookUrl) {
      result.error = 'Zapier webhook URL not defined in agent parameters';
      return result;
    }
    
    // Send to Zapier webhook
    const response = await axios.post(
      webhookUrl,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: options.timeout || 30000,
      }
    );
    
    result.success = true;
    result.actionDetail = `Zapier webhook triggered`;
    result.response = response.data;
    
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

/**
 * Execute a custom agent
 */
async function executeCustomAgent(
  agent: Agent,
  payload: Record<string, any>,
  options: ExecutionOptions
): Promise<ExecutionResult> {
  console.log('stub: executeCustomAgent');
  
  const result: ExecutionResult = {
    success: false,
    action: 'custom',
    timestamp: new Date().toISOString(),
    actionDetail: '',
  };
  
  try {
    // Get custom parameters from agent parameters
    const params = agent.parameters as Record<string, any> || {};
    const { handler, config } = params;
    
    if (!handler) {
      result.error = 'Custom handler not defined in agent parameters';
      return result;
    }
    
    // In a real implementation, we would use a more sophisticated system to execute
    // custom handlers, possibly using a plugin system or code sandboxing
    
    // For this stub, we'll just log that we would execute the custom handler
    console.log(`Would execute custom handler: ${handler}`);
    console.log(`With payload:`, payload);
    console.log(`And config:`, config);
    
    // Simulate a successful execution
    result.success = true;
    result.actionDetail = `Custom handler "${handler}" executed`;
    result.response = {
      message: 'Custom handler executed (simulated)',
    };
    
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
} 