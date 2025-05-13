import React, { useState } from 'react';
import Button from '../ui/Button';
import { Concept, Attribute, Relationship } from './types';

type ConceptEditorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (concept: Concept) => void;
  concept?: Concept; // If editing existing concept
};

const DEFAULT_CONCEPT: Concept = {
  id: `concept-${Date.now()}`,
  name: '',
  description: '',
  domain: '',
  category: 'core',
  attributes: [],
  relationships: [],
  created_at: new Date(),
  updated_at: new Date(),
};

const ConceptEditor: React.FC<ConceptEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  concept,
}) => {
  const [formData, setFormData] = useState<Concept>(concept || DEFAULT_CONCEPT);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [tab, setTab] = useState<'basic' | 'attributes' | 'relationships'>('basic');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setValidationError('Concept name is required');
      return;
    }
    
    if (!formData.domain.trim()) {
      setValidationError('Domain is required');
      return;
    }
    
    // If we're creating a new concept, generate a new unique ID
    let conceptToSave = { ...formData };
    if (!concept) {
      conceptToSave.id = `concept-${Date.now()}`;
      conceptToSave.created_at = new Date();
    }
    
    conceptToSave.updated_at = new Date();
    
    onSave(conceptToSave);
    setValidationError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-paper rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-secondary/20">
          <h3 className="text-xl font-semibold">
            {concept ? `Edit Concept: ${concept.name}` : 'Create New Concept'}
          </h3>
        </div>
        
        <div className="border-b border-secondary/20">
          <div className="flex">
            <button
              className={`px-4 py-3 text-sm font-medium ${tab === 'basic' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
              onClick={() => setTab('basic')}
            >
              Basic Information
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${tab === 'attributes' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
              onClick={() => setTab('attributes')}
            >
              Attributes ({formData.attributes?.length || 0})
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${tab === 'relationships' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
              onClick={() => setTab('relationships')}
            >
              Relationships ({formData.relationships?.length || 0})
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {validationError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-md">
                {validationError}
              </div>
            )}
            
            {tab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Concept Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Customer, Product, Order"
                    className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what this concept represents"
                    rows={3}
                    className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Domain*</label>
                    <select
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                    >
                      <option value="">Select domain</option>
                      <option value="business">Business</option>
                      <option value="finance">Finance</option>
                      <option value="hr">Human Resources</option>
                      <option value="inventory">Inventory</option>
                      <option value="experience">Customer Experience</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                    >
                      <option value="core">Core</option>
                      <option value="supporting">Supporting</option>
                      <option value="transactional">Transactional</option>
                      <option value="analytical">Analytical</option>
                      <option value="customer">Customer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {tab === 'attributes' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Manage Attributes</h4>
                  <Button variant="secondary" size="sm">+ Add Attribute</Button>
                </div>
                
                {formData.attributes && formData.attributes.length > 0 ? (
                  <div className="space-y-2">
                    {formData.attributes.map((attr, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border border-secondary/20 rounded-md">
                        <div>
                          <div className="font-medium">{attr.name}</div>
                          <div className="text-xs text-text-secondary">{attr.data_type}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button type="button" className="text-xs text-blue-500">Edit</button>
                          <button type="button" className="text-xs text-red-500">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-secondary/20 rounded-md">
                    <p className="text-text-secondary">No attributes defined yet.</p>
                    <p className="text-sm text-text-secondary mt-1">
                      Add attributes like id, name, date, etc.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {tab === 'relationships' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Manage Relationships</h4>
                  <Button variant="secondary" size="sm">+ Add Relationship</Button>
                </div>
                
                {formData.relationships && formData.relationships.length > 0 ? (
                  <div className="space-y-2">
                    {formData.relationships.map((rel, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border border-secondary/20 rounded-md">
                        <div>
                          <div className="font-medium">{rel.target_concept_name}</div>
                          <div className="text-xs text-text-secondary">
                            {rel.relation_type} ({rel.cardinality})
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button type="button" className="text-xs text-blue-500">Edit</button>
                          <button type="button" className="text-xs text-red-500">Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-secondary/20 rounded-md">
                    <p className="text-text-secondary">No relationships defined yet.</p>
                    <p className="text-sm text-text-secondary mt-1">
                      Add relationships to connect this concept with others.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-secondary/20 flex justify-between">
            <div>
              {tab !== 'basic' && (
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setTab(tab === 'attributes' ? 'basic' : 'attributes')}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              
              {tab === 'relationships' ? (
                <Button type="submit" variant="primary">
                  {concept ? 'Update Concept' : 'Create Concept'}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={() => setTab(tab === 'basic' ? 'attributes' : 'relationships')}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConceptEditor; 