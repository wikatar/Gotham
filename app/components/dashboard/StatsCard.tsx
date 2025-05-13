'use client'

import Card from '../ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon?: string
  className?: string
}

export default function StatsCard({
  title,
  value,
  change,
  icon = '📊',
  className = '',
}: StatsCardProps) {
  return (
    <Card title={title} className={className}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">{value}</div>
          
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm ${
                  change.isPositive ? 'text-success' : 'text-error'
                }`}
              >
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-text-secondary text-xs ml-1">vs last period</span>
            </div>
          )}
        </div>
        
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </Card>
  )
} 