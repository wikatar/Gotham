import React from 'react';
import Button from '../ui/Button';
import { DataSourceType, DataSourceCategory, DataSourceStatus } from './types';

type FilterPanelProps = {
  selectedStatus: DataSourceStatus | 'all';
  selectedType: DataSourceType | 'all';
  selectedCategory: DataSourceCategory | 'all';
  showStrategicOnly: boolean;
  searchQuery: string;
  onStatusChange: (status: DataSourceStatus | 'all') => void;
  onTypeChange: (type: DataSourceType | 'all') => void;
  onCategoryChange: (category: DataSourceCategory | 'all') => void;
  onStrategicToggle: () => void;
  onSearchChange: (query: string) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedStatus,
  selectedType,
  selectedCategory,
  showStrategicOnly,
  searchQuery,
  onStatusChange,
  onTypeChange,
  onCategoryChange,
  onStrategicToggle,
  onSearchChange,
}) => {
  // Arrays for filtering options
  const statusOptions: Array<{ value: DataSourceStatus | 'all', label: string }> = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const typeOptions: Array<{ value: DataSourceType | 'all', label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Database' },
    { value: 'file', label: 'File' },
    { value: 'stream', label: 'Stream' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'other', label: 'Other' },
  ];

  const categoryOptions: Array<{ value: DataSourceCategory | 'all', label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'core', label: 'Core' },
    { value: 'operational', label: 'Operational' },
    { value: 'analytical', label: 'Analytical' },
    { value: 'external', label: 'External' },
    { value: 'internal', label: 'Internal' },
    { value: 'customer', label: 'Customer' },
    { value: 'financial', label: 'Financial' },
  ];

  return (
    <div className="bg-background-elevated p-4 rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-medium">Filter Data Sources</h3>
        
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search data sources..."
            className="w-full px-4 py-2 bg-background-paper border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-1">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        
        <div className="flex-grow"></div>
        
        {/* Type Filter */}
        <select
          className="px-3 py-1 bg-background-paper border border-secondary/30 rounded-md text-sm focus:outline-none focus:border-primary"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as DataSourceType | 'all')}
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Category Filter */}
        <select
          className="px-3 py-1 bg-background-paper border border-secondary/30 rounded-md text-sm focus:outline-none focus:border-primary"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as DataSourceCategory | 'all')}
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Strategic Toggle */}
        <Button
          variant={showStrategicOnly ? 'primary' : 'secondary'}
          size="sm"
          onClick={onStrategicToggle}
        >
          Strategic Only
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel; 