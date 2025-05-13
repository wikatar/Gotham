'use client';

import React from 'react';
import { MissionAction } from './types';

type ActionItemProps = {
  action: MissionAction;
  onApprove?: (actionId: string) => void;
  onReject?: (actionId: string) => void;
  onComplete?: (actionId: string) => void;
};

const ActionItem: React.FC<ActionItemProps> = ({
  action,
  onApprove,
  onReject,
  onComplete
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };
  
  const getStatusColor = () => {
    switch(action.status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-blue-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-text-secondary';
    }
  };
  
  const getStatusIcon = () => {
    switch(action.status) {
      case 'completed':
        return '✓';
      case 'pending':
        return '⏱';
      case 'approved':
        return '👍';
      case 'rejected':
        return '✗';
      default:
        return '•';
    }
  };
  
  return (
    <div className="border border-secondary/20 rounded-lg p-4 mb-2">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className={`text-lg mr-2 ${getStatusColor()}`}>
            {getStatusIcon()}
          </span>
          <div>
            <h4 className="font-medium">{action.title}</h4>
            <div className="flex items-center mt-0.5">
              <span className="text-xs text-text-secondary mr-2">
                {action.type === 'automated' ? '🤖 Automated' : '👤 Manual'}
              </span>
              {action.aiGenerated && (
                <span className="text-xs text-accent">AI Recommended</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs text-right">
          {action.createdAt && (
            <div>
              <span className="text-text-secondary">Created: </span>
              {formatDate(action.createdAt)}
            </div>
          )}
          {action.scheduledFor && action.status !== 'completed' && (
            <div>
              <span className="text-text-secondary">Scheduled: </span>
              {formatDate(action.scheduledFor)}
            </div>
          )}
          {action.completedAt && (
            <div>
              <span className="text-text-secondary">Completed: </span>
              {formatDate(action.completedAt)}
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-text-secondary mb-3">{action.description}</p>
      
      {action.assignedTo && (
        <div className="text-xs mb-3">
          <span className="text-text-secondary">Assigned to: </span>
          <span>{action.assignedTo}</span>
        </div>
      )}
      
      {action.status === 'pending' && (
        <div className="flex justify-end space-x-2 mt-3">
          {onReject && (
            <button 
              onClick={() => onReject(action.id)}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Reject
            </button>
          )}
          {onApprove && (
            <button 
              onClick={() => onApprove(action.id)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Approve
            </button>
          )}
        </div>
      )}
      
      {action.status === 'approved' && !action.completedAt && onComplete && (
        <div className="flex justify-end space-x-2 mt-3">
          <button 
            onClick={() => onComplete(action.id)}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionItem; 