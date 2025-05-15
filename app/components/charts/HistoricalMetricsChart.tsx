'use client'

import { useState, useEffect } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import Card from '../ui/Card'
import axios from 'axios'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Types for historical metrics data
interface HistoricalMetricsData {
  labels: string[];
  agents: {
    active: number[];
    failed: number[];
    total: number[];
  };
  anomalies: {
    active: number[];
    resolved: number[];
    critical: number[];
  };
  systemStatus: Array<{
    status: string;
    timestamp: string;
  }>;
}

interface ChartProps {
  title: string;
  timeRange: number; // Days to display
}

export default function HistoricalMetricsChart({ title, timeRange = 7 }: ChartProps) {
  const [metrics, setMetrics] = useState<HistoricalMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'agents' | 'anomalies'>('agents')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/control/snapshot/history?days=${timeRange}`)
        if (response.data.success) {
          setMetrics(response.data.data)
        } else {
          setError('Failed to load historical data')
        }
      } catch (err) {
        setError('Error fetching historical data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Generate chart data based on type
  const getChartData = () => {
    if (!metrics) return null
    
    if (chartType === 'agents') {
      return {
        labels: metrics.labels,
        datasets: [
          {
            label: 'Active Agents',
            data: metrics.agents.active,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
          },
          {
            label: 'Failed Agents',
            data: metrics.agents.failed,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
          },
          {
            label: 'Total Agents',
            data: metrics.agents.total,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderDash: [5, 5],
          },
        ],
      }
    } else {
      return {
        labels: metrics.labels,
        datasets: [
          {
            label: 'Active Anomalies',
            data: metrics.anomalies.active,
            borderColor: 'rgb(249, 115, 22)',
            backgroundColor: 'rgba(249, 115, 22, 0.5)',
          },
          {
            label: 'Resolved Anomalies',
            data: metrics.anomalies.resolved,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
          {
            label: 'Critical Incidents',
            data: metrics.anomalies.critical,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderWidth: 2,
          },
        ],
      }
    }
  }

  const chartData = getChartData()

  return (
    <Card title={title}>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-text-secondary">
              Loading historical data...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-4 border-b pb-2">
              <div className="flex space-x-4">
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    chartType === 'agents' 
                      ? 'bg-primary text-white' 
                      : 'bg-secondary/10 text-text-primary'
                  }`}
                  onClick={() => setChartType('agents')}
                >
                  Agents
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    chartType === 'anomalies' 
                      ? 'bg-primary text-white' 
                      : 'bg-secondary/10 text-text-primary'
                  }`}
                  onClick={() => setChartType('anomalies')}
                >
                  Anomalies
                </button>
              </div>
              <div className="text-sm text-text-secondary">
                Last {timeRange} days
              </div>
            </div>
            
            {chartData && (
              <div>
                <Line options={options} data={chartData} height={70} />
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
} 