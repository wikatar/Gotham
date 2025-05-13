import React from 'react';
import Card from '../ui/Card';
import { Concept } from './types';

type ConceptListProps = {
  concepts: Concept[];
  selectedConcept: Concept | null;
  onSelectConcept: (concept: Concept) => void;
};

const ConceptList: React.FC<ConceptListProps> = ({
  concepts,
  selectedConcept,
  onSelectConcept,
}) => {
  return (
    <Card title="Concepts" className="h-[calc(100vh-400px)] overflow-hidden flex flex-col">
      <div className="overflow-y-auto flex-grow">
        {concepts.length > 0 ? (
          <ul className="divide-y divide-secondary/10">
            {concepts.map(concept => (
              <li 
                key={concept.id}
                className={`p-4 hover:bg-background-elevated cursor-pointer ${
                  selectedConcept?.id === concept.id ? 'bg-background-elevated border-l-4 border-primary' : ''
                }`}
                onClick={() => onSelectConcept(concept)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{concept.name}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2">{concept.description}</p>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-background-paper text-xs capitalize">
                    {concept.domain}
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs text-text-secondary">
                  <span className="mr-3">{concept.attributes?.length || 0} attributes</span>
                  <span>{concept.relationships?.length || 0} relationships</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-text-secondary">
            <p>No concepts found matching your filters.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConceptList; 