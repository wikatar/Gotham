'use client'

import { useState } from 'react'
import axios from 'axios'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface FeedbackFormProps {
  executionLogId: string;
  accountId: string;
  onFeedbackSubmitted?: () => void;
}

export default function FeedbackForm({ executionLogId, accountId, onFeedbackSubmitted }: FeedbackFormProps) {
  // Form state
  const [rating, setRating] = useState<number | null>(null)
  const [wasActionEffective, setWasActionEffective] = useState<boolean | null>(null)
  const [comment, setComment] = useState('')
  const [measuredImpact, setMeasuredImpact] = useState<Record<string, number>>({})
  const [newMetricKey, setNewMetricKey] = useState('')
  const [newMetricValue, setNewMetricValue] = useState<number | null>(null)
  
  // UI state
  const [showMeasuredImpact, setShowMeasuredImpact] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Add a new metric to the measured impact object
  const handleAddMetric = () => {
    if (!newMetricKey || newMetricValue === null) return
    
    setMeasuredImpact(prev => ({
      ...prev,
      [newMetricKey]: newMetricValue
    }))
    
    setNewMetricKey('')
    setNewMetricValue(null)
  }
  
  // Remove a metric from the measured impact object
  const handleRemoveMetric = (key: string) => {
    setMeasuredImpact(prev => {
      const newImpact = { ...prev }
      delete newImpact[key]
      return newImpact
    })
  }
  
  // Submit the feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating) {
      setError('Please provide a rating')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Step 1: Submit the feedback
      const response = await axios.post('/api/agent-feedback/create', {
        executionLogId,
        accountId,
        rating,
        comment: comment.trim() === '' ? undefined : comment,
        wasActionEffective,
        measuredImpact: Object.keys(measuredImpact).length > 0 ? measuredImpact : undefined
      })
      
      if (response.data.success) {
        // Step 2: Get the agentId from the execution log
        const executionResponse = await axios.get(`/api/agents/execution-log?id=${executionLogId}`)
        
        if (executionResponse.data.success) {
          const agentId = executionResponse.data.data.agentId
          
          // Step 3: Update the agent's trust score
          await axios.post('/api/agent-feedback/update-trust', { agentId })
        }
        
        setSuccess(true)
        setRating(null)
        setWasActionEffective(null)
        setComment('')
        setMeasuredImpact({})
        setShowMeasuredImpact(false)
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted()
        }
      } else {
        setError(response.data.error || 'Failed to submit feedback')
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('An error occurred while submitting feedback')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card title="Provide Feedback">
      <div className="p-4">
        {success ? (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4 text-green-800">
            Thank you for your feedback! Your input helps improve agent performance.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-800 text-sm">
                {error}
              </div>
            )}
            
            {/* Rating */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Rate Agent Performance (1-5)
              </label>
              <div className="flex space-x-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setRating(value)}
                    className={`flex-1 h-10 rounded flex items-center justify-center transition-colors ${
                      rating === value
                        ? 'bg-primary text-white'
                        : 'bg-secondary/10 hover:bg-secondary/20'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-xs text-text-secondary">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
            
            {/* Action Effectiveness */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Was the agent's action effective?
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setWasActionEffective(true)}
                  className={`flex-1 py-2 px-4 rounded text-sm ${
                    wasActionEffective === true
                      ? 'bg-green-500 text-white'
                      : 'bg-secondary/10 hover:bg-secondary/20'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWasActionEffective(false)}
                  className={`flex-1 py-2 px-4 rounded text-sm ${
                    wasActionEffective === false
                      ? 'bg-red-500 text-white'
                      : 'bg-secondary/10 hover:bg-secondary/20'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            
            {/* Comment */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">
                Comments or Suggestions
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-secondary/30 rounded"
                placeholder="Any other feedback about this agent action?"
                rows={3}
              />
            </div>
            
            {/* Measured Impact (Optional) */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                  Measured Impact (Optional)
                </label>
                <button
                  type="button"
                  className="text-xs text-primary font-medium"
                  onClick={() => setShowMeasuredImpact(prev => !prev)}
                >
                  {showMeasuredImpact ? 'Hide' : 'Add Metrics'}
                </button>
              </div>
              
              {showMeasuredImpact && (
                <div className="bg-secondary/5 rounded p-3 mb-2">
                  {/* Metrics List */}
                  {Object.keys(measuredImpact).length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium mb-2">Added Metrics:</div>
                      <div className="space-y-2">
                        {Object.entries(measuredImpact).map(([key, value]) => (
                          <div key={key} className="flex justify-between bg-white p-2 rounded border border-secondary/20">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{key}:</span>{' '}
                              <span className="text-sm">{value}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMetric(key)}
                              className="text-red-500 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add New Metric */}
                  <div className="flex space-x-2">
                    <input
                      value={newMetricKey}
                      onChange={(e) => setNewMetricKey(e.target.value)}
                      placeholder="Metric name"
                      className="flex-1 p-2 border border-secondary/30 rounded text-sm"
                    />
                    <input
                      type="number"
                      value={newMetricValue === null ? '' : newMetricValue}
                      onChange={(e) => setNewMetricValue(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Value"
                      className="w-24 p-2 border border-secondary/30 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddMetric}
                      className="px-3 py-2 bg-secondary/10 rounded text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-text-secondary">
                    Examples: churnReduction: 5%, responseRate: 0.4, conversionIncrease: 12
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !rating}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
} 