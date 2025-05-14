'use client';

import { useState, useEffect } from 'react';

interface SystemMetricsProps {
  onSystemStatusChange: (status: 'healthy' | 'warning' | 'critical') => void;
}

interface MetricType {
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
}

export default function SystemMetrics({ onSystemStatusChange }: SystemMetricsProps) {
  const [metrics, setMetrics] = useState<MetricType[]>([
    {
      name: 'CPU Usage',
      value: 42,
      unit: '%',
      threshold: { warning: 70, critical: 90 },
      trend: 'stable'
    },
    {
      name: 'Memory',
      value: 58,
      unit: '%',
      threshold: { warning: 80, critical: 95 },
      trend: 'up'
    },
    {
      name: 'Network',
      value: 120,
      unit: 'Mbps',
      threshold: { warning: 500, critical: 900 },
      trend: 'up'
    },
    {
      name: 'Disk I/O',
      value: 25,
      unit: 'MB/s',
      threshold: { warning: 80, critical: 120 },
      trend: 'down'
    },
    {
      name: 'API Response',
      value: 180,
      unit: 'ms',
      threshold: { warning: 300, critical: 500 },
      trend: 'stable'
    },
    {
      name: 'Error Rate',
      value: 0.5,
      unit: '%',
      threshold: { warning: 2, critical: 5 },
      trend: 'stable'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => 
        prev.map(metric => {
          // Randomly update values for simulation
          const fluctuation = (Math.random() - 0.5) * (metric.name === 'Error Rate' ? 0.2 : 5);
          let newValue = metric.value + fluctuation;
          
          // Ensure values stay within realistic bounds
          if (metric.name === 'Error Rate') {
            newValue = Math.max(0, Math.min(10, newValue));
          } else if (metric.unit === '%') {
            newValue = Math.max(0, Math.min(100, newValue));
          } else if (metric.name === 'API Response') {
            newValue = Math.max(50, Math.min(800, newValue));
          }
          
          // Determine trend
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (fluctuation > 0.5) trend = 'up';
          else if (fluctuation < -0.5) trend = 'down';
          
          return {
            ...metric,
            value: Number(newValue.toFixed(metric.name === 'Error Rate' ? 2 : 1)),
            trend
          };
        })
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Determine overall system status based on metrics
  useEffect(() => {
    const hasCritical = metrics.some(metric => 
      metric.value >= metric.threshold.critical
    );
    
    const hasWarning = metrics.some(metric => 
      metric.value >= metric.threshold.warning && metric.value < metric.threshold.critical
    );
    
    if (hasCritical) {
      onSystemStatusChange('critical');
    } else if (hasWarning) {
      onSystemStatusChange('warning');
    } else {
      onSystemStatusChange('healthy');
    }
  }, [metrics, onSystemStatusChange]);

  // Get status color
  const getStatusColor = (value: number, threshold: { warning: number, critical: number }) => {
    if (value >= threshold.critical) return 'text-red-500';
    if (value >= threshold.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };
  
  // Get trend color (contextual: for some metrics up is bad, for others it's good)
  const getTrendColor = (metric: MetricType) => {
    const { name, trend, value, threshold } = metric;
    
    // For error rate and resource usage, up is bad
    if (['CPU Usage', 'Memory', 'Error Rate'].includes(name)) {
      if (trend === 'up') return 'text-red-500';
      if (trend === 'down') return 'text-green-500';
    }
    
    // For API Response time, lower is better
    if (name === 'API Response') {
      if (trend === 'up') return 'text-red-500';
      if (trend === 'down') return 'text-green-500';
    }
    
    // Let the threshold determine the color for stable trend
    if (trend === 'stable') {
      return getStatusColor(value, threshold);
    }
    
    return 'text-text-secondary';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-background-elevated p-3 rounded-md">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium">{metric.name}</div>
            <div className={`flex items-center ${getTrendColor(metric)}`}>
              <span>{getTrendIcon(metric.trend)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div className={`text-xl font-bold ${getStatusColor(metric.value, metric.threshold)}`}>
              {metric.value}{metric.unit}
            </div>
            <div className="text-xs text-text-secondary">
              Threshold: {metric.threshold.warning}{metric.unit}
            </div>
          </div>
          
          <div className="w-full h-1.5 bg-background-paper rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full ${
                metric.value >= metric.threshold.critical ? 'bg-red-500' :
                metric.value >= metric.threshold.warning ? 'bg-yellow-500' :
                'bg-green-500'
              }`} 
              style={{ 
                width: `${
                  // Calculate percentage based on value and context
                  metric.unit === '%' 
                    ? metric.value // Already a percentage
                    : metric.name === 'API Response'
                    ? (metric.value / metric.threshold.critical) * 100
                    : (metric.value / metric.threshold.warning) * 100
                }%` 
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
} 