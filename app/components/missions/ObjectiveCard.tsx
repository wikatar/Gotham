'use client';

import React from 'react';
import { MissionObjective, ObjectiveStatus, MissionPriority } from './types';
import Card from '../ui/Card';

// Status badge component
const StatusBadge: React.FC<{ status: ObjectiveStatus }> = ({ status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = () => {
    switch(status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      case 'blocked':
        return 'Blocked';
      default:
        return status;
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusLabel()}
    </span>
  );
};

// Priority indicator component
const PriorityIndicator: React.FC<{ priority: MissionPriority }> = ({ priority }) => {
  const getColor = () => {
    switch(priority) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getLabel = () => {
    switch(priority) {
      case 'critical':
        return 'Critical';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return priority;
    }
  };
  
  return (
    <div className="flex items-center">
      <span className={`w-2 h-2 rounded-full ${getColor()} mr-1`}></span>
      <span className="text-xs text-text-secondary">{getLabel()} Priority</span>
    </div>
  );
};

type ObjectiveCardProps = {
  objective: MissionObjective;
  className?: string;
  onClick?: () => void;
};

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ 
  objective, 
  className = '',
  onClick 
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <Card 
      className={`h-full ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="h-full flex flex-col">
        <div className="flex justify-between mb-3">
          <StatusBadge status={objective.status} />
          <PriorityIndicator priority={objective.priority} />
        </div>
        
        <h3 className="text-lg font-medium mb-2">{objective.title}</h3>
        <p className="text-text-secondary text-sm mb-4">{objective.description}</p>
        
        {objective.owner && (
          <div className="mb-4 text-sm">
            <span className="text-text-secondary">Owner: </span>
            <span>{objective.owner}</span>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-text-secondary mb-1 mt-auto">
          <span>Progress</span>
          <span>{objective.progress}%</span>
        </div>
        
        <div className="w-full h-2 bg-background-elevated rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              objective.status === 'completed' ? 'bg-green-500' :
              objective.status === 'blocked' ? 'bg-red-500' :
              'bg-blue-500'
            }`} 
            style={{ width: `${objective.progress}%` }}
          ></div>
        </div>
        
        {(objective.startDate || objective.dueDate) && (
          <div className="flex justify-between text-xs mt-3 text-text-secondary">
            {objective.startDate && (
              <div>
                <div>Started</div>
                <div>{formatDate(objective.startDate)}</div>
              </div>
            )}
            
            {objective.dueDate && (
              <div className="text-right">
                <div>Due</div>
                <div className={`${
                  objective.dueDate < new Date() && objective.status !== 'completed' 
                    ? 'text-red-500 font-medium' 
                    : ''
                }`}>
                  {formatDate(objective.dueDate)}
                </div>
              </div>
            )}
          </div>
        )}
        
        {objective.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {objective.tags.map((tag, index) => (
              <span key={index} className="text-xs bg-background-elevated px-2 py-0.5 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ObjectiveCard; 