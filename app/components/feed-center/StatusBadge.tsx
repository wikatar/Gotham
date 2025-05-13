import React from 'react';
import { DataSourceStatus } from './types';

type StatusBadgeProps = {
  status: DataSourceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showLabel = true 
}) => {
  const getStatusColor = (status: DataSourceStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'inactive':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: DataSourceStatus) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'h-2 w-2';
      case 'md':
        return 'h-3 w-3';
      case 'lg':
        return 'h-4 w-4';
      default:
        return 'h-3 w-3';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`${getSizeClasses(size)} ${getStatusColor(status)} rounded-full inline-block`}></span>
      {showLabel && (
        <span className="text-xs font-medium">{getStatusLabel(status)}</span>
      )}
    </div>
  );
};

export default StatusBadge; 