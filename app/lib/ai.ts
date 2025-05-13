import { OpenAI } from '@langchain/openai'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { PromptTemplate } from 'langchain/prompts'

// Initialize OpenAI model
const initializeModel = () => {
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-4o',
    temperature: 0.2,
  })
  return model
}

// Generate insights from data
export async function generateInsights(data: any, context: string) {
  const model = initializeModel()
  
  // Define output parser for structured insights
  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    title: 'A concise title for the insight',
    content: 'A detailed explanation of the insight, including actionable recommendations',
    confidence: 'Confidence score from 0-100 as a number',
    tags: 'Array of relevant tags for categorizing this insight',
  })
  
  const formatInstructions = parser.getFormatInstructions()
  
  const prompt = new PromptTemplate({
    template: 
      `You are an advanced data analytics AI assistant. 
      Analyze the following data and generate a valuable business insight.
      Context about the data: {context}
      
      Data: {data}
      
      Generate a single high-value insight based on patterns in this data.
      Focus on actionable insights that could help improve business outcomes.
      {format_instructions}`,
    inputVariables: ['data', 'context'],
    partialVariables: { format_instructions: formatInstructions },
  })
  
  const input = await prompt.format({
    data: JSON.stringify(data),
    context,
  })
  
  const result = await model.call(input)
  
  try {
    return await parser.parse(result)
  } catch (e) {
    console.error('Failed to parse AI output:', e)
    return {
      title: 'Analysis Result',
      content: result,
      confidence: 70,
      tags: ['general', 'analysis'],
    }
  }
}

// Answer a question about data
export async function answerQuestion(question: string, data: any, previousConversation: string[] = []) {
  const model = initializeModel()
  
  const conversationContext = previousConversation.length 
    ? `Previous conversation:\n${previousConversation.join('\n')}\n\n`
    : ''
  
  const prompt = new PromptTemplate({
    template: 
      `You are an advanced data analytics AI assistant.
      ${conversationContext}
      The following is data that you have access to:
      {data}
      
      User question: {question}
      
      Provide a helpful, concise answer based on the data. If you cannot answer based on the provided data, say so.`,
    inputVariables: ['question', 'data'],
  })
  
  const input = await prompt.format({
    question,
    data: JSON.stringify(data),
  })
  
  return await model.call(input)
}

// Extract structured data from text
export async function extractStructuredData(text: string, schema: any) {
  const model = initializeModel()
  
  const prompt = new PromptTemplate({
    template: 
      `Extract structured information from the following text according to this schema:
      {schema}
      
      Text: {text}
      
      Return ONLY a valid JSON object matching the schema.`,
    inputVariables: ['text', 'schema'],
  })
  
  const input = await prompt.format({
    text,
    schema: JSON.stringify(schema),
  })
  
  const result = await model.call(input)
  
  try {
    return JSON.parse(result)
  } catch (e) {
    console.error('Failed to parse extracted data:', e)
    return null
  }
} 