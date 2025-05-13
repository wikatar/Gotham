import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Concept, Attribute, Relationship } from './types';
import AttributeEditor from './AttributeEditor';
import RelationshipEditor from './RelationshipEditor';

type ConceptDetailProps = {
  concept: Concept | null;
  onCreateConcept: () => void;
  availableConcepts: Concept[];
  onUpdateConcept?: (updatedConcept: Concept) => void;
};

const ConceptDetail: React.FC<ConceptDetailProps> = ({ 
  concept, 
  onCreateConcept,
  availableConcepts,
  onUpdateConcept 
}) => {
  const [showAttributeEditor, setShowAttributeEditor] = useState(false);
  const [showRelationshipEditor, setShowRelationshipEditor] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<Attribute | undefined>(undefined);
  const [currentRelationship, setCurrentRelationship] = useState<Relationship | undefined>(undefined);

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const handleAddAttribute = () => {
    setCurrentAttribute(undefined);
    setShowAttributeEditor(true);
  };

  const handleEditAttribute = (attribute: Attribute) => {
    setCurrentAttribute(attribute);
    setShowAttributeEditor(true);
  };

  const handleAddRelationship = () => {
    setCurrentRelationship(undefined);
    setShowRelationshipEditor(true);
  };

  const handleEditRelationship = (relationship: Relationship) => {
    setCurrentRelationship(relationship);
    setShowRelationshipEditor(true);
  };

  const handleSaveAttribute = (attribute: Attribute) => {
    if (!concept || !onUpdateConcept) return;
    
    const updatedConcept = { ...concept };
    
    // If we're updating an existing attribute, replace it
    if (currentAttribute) {
      updatedConcept.attributes = (updatedConcept.attributes || []).map(attr => 
        attr.name === currentAttribute.name ? attribute : attr
      );
    } else {
      // Otherwise add a new attribute
      updatedConcept.attributes = [...(updatedConcept.attributes || []), attribute];
    }
    
    onUpdateConcept(updatedConcept);
    setShowAttributeEditor(false);
  };

  const handleSaveRelationship = (relationship: Relationship) => {
    if (!concept || !onUpdateConcept) return;
    
    const updatedConcept = { ...concept };
    
    // If we're updating an existing relationship, replace it
    if (currentRelationship) {
      updatedConcept.relationships = (updatedConcept.relationships || []).map(rel => 
        rel.target_concept_id === currentRelationship.target_concept_id ? relationship : rel
      );
    } else {
      // Otherwise add a new relationship
      updatedConcept.relationships = [...(updatedConcept.relationships || []), relationship];
    }
    
    onUpdateConcept(updatedConcept);
    setShowRelationshipEditor(false);
  };

  // If no concept is selected, show the empty state
  if (!concept) {
    return (
      <Card className="h-[calc(100vh-400px)] flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-xl font-medium mb-2">Select a Concept</h3>
          <p className="text-text-secondary mb-4">
            Choose a concept from the list to view its details
          </p>
          <Button 
            onClick={onCreateConcept}
            variant="primary"
          >
            Create New Concept
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title={concept.name} className="h-[calc(100vh-400px)] overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-grow p-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-text-secondary">{concept.description}</p>
              <div className="flex items-center mt-2">
                <div className="px-2 py-1 rounded-full bg-primary/10 text-xs capitalize mr-2">
                  {concept.domain}
                </div>
                <div className="px-2 py-1 rounded-full bg-secondary/10 text-xs capitalize">
                  {concept.category}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">Edit</Button>
              <Button variant="secondary" size="sm">Map Data</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attributes Section */}
            <div>
              <div className="flex justify-between items-center mb-3 border-b border-secondary/20 pb-2">
                <h3 className="text-md font-medium">
                  Attributes ({concept.attributes?.length || 0})
                </h3>
                {onUpdateConcept && (
                  <Button variant="secondary" size="sm" onClick={handleAddAttribute}>
                    + Add
                  </Button>
                )}
              </div>
              
              {concept.attributes?.length ? (
                <div className="space-y-3">
                  {concept.attributes.map(attr => (
                    <div 
                      key={attr.name} 
                      className="border border-secondary/20 rounded-md p-3 relative group"
                    >
                      {onUpdateConcept && (
                        <button 
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary"
                          onClick={() => handleEditAttribute(attr)}
                        >
                          Edit
                        </button>
                      )}
                      <div className="flex justify-between">
                        <div className="font-medium">{attr.name}</div>
                        <div className="text-xs px-2 py-1 bg-background-paper rounded-full">
                          {attr.data_type}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{attr.description}</p>
                      <div className="flex items-center text-xs mt-2">
                        {attr.is_required && (
                          <div className="mr-2 px-1.5 py-0.5 rounded bg-red-500/20 text-red-500">Required</div>
                        )}
                        {attr.validation_rules && (
                          <div className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500">Has Validation</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-text-secondary p-4">
                  No attributes defined
                </div>
              )}
            </div>
            
            {/* Relationships Section */}
            <div>
              <div className="flex justify-between items-center mb-3 border-b border-secondary/20 pb-2">
                <h3 className="text-md font-medium">
                  Relationships ({concept.relationships?.length || 0})
                </h3>
                {onUpdateConcept && (
                  <Button variant="secondary" size="sm" onClick={handleAddRelationship}>
                    + Add
                  </Button>
                )}
              </div>
              
              {concept.relationships?.length ? (
                <div className="space-y-3">
                  {concept.relationships.map((rel, index) => (
                    <div 
                      key={index} 
                      className="border border-secondary/20 rounded-md p-3 relative group"
                    >
                      {onUpdateConcept && (
                        <button 
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary"
                          onClick={() => handleEditRelationship(rel)}
                        >
                          Edit
                        </button>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{rel.target_concept_name}</div>
                          <div className="text-xs text-text-secondary mt-1 capitalize">
                            {rel.relation_type}
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 bg-background-paper rounded-full">
                          {rel.cardinality}
                        </div>
                      </div>
                      <div className="flex items-center text-xs mt-2">
                        {rel.is_bidirectional && (
                          <div className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-500">Bidirectional</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-text-secondary p-4">
                  No relationships defined
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium mb-3 border-b border-secondary/20 pb-2">
              Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-text-secondary">Created</div>
                <div>{formatDate(concept.created_at)}</div>
              </div>
              <div>
                <div className="text-text-secondary">Last Updated</div>
                <div>{formatDate(concept.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Attribute Editor Modal */}
      <AttributeEditor
        isOpen={showAttributeEditor}
        onClose={() => setShowAttributeEditor(false)}
        onSave={handleSaveAttribute}
        attribute={currentAttribute}
      />

      {/* Relationship Editor Modal */}
      {concept && (
        <RelationshipEditor
          isOpen={showRelationshipEditor}
          onClose={() => setShowRelationshipEditor(false)}
          onSave={handleSaveRelationship}
          relationship={currentRelationship}
          availableConcepts={availableConcepts}
          currentConceptId={concept.id}
        />
      )}
    </>
  );
};

export default ConceptDetail; 