'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Sample data
const data = [
  { name: 'Jan', value: 400, count: 240 },
  { name: 'Feb', value: 300, count: 139 },
  { name: 'Mar', value: 200, count: 980 },
  { name: 'Apr', value: 278, count: 390 },
  { name: 'May', value: 189, count: 480 },
  { name: 'Jun', value: 239, count: 380 },
  { name: 'Jul', value: 349, count: 430 },
]

type ChartType = 'line' | 'bar' | 'area'

interface ChartWidgetProps {
  title: string
  initialChartType?: ChartType
  dataKey?: string
  className?: string
}

export default function ChartWidget({
  title,
  initialChartType = 'line',
  dataKey = 'value',
  className = '',
}: ChartWidgetProps) {
  const [chartType, setChartType] = useState<ChartType>(initialChartType)

  const chartActions = (
    <div className="flex space-x-1">
      <Button
        variant="text"
        size="sm"
        className={`py-1 px-2 ${chartType === 'line' ? 'bg-secondary/20' : ''}`}
        onClick={() => setChartType('line')}
      >
        Line
      </Button>
      <Button
        variant="text"
        size="sm"
        className={`py-1 px-2 ${chartType === 'bar' ? 'bg-secondary/20' : ''}`}
        onClick={() => setChartType('bar')}
      >
        Bar
      </Button>
      <Button
        variant="text"
        size="sm"
        className={`py-1 px-2 ${chartType === 'area' ? 'bg-secondary/20' : ''}`}
        onClick={() => setChartType('area')}
      >
        Area
      </Button>
    </div>
  )

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" tick={{ fill: '#B0B0B0' }} />
            <YAxis tick={{ fill: '#B0B0B0' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#242424', borderColor: '#505050' }}
              labelStyle={{ color: '#FFFFFF' }}
            />
            <Line type="monotone" dataKey={dataKey} stroke="#90CAF9" activeDot={{ r: 8 }} />
          </LineChart>
        )
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" tick={{ fill: '#B0B0B0' }} />
            <YAxis tick={{ fill: '#B0B0B0' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#242424', borderColor: '#505050' }}
              labelStyle={{ color: '#FFFFFF' }}
            />
            <Bar dataKey={dataKey} fill="#90CAF9" />
          </BarChart>
        )
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" tick={{ fill: '#B0B0B0' }} />
            <YAxis tick={{ fill: '#B0B0B0' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#242424', borderColor: '#505050' }}
              labelStyle={{ color: '#FFFFFF' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke="#90CAF9" fill="#90CAF9" fillOpacity={0.3} />
          </AreaChart>
        )
      default:
        return null
    }
  }

  return (
    <Card title={title} actions={chartActions} className={className} minimizable>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  )
} 