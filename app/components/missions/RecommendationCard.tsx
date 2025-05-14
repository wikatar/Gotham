'use client';

import React from 'react';
import { AgentRecommendation } from '../agent/types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface RecommendationCardProps {
  recommendation: AgentRecommendation;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onImplement?: (id: string) => void;
}

export default function RecommendationCard({ 
  recommendation, 
  onAccept, 
  onReject,
  onImplement
}: RecommendationCardProps) {
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Get priority badge styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge styling
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'action':
        return 'bg-green-100 text-green-800';
      case 'insight':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-red-100 text-red-800';
      case 'opportunity':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend?: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return <span className="text-success">↑</span>;
      case 'down':
        return <span className="text-error">↓</span>;
      case 'flat':
        return <span className="text-text-secondary">→</span>;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium text-lg">{recommendation.title}</h3>
            <div className="flex space-x-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(recommendation.priority)}`}>
                {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(recommendation.type)}`}>
                {recommendation.type.charAt(0).toUpperCase() + recommendation.type.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center bg-secondary/10 px-2 py-1 rounded-md">
              <div className="w-2 h-2 rounded-full bg-accent mr-1"></div>
              <span className="text-sm">{recommendation.confidence}% confidence</span>
            </div>
            <div className="text-xs text-text-secondary mt-1">
              {formatDate(recommendation.timestamp)}
            </div>
          </div>
        </div>

        <p className="text-text-secondary mb-4">{recommendation.description}</p>

        {recommendation.dataPoints && recommendation.dataPoints.length > 0 && (
          <div className="bg-background-elevated p-3 rounded-md mb-4">
            <h4 className="text-sm font-medium mb-2">Supporting Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {recommendation.dataPoints.map((point, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-text-secondary">{point.label}:</span>
                  <span className="text-sm font-medium">
                    {point.value} {getTrendIcon(point.trend)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendation.suggestedAction && (
          <div className="border-t border-secondary/20 pt-3 mt-3">
            <div className="mb-2">
              <h4 className="font-medium">Suggested Action</h4>
              <p className="text-sm">{recommendation.suggestedAction.description}</p>
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-text-secondary">Expected Outcome:</span>
                <span className="ml-1">{recommendation.suggestedAction.expectedOutcome}</span>
              </div>
              <div>
                <span className="text-text-secondary">Est. Impact:</span>
                <span className="ml-1 font-medium">{recommendation.suggestedAction.estimatedImpact}%</span>
              </div>
            </div>
          </div>
        )}

        {recommendation.status === 'new' && (
          <div className="flex justify-end space-x-2 mt-4 border-t border-secondary/20 pt-3">
            {onReject && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onReject(recommendation.id)}
              >
                Reject
              </Button>
            )}
            {onAccept && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onAccept(recommendation.id)}
              >
                Accept
              </Button>
            )}
            {onImplement && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onImplement(recommendation.id)}
              >
                Implement
              </Button>
            )}
          </div>
        )}

        {recommendation.status === 'viewed' && (
          <div className="flex justify-end space-x-2 mt-4 border-t border-secondary/20 pt-3">
            {onReject && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onReject(recommendation.id)}
              >
                Reject
              </Button>
            )}
            {onImplement && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onImplement(recommendation.id)}
              >
                Implement
              </Button>
            )}
          </div>
        )}

        {recommendation.status === 'accepted' && (
          <div className="flex justify-end space-x-2 mt-4 border-t border-secondary/20 pt-3">
            {onImplement && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onImplement(recommendation.id)}
              >
                Implement Now
              </Button>
            )}
          </div>
        )}

        {(recommendation.status === 'implemented' || recommendation.status === 'rejected') && (
          <div className="flex justify-end mt-4 border-t border-secondary/20 pt-3">
            <span className="text-sm text-text-secondary">
              Status: {recommendation.status.charAt(0).toUpperCase() + recommendation.status.slice(1)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
} 