'use client'

import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Sample data for AI-generated insights
const sampleInsights = [
  {
    id: 1,
    title: 'Revenue Optimization',
    content: 'Based on historical transaction data, we predict a 12% revenue increase if you adjust pricing by 5% in the Electronics category during weekend promotions.',
    confidence: 87,
    tags: ['Revenue', 'Pricing', 'Prediction'],
  },
  {
    id: 2,
    title: 'Inventory Pattern',
    content: 'We\'ve detected a recurring seasonal pattern in your inventory levels. Consider increasing stock of outdoor equipment by 20% before May to avoid stockouts.',
    confidence: 92,
    tags: ['Inventory', 'Seasonal', 'StockLevel'],
  },
  {
    id: 3,
    title: 'Customer Segmentation',
    content: 'Your customer base can be optimally segmented into 5 groups based on purchasing behavior. The "High-value Early Adopters" segment has grown 14% this quarter.',
    confidence: 79,
    tags: ['Customers', 'Segmentation', 'Growth'],
  },
]

export default function AIInsightsPanel() {
  const [activeInsight, setActiveInsight] = useState(sampleInsights[0])
  const [userQuery, setUserQuery] = useState('')
  const [conversation, setConversation] = useState<{role: 'user' | 'ai', content: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuery.trim()) return
    
    const newConversation = [
      ...conversation, 
      { role: 'user', content: userQuery }
    ]
    
    setConversation(newConversation)
    setIsLoading(true)
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        role: 'ai', 
        content: `Based on the data patterns, I can analyze your question about "${userQuery}". Let me provide some insights based on the available data and models.` 
      }
      setConversation([...newConversation, aiResponse])
      setIsLoading(false)
      setUserQuery('')
    }, 1000)
  }
  
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <Card title="AI-Generated Insights" className="h-full">
          <div className="space-y-4">
            {sampleInsights.map((insight) => (
              <div 
                key={insight.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  activeInsight.id === insight.id 
                    ? 'bg-primary border border-secondary/40' 
                    : 'hover:bg-secondary/10'
                }`}
                onClick={() => setActiveInsight(insight)}
              >
                <div className="font-medium mb-1">{insight.title}</div>
                <div className="text-sm text-text-secondary mb-2 line-clamp-2">
                  {insight.content}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    {insight.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs">
                    <span className={`${
                      insight.confidence > 85 ? 'text-success' : 
                      insight.confidence > 70 ? 'text-warning' : 
                      'text-error'
                    }`}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <div className="col-span-8">
        <Card title={`AI Analysis: ${activeInsight.title}`} className="h-full flex flex-col">
          <div className="flex-1 mb-4 overflow-y-auto">
            <div className="p-4 bg-background rounded-md mb-4">
              <div className="mb-2 text-lg font-medium">{activeInsight.title}</div>
              <p className="mb-3">{activeInsight.content}</p>
              <div className="flex items-center text-sm text-text-secondary">
                <span>Confidence: </span>
                <div className="w-32 h-2 bg-background-elevated mx-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      activeInsight.confidence > 85 ? 'bg-success' : 
                      activeInsight.confidence > 70 ? 'bg-warning' : 
                      'bg-error'
                    }`}
                    style={{ width: `${activeInsight.confidence}%` }}
                  ></div>
                </div>
                <span>{activeInsight.confidence}%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {conversation.map((message, i) => (
                <div 
                  key={i} 
                  className={`rounded-md p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary ml-8' 
                      : 'bg-secondary/20 mr-8'
                  }`}
                >
                  <div className="text-xs mb-1 text-text-secondary">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))}
              
              {isLoading && (
                <div className="bg-secondary/20 rounded-md p-3 mr-8">
                  <div className="text-xs mb-1 text-text-secondary">AI Assistant</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-200"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-secondary/20 pt-4">
            <form onSubmit={handleSubmitQuery}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ask the AI about this insight..."
                  className="flex-1 px-4 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Ask'}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
} 