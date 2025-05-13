import React from 'react';
import { DataSourceType, DataSourceCategory } from './types';

type TypeBadgeProps = {
  type: DataSourceType;
  className?: string;
};

type CategoryBadgeProps = {
  category: DataSourceCategory;
  className?: string;
};

export const TypeBadge: React.FC<TypeBadgeProps> = ({ 
  type,
  className = ''
}) => {
  const getTypeIcon = (type: DataSourceType) => {
    switch (type) {
      case 'api':
        return '🔌';
      case 'database':
        return '🗄️';
      case 'file':
        return '📄';
      case 'stream':
        return '📊';
      case 'webhook':
        return '🪝';
      case 'other':
        return '🔗';
      default:
        return '🔗';
    }
  };

  const getTypeLabel = (type: DataSourceType) => {
    switch (type) {
      case 'api':
        return 'API';
      case 'database':
        return 'Database';
      case 'file':
        return 'File';
      case 'stream':
        return 'Stream';
      case 'webhook':
        return 'Webhook';
      case 'other':
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const getTypeColor = (type: DataSourceType) => {
    switch (type) {
      case 'api':
        return 'bg-blue-100 text-blue-800';
      case 'database':
        return 'bg-purple-100 text-purple-800';
      case 'file':
        return 'bg-yellow-100 text-yellow-800';
      case 'stream':
        return 'bg-green-100 text-green-800';
      case 'webhook':
        return 'bg-pink-100 text-pink-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(type)} ${className}`}>
      <span className="mr-1">{getTypeIcon(type)}</span>
      {getTypeLabel(type)}
    </span>
  );
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category,
  className = ''
}) => {
  const getCategoryColor = (category: DataSourceCategory) => {
    switch (category) {
      case 'core':
        return 'bg-red-100 text-red-800';
      case 'operational':
        return 'bg-blue-100 text-blue-800';
      case 'analytical':
        return 'bg-indigo-100 text-indigo-800';
      case 'external':
        return 'bg-yellow-100 text-yellow-800';
      case 'internal':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-orange-100 text-orange-800';
      case 'financial':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)} ${className}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

export default { TypeBadge, CategoryBadge };