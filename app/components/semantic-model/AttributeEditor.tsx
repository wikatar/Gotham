import React, { useState } from 'react';
import Button from '../ui/Button';
import { Attribute } from './types';

type AttributeEditorProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attribute: Attribute) => void;
  attribute?: Attribute; // If editing existing attribute
};

const DEFAULT_ATTRIBUTE: Attribute = {
  name: '',
  description: '',
  data_type: 'string',
  is_required: false,
};

const AttributeEditor: React.FC<AttributeEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  attribute,
}) => {
  const [formData, setFormData] = useState<Attribute>(attribute || DEFAULT_ATTRIBUTE);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setValidationError('Attribute name is required');
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
            {attribute ? 'Edit Attribute' : 'Add Attribute'}
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
              <label className="block text-sm font-medium mb-1">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. customer_id, price, email"
                className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this attribute"
                rows={2}
                className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Data Type*</label>
                <select
                  name="data_type"
                  value={formData.data_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                  <option value="enum">Enum</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                  <option value="text">Text</option>
                </select>
              </div>
              
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="is_required"
                  name="is_required"
                  checked={formData.is_required}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="is_required" className="text-sm font-medium">
                  Required Field
                </label>
              </div>
            </div>
            
            {formData.data_type === 'enum' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Enum Values (comma separated)</label>
                <input
                  type="text"
                  name="enum_values"
                  placeholder="e.g. pending, active, completed"
                  className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-secondary/20 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Attribute
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttributeEditor; 