import React, { useState } from 'react';
import Button from '../ui/Button';
import { Relationship, Concept } from './types';

type RelationshipEditorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relationship: Relationship) => void;
  relationship?: Relationship; // If editing existing relationship
  availableConcepts: Concept[]; // For selecting target concept
  currentConceptId: string; // To prevent self-relationships
};

const DEFAULT_RELATIONSHIP: Relationship = {
  target_concept_id: '',
  target_concept_name: '',
  relation_type: 'related to',
  is_bidirectional: true,
  cardinality: '1:1'
};

const RelationshipEditor: React.FC<RelationshipEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  relationship,
  availableConcepts,
  currentConceptId
}) => {
  const [formData, setFormData] = useState<Relationship>(relationship || DEFAULT_RELATIONSHIP);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredConcepts = availableConcepts.filter(c => c.id !== currentConceptId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // If we're changing the target concept, also update the name
    if (name === 'target_concept_id' && value) {
      const targetConcept = availableConcepts.find(c => c.id === value);
      if (targetConcept) {
        setFormData(prev => ({ ...prev, target_concept_name: targetConcept.name }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.target_concept_id) {
      setValidationError('Target concept is required');
      return;
    }
    
    onSave(formData);
    setValidationError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-paper rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6 border-b border-secondary/20">
          <h3 className="text-xl font-semibold">
            {relationship ? 'Edit Relationship' : 'Add Relationship'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {validationError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-md">
                {validationError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Target Concept*</label>
              <select
                name="target_concept_id"
                value={formData.target_concept_id}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
              >
                <option value="">Select a concept</option>
                {filteredConcepts.map(concept => (
                  <option key={concept.id} value={concept.id}>
                    {concept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Relationship Type*</label>
              <select
                name="relation_type"
                value={formData.relation_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
              >
                <option value="related to">related to</option>
                <option value="has many">has many</option>
                <option value="belongs to">belongs to</option>
                <option value="contains">contains</option>
                <option value="included in">included in</option>
                <option value="created by">created by</option>
                <option value="owned by">owned by</option>
                <option value="managed by">managed by</option>
                <option value="part of">part of</option>
                <option value="composed of">composed of</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cardinality*</label>
              <select
                name="cardinality"
                value={formData.cardinality}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
              >
                <option value="1:1">One-to-One (1:1)</option>
                <option value="1:n">One-to-Many (1:n)</option>
                <option value="n:1">Many-to-One (n:1)</option>
                <option value="n:n">Many-to-Many (n:n)</option>
              </select>
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="is_bidirectional"
                name="is_bidirectional"
                checked={formData.is_bidirectional}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="is_bidirectional" className="text-sm font-medium">
                Bidirectional Relationship
              </label>
            </div>
          </div>
          
          <div className="p-6 border-t border-secondary/20 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Relationship
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RelationshipEditor;