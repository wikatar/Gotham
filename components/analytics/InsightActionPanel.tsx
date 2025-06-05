'use client'

import { useState } from 'react'
import Button from '../../app/components/ui/Button'
import Card from '../../app/components/ui/Card'
import Badge from '../../app/components/ui/Badge'
import { CheckCircle, AlertCircle, Clock, Send, FileText, Bell } from 'lucide-react'

interface InsightActionPanelProps {
  insight: any
  onActionComplete: () => void
  onCancel?: () => void
}

export default function InsightActionPanel({ 
  insight, 
  onActionComplete,
  onCancel 
}: InsightActionPanelProps) {
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [actionResult, setActionResult] = useState<any>(null)

  const availableActions = [
    {
      id: 'create_incident',
      label: 'Create Incident',
      description: 'Create an incident report based on this insight',
      icon: <AlertCircle className="h-4 w-4" />
    },
    {
      id: 'notify_team',
      label: 'Notify Team',
      description: 'Send notification to relevant team members',
      icon: <Bell className="h-4 w-4" />
    },
    {
      id: 'generate_report',
      label: 'Generate Report',
      description: 'Create a detailed report for this insight',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'schedule_review',
      label: 'Schedule Review',
      description: 'Schedule a review meeting to discuss this insight',
      icon: <Clock className="h-4 w-4" />
    }
  ]

  const executeAction = async () => {
    if (!selectedAction) return

    setLoading(true)
    
    try {
      const response = await fetch('/api/insights/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction,
          insight: insight,
          metadata: {
            timestamp: new Date().toISOString(),
            userId: 'current-user' // This should come from auth context
          }
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setActionResult({
          success: true,
          message: result.message || 'Action completed successfully',
          data: result.data
        })
        
        // Auto-complete after 3 seconds
        setTimeout(() => {
          onActionComplete()
        }, 3000)
      } else {
        setActionResult({
          success: false,
          message: result.message || 'Action failed',
          error: result.error
        })
      }
    } catch (error) {
      console.error('Error executing action:', error)
      setActionResult({
        success: false,
        message: 'Failed to execute action',
        error: error
      })
    }
    
    setLoading(false)
  }

  if (actionResult) {
    return (
      <Card title="Action Result">
        <div className="text-center py-6">
          {actionResult.success ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">
                Action Completed Successfully
              </h3>
              <p className="text-sm text-green-600 mb-4">
                {actionResult.message}
              </p>
              {actionResult.data && (
                <div className="bg-green-50 p-3 rounded text-left text-xs">
                  <pre>{JSON.stringify(actionResult.data, null, 2)}</pre>
                </div>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Action Failed
              </h3>
              <p className="text-sm text-red-600 mb-4">
                {actionResult.message}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setActionResult(null)}
                >
                  Try Again
                </Button>
                {onCancel && (
                  <Button
                    variant="secondary"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card title="Take Action on Insight">
      <div className="space-y-4">
        {/* Insight Summary */}
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{insight.title}</h4>
            {insight.type && (
              <Badge variant="secondary">
                {insight.type}
              </Badge>
            )}
            {insight.confidence && (
              <Badge variant="outline">
                {insight.confidence}% confidence
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {insight.content}
          </p>
        </div>

        {/* Action Selection */}
        <div>
          <h5 className="font-medium mb-3">Select an action:</h5>
          <div className="space-y-2">
            {availableActions.map((action) => (
              <div
                key={action.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedAction === action.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAction(action.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-600">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedAction === action.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAction === action.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="primary"
            disabled={!selectedAction || loading}
            onClick={executeAction}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Executing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Execute Action
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
} 