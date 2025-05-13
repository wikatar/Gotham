import React, { useState } from 'react';
import Button from '../ui/Button';
import { 
  DataSource, 
  DataSourceType, 
  DataSourceCategory,
  DataSourceFrequency
} from './types';

type DataSourceFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataSource: DataSource) => void;
  dataSource?: DataSource; // If editing existing dataSource
};

// Default empty data source for new entries
const DEFAULT_DATA_SOURCE: DataSource = {
  id: `ds-${Date.now()}`,
  name: '',
  description: '',
  type: 'api',
  category: 'operational',
  update_frequency: 'daily',
  status: 'inactive',
  is_strategic: false,
  health_history: [],
  metrics: {
    uptime_percentage: 100,
    average_response_time_ms: 0,
    error_count_last_30d: 0
  },
  last_checked: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  tags: []
};

const DataSourceForm: React.FC<DataSourceFormProps> = ({
  isOpen,
  onClose,
  onSave,
  dataSource
}) => {
  // Create a copy of the provided data source or use the default
  const [formData, setFormData] = useState<DataSource>(
    dataSource ? {...dataSource} : {...DEFAULT_DATA_SOURCE}
  );
  
  const [tagInput, setTagInput] = useState('');
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

  const handleTagAdd = () => {
    if (tagInput.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tagInput.trim()]
    }));
    
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setValidationError('Name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setValidationError('Description is required');
      return;
    }
    
    // Create a new ID if it's a new data source
    let dataSourceToSave: DataSource = { ...formData };
    
    if (!dataSource) {
      dataSourceToSave.id = `ds-${Date.now()}`;
      dataSourceToSave.created_at = new Date();
    }
    
    dataSourceToSave.updated_at = new Date();
    
    onSave(dataSourceToSave);
    setValidationError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-paper rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-secondary/20">
          <h3 className="text-xl font-semibold">
            {dataSource ? 'Edit Data Source' : 'Add New Data Source'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {validationError && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-md">
                {validationError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Customer API, Sales Database"
                    className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description*</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe this data source"
                    rows={3}
                    className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Type*</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                    >
                      <option value="api">API</option>
                      <option value="database">Database</option>
                      <option value="file">File</option>
                      <option value="stream">Stream</option>
                      <option value="webhook">Webhook</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Category*</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                    >
                      <option value="core">Core</option>
                      <option value="operational">Operational</option>
                      <option value="analytical">Analytical</option>
                      <option value="external">External</option>
                      <option value="internal">Internal</option>
                      <option value="customer">Customer</option>
                      <option value="financial">Financial</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url || ''}
                    onChange={handleChange}
                    placeholder="e.g. https://api.example.com/data"
                    className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Update Frequency*</label>
                  <select
                    name="update_frequency"
                    value={formData.update_frequency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="on-demand">On-demand</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Owner</label>
                  <input
                    type="text"
                    name="owner"
                    value={formData.owner || ''}
                    onChange={handleChange}
                    placeholder="e.g. Data Team, John Smith"
                    className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="is_strategic"
                      name="is_strategic"
                      checked={formData.is_strategic}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor="is_strategic" className="text-sm font-medium">
                      Mark as Strategic Data Source
                    </label>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Strategic data sources are critical for business operations and receive priority monitoring.
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-grow px-3 py-2 bg-background-elevated border border-secondary/30 rounded-l-md focus:outline-none focus:border-primary"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="px-3 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center bg-background-elevated px-2 py-1 rounded-md text-sm">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1 text-text-secondary hover:text-red-500"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-secondary/20 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {dataSource ? 'Update Data Source' : 'Add Data Source'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataSourceForm; 