'use client'

import { useEffect, useState } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import axios from 'axios'
import Card from '../ui/Card'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Types for the agent feedback metrics
interface FeedbackMetrics {
  count: number;
  averageRating: number | null;
  actionEffectivenessRate: number | null;
  latestComments: Array<{
    id: string;
    comment: string;
    rating: number;
    createdAt: string;
  }>;
  feedbackOverTime: Array<{
    date: string;
    averageRating: number;
    count: number;
  }>;
}

interface AgentFeedbackMetricsProps {
  agentId: string;
}

export default function AgentFeedbackMetrics({ agentId }: AgentFeedbackMetricsProps) {
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchFeedbackMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get(`/api/agent-feedback/by-agent?agentId=${agentId}`)
        
        if (response.data.success) {
          setMetrics(response.data.data)
        } else {
          setError(response.data.error || 'Failed to load feedback metrics')
        }
      } catch (err) {
        console.error('Error fetching feedback metrics:', err)
        setError('An error occurred while loading feedback data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeedbackMetrics()
  }, [agentId])
  
  // Helper function to format the rating
  const formatRating = (rating: number | null): string => {
    if (rating === null) return 'No ratings yet'
    return rating.toFixed(1)
  }
  
  // Helper function to format the effectiveness rate
  const formatEffectivenessRate = (rate: number | null): string => {
    if (rate === null) return 'No data'
    return `${(rate * 100).toFixed(0)}%`
  }
  
  // Chart data for feedback over time
  const getChartData = () => {
    if (!metrics || !metrics.feedbackOverTime.length) return null
    
    return {
      labels: metrics.feedbackOverTime.map(item => {
        const date = new Date(item.date)
        return date.toLocaleDateString()
      }),
      datasets: [
        {
          label: 'Average Rating',
          data: metrics.feedbackOverTime.map(item => item.averageRating),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.3,
        }
      ]
    }
  }
  
  // Chart options
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex
            const data = metrics?.feedbackOverTime[index]
            return [
              `Rating: ${context.raw}`,
              `Feedback count: ${data?.count || 0}`
            ]
          }
        }
      }
    }
  }
  
  if (loading) {
    return (
      <Card title="Agent Feedback">
        <div className="p-6 flex justify-center">
          <div className="animate-pulse text-text-secondary">
            Loading feedback metrics...
          </div>
        </div>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card title="Agent Feedback">
        <div className="p-6 text-center text-red-500">
          {error}
        </div>
      </Card>
    )
  }
  
  if (!metrics || metrics.count === 0) {
    return (
      <Card title="Agent Feedback">
        <div className="p-6 text-center text-text-secondary">
          No feedback data available for this agent yet.
        </div>
      </Card>
    )
  }
  
  const chartData = getChartData()
  
  return (
    <Card title="Agent Feedback">
      <div className="p-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/5 p-4 rounded">
            <div className="text-sm text-text-secondary mb-1">Average Rating</div>
            <div className="text-2xl font-bold text-primary">
              {formatRating(metrics.averageRating)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Based on {metrics.count} ratings
            </div>
          </div>
          
          <div className="bg-secondary/5 p-4 rounded">
            <div className="text-sm text-text-secondary mb-1">Effectiveness Rate</div>
            <div className="text-2xl font-bold text-green-500">
              {formatEffectivenessRate(metrics.actionEffectivenessRate)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Percentage of actions marked effective
            </div>
          </div>
          
          <div className="bg-secondary/5 p-4 rounded">
            <div className="text-sm text-text-secondary mb-1">Total Feedback</div>
            <div className="text-2xl font-bold">{metrics.count}</div>
            <div className="text-xs text-text-secondary mt-1">
              Feedback submissions received
            </div>
          </div>
        </div>
        
        {/* Feedback Over Time Chart */}
        {chartData && metrics.feedbackOverTime.length > 1 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Rating Over Time</h3>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
        
        {/* Latest Comments */}
        {metrics.latestComments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Latest Comments</h3>
            <div className="space-y-3">
              {metrics.latestComments.map(comment => (
                <div key={comment.id} className="bg-secondary/5 p-3 rounded">
                  <div className="flex justify-between mb-1">
                    <div className="text-xs text-primary font-medium">
                      Rating: {comment.rating}/5
                    </div>
                    <div className="text-xs text-text-secondary">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm">{comment.comment}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 