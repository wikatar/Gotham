import React from 'react';
import Button from '../ui/Button';

type ControlPanelProps = {
  domains: string[];
  activeFilter: string;
  searchQuery: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (query: string) => void;
  onAddConcept: () => void;
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  domains,
  activeFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onAddConcept,
}) => {
  return (
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {domains.map(domain => (
          <Button
            key={domain}
            variant={activeFilter === domain ? 'primary' : 'secondary'}
            onClick={() => onFilterChange(domain)}
            className="capitalize"
          >
            {domain}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search concepts..."
          className="px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        
        <Button 
          variant="primary" 
          onClick={onAddConcept}
        >
          Add Concept
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel; 