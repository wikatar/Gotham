'use client';

import React from 'react';
import { Kpi, KpiTrend } from './types';
import Card from '../ui/Card';

// Small line chart component to show trends
const TrendChart: React.FC<{ history: { date: Date; value: number }[] }> = ({ history }) => {
  // Check if we have enough data points
  if (!history || history.length < 2) return null;
  
  // Get min/max for scaling
  const values = history.map(h => h.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1; // Avoid division by zero
  
  // Calculate points for the line
  const points = history.map((point, index) => {
    const x = (index / (history.length - 1)) * 100;
    const y = 100 - ((point.value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-16 h-16">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />
      </svg>
    </div>
  );
};

// Trend indicator icon component
const TrendIndicator: React.FC<{ trend: KpiTrend }> = ({ trend }) => {
  switch(trend) {
    case 'increasing':
      return <span className="text-green-500">↑</span>;
    case 'decreasing':
      return <span className="text-red-500">↓</span>;
    case 'stable':
      return <span className="text-blue-500">→</span>;
    case 'fluctuating':
      return <span className="text-yellow-500">↕</span>;
    default:
      return null;
  }
};

type KpiCardProps = {
  kpi: Kpi;
  className?: string;
};

const KpiCard: React.FC<KpiCardProps> = ({ kpi, className = '' }) => {
  // Format the KPI value based on format type
  const formatValue = (value: number, format?: string, unit?: string) => {
    switch(format) {
      case 'percentage':
        return `${value}${unit}`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0
        }).format(value);
      default:
        return `${value}${unit ? ` ${unit}` : ''}`;
    }
  };
  
  // Calculate progress towards target
  const progress = Math.min(100, Math.max(0, (kpi.value / kpi.target) * 100));
  
  // Determine color based on thresholds
  const getStatusColor = () => {
    if (kpi.value < kpi.thresholds.critical) return 'text-red-500';
    if (kpi.value < kpi.thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  return (
    <Card className={`h-full ${className}`}>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-text-secondary">{kpi.name}</h3>
            <div className="flex items-baseline mt-1">
              <div className={`text-2xl font-bold ${getStatusColor()}`}>
                {formatValue(kpi.value, kpi.format, kpi.unit)}
              </div>
              <div className="ml-2 text-xs text-text-secondary flex items-center">
                <TrendIndicator trend={kpi.trend} />
                <span className="ml-1">vs. Target: {formatValue(kpi.target, kpi.format, kpi.unit)}</span>
              </div>
            </div>
          </div>
          
          <div className="ml-auto">
            <TrendChart history={kpi.history} />
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1 bg-background-elevated rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStatusColor()} bg-current`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default KpiCard; 