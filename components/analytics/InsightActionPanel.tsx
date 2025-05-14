'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'

interface InsightActionPanelProps {
  insight: any
  onActionComplete?: () => void
}

export default function InsightActionPanel({
  insight,
  onActionComplete
}: InsightActionPanelProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  // Determine the actions based on insight type
  const getActions = () => {
    const commonActions = [
      { label: '📨 Send Slack alert', value: 'slack' },
      { label: '📧 Send email notification', value: 'email' },
      { label: '📝 Create ticket', value: 'ticket' },
      { label: '🚫 Ignore', value: 'ignore' },
    ]
    
    switch (insight.type) {
      case 'anomaly':
        return [
          { label: '🔍 Investigate anomaly', value: 'investigate' },
          ...commonActions,
        ]
      case 'trend':
        return [
          { label: '📊 Create trend report', value: 'report' },
          ...commonActions,
        ]
      case 'correlation':
        return [
          { label: '🔄 Schedule follow-up analysis', value: 'followup' },
          ...commonActions,
        ]
      case 'recommendation':
        return [
          { label: '✅ Implement recommendation', value: 'implement' },
          ...commonActions,
        ]
      default:
        return commonActions
    }
  }

  const actions = getActions()

  const takeAction = async (action: string) => {
    setSelectedAction(action)
    setStatus('processing')
    
    try {
      const res = await fetch('/api/insight/act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, insight }),
      })
      
      if (!res.ok) {
        throw new Error('Action failed')
      }
      
      setStatus('done')
      
      // Call the completion callback if provided
      if (onActionComplete) {
        setTimeout(() => {
          onActionComplete()
        }, 1500) // Show success state before calling callback
      }
    } catch (error) {
      console.error('Error taking action:', error)
      setStatus('idle')
      setSelectedAction(null)
    }
  }

  // Generate insight summary based on insight type
  const getInsightSummary = () => {
    if (!insight) return 'No insight data'
    
    switch (insight.type) {
      case 'trend':
        return `${insight.field} is ${insight.percentChange > 0 ? 'increasing' : 'decreasing'} by ${Math.abs(insight.percentChange).toFixed(1)}%`
      case 'anomaly':
        return `Anomaly in ${insight.field}: value ${insight.value} is outside normal range`
      case 'correlation':
        return `${insight.correlation > 0 ? 'Positive' : 'Negative'} correlation (${insight.correlation.toFixed(2)}) between ${insight.fields?.join(' and ')}`
      default:
        return insight.title || 'Insight'
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">
            {getInsightSummary()}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {insight.content?.substring(0, 100)}{insight.content?.length > 100 ? '...' : ''}
          </div>
        </div>
        {insight.confidence && (
          <Badge variant="outline" className="ml-2">
            {insight.confidence}% confidence
          </Badge>
        )}
      </div>
      
      <div className="text-sm font-medium">Take action:</div>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button 
            key={a.value} 
            variant={selectedAction === a.value ? "default" : "secondary"} 
            size="sm"
            onClick={() => takeAction(a.value)}
            disabled={status !== 'idle'}
          >
            {a.label}
            {status === 'processing' && selectedAction === a.value && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
            {status === 'done' && selectedAction === a.value && (
              <Check className="ml-2 h-4 w-4" />
            )}
          </Button>
        ))}
      </div>
      
      {status === 'processing' && (
        <div className="text-xs text-blue-500">🧠 Processing action...</div>
      )}
      {status === 'done' && (
        <div className="text-xs text-green-500">✅ Action completed successfully!</div>
      )}
    </Card>
  )
} 