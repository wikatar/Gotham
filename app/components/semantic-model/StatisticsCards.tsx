import React from 'react';
import Card from '../ui/Card';
import { Concept } from './types';

type StatisticsCardsProps = {
  concepts: Concept[];
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ concepts }) => {
  // Calculate statistics
  const totalConcepts = concepts.length;
  const coreConcepts = concepts.filter(c => c.category === 'core').length;
  const totalRelationships = concepts.reduce(
    (sum, concept) => sum + (concept.relationships?.length || 0), 
    0
  );
  const totalAttributes = concepts.reduce(
    (sum, concept) => sum + (concept.attributes?.length || 0), 
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card title="Total Concepts" className="flex flex-col">
        <div className="text-3xl font-bold">{totalConcepts}</div>
        <div className="text-text-secondary text-sm">Building blocks of your data model</div>
      </Card>
      
      <Card title="Core Concepts" className="flex flex-col">
        <div className="text-3xl font-bold text-blue-500">
          {coreConcepts}
        </div>
        <div className="text-text-secondary text-sm">Fundamental business entities</div>
      </Card>
      
      <Card title="Relationships" className="flex flex-col">
        <div className="text-3xl font-bold text-green-500">
          {totalRelationships}
        </div>
        <div className="text-text-secondary text-sm">Connections between concepts</div>
      </Card>
      
      <Card title="Attributes" className="flex flex-col">
        <div className="text-3xl font-bold text-purple-500">
          {totalAttributes}
        </div>
        <div className="text-text-secondary text-sm">Properties across all concepts</div>
      </Card>
    </div>
  );
};

export default StatisticsCards; 