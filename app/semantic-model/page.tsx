'use client'

import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useMission } from '../lib/missionContext'

// Sample concepts for development
const SAMPLE_CONCEPTS = [
  {
    id: "concept-001",
    name: "Customer",
    description: "A person or organization that purchases products or services",
    category: "core",
    domain: "business",
    attributes: [
      { 
        name: "customer_id", 
        description: "Unique identifier for the customer", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "name", 
        description: "Full name of the customer", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "email", 
        description: "Email address", 
        data_type: "string",
        is_required: false 
      },
      { 
        name: "registration_date", 
        description: "When the customer was created", 
        data_type: "date",
        is_required: true 
      },
      { 
        name: "lifetime_value", 
        description: "Total monetary value of customer", 
        data_type: "number",
        is_required: false 
      },
    ],
    relationships: [
      {
        target_concept_id: "concept-002",
        target_concept_name: "Order",
        relation_type: "has many",
        is_bidirectional: true,
        cardinality: "1:n"
      },
      {
        target_concept_id: "concept-003",
        target_concept_name: "Feedback",
        relation_type: "provides",
        is_bidirectional: true,
        cardinality: "1:n"
      }
    ],
    created_at: new Date(Date.now() - 86400000 * 30),
    updated_at: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: "concept-002",
    name: "Order",
    description: "A transaction representing a purchase",
    category: "core",
    domain: "business",
    attributes: [
      { 
        name: "order_id", 
        description: "Unique identifier for the order", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "customer_id", 
        description: "Foreign key to the customer", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "order_date", 
        description: "When the order was placed", 
        data_type: "date",
        is_required: true 
      },
      { 
        name: "total_amount", 
        description: "Total monetary value of the order", 
        data_type: "number",
        is_required: true
      },
      { 
        name: "status", 
        description: "Current status of the order", 
        data_type: "enum",
        is_required: true,
        validation_rules: {
          allowed_values: ["pending", "processing", "shipped", "delivered", "cancelled"]
        }
      },
    ],
    relationships: [
      {
        target_concept_id: "concept-001",
        target_concept_name: "Customer",
        relation_type: "belongs to",
        is_bidirectional: true,
        cardinality: "n:1"
      },
      {
        target_concept_id: "concept-004",
        target_concept_name: "Product",
        relation_type: "contains",
        is_bidirectional: true,
        cardinality: "n:n"
      }
    ],
    created_at: new Date(Date.now() - 86400000 * 30),
    updated_at: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "concept-003",
    name: "Feedback",
    description: "Customer sentiment and comments",
    category: "customer",
    domain: "experience",
    attributes: [
      { 
        name: "feedback_id", 
        description: "Unique identifier for the feedback", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "customer_id", 
        description: "Foreign key to the customer", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "rating", 
        description: "Numerical rating", 
        data_type: "number",
        is_required: true,
        validation_rules: {
          min: 1,
          max: 5
        }
      },
      { 
        name: "comments", 
        description: "Text feedback", 
        data_type: "text",
        is_required: false 
      },
      { 
        name: "submitted_date", 
        description: "When the feedback was submitted", 
        data_type: "date",
        is_required: true 
      },
    ],
    relationships: [
      {
        target_concept_id: "concept-001",
        target_concept_name: "Customer",
        relation_type: "provided by",
        is_bidirectional: true,
        cardinality: "n:1"
      }
    ],
    created_at: new Date(Date.now() - 86400000 * 20),
    updated_at: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: "concept-004",
    name: "Product",
    description: "Item or service offered for sale",
    category: "core",
    domain: "inventory",
    attributes: [
      { 
        name: "product_id", 
        description: "Unique identifier for the product", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "name", 
        description: "Name of the product", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "price", 
        description: "Current price", 
        data_type: "number",
        is_required: true 
      },
      { 
        name: "description", 
        description: "Detailed product description", 
        data_type: "text",
        is_required: false 
      },
      { 
        name: "inventory_count", 
        description: "Current inventory level", 
        data_type: "number",
        is_required: true 
      },
    ],
    relationships: [
      {
        target_concept_id: "concept-002",
        target_concept_name: "Order",
        relation_type: "included in",
        is_bidirectional: true,
        cardinality: "n:n"
      }
    ],
    created_at: new Date(Date.now() - 86400000 * 30),
    updated_at: new Date(Date.now() - 86400000 * 10),
  },
  {
    id: "concept-005",
    name: "Employee",
    description: "A person who works for the company",
    category: "core",
    domain: "hr",
    attributes: [
      { 
        name: "employee_id", 
        description: "Unique identifier for the employee", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "name", 
        description: "Full name of the employee", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "department", 
        description: "Department they work in", 
        data_type: "string",
        is_required: true 
      },
      { 
        name: "hire_date", 
        description: "When they were hired", 
        data_type: "date",
        is_required: true 
      },
      { 
        name: "salary", 
        description: "Current salary", 
        data_type: "number",
        is_required: true 
      },
    ],
    relationships: [],
    created_at: new Date(Date.now() - 86400000 * 15),
    updated_at: new Date(Date.now() - 86400000 * 15),
  }
];

export default function SemanticModelPage() {
  const [concepts, setConcepts] = useState(SAMPLE_CONCEPTS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState(null);
  
  // Filter concepts based on active filter and search query
  const filteredConcepts = concepts.filter(concept => {
    // Apply domain filter
    if (activeFilter !== 'all') {
      if (concept.domain !== activeFilter && concept.category !== activeFilter) return false;
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return concept.name.toLowerCase().includes(query) || 
             concept.description.toLowerCase().includes(query) ||
             concept.domain.toLowerCase().includes(query) ||
             concept.category.toLowerCase().includes(query);
    }
    
    return true;
  });
  
  // Get unique domains and categories
  const domains = ['all', ...new Set([...concepts.map(concept => concept.domain), ...concepts.map(concept => concept.category)])];
  
  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Semantic Model</h1>
        <p className="text-text-secondary">Build and manage your business ontology</p>
      </div>
      
      {/* Control Panel */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {domains.map(domain => (
            <Button
              key={domain}
              variant={activeFilter === domain ? 'primary' : 'secondary'}
              onClick={() => setActiveFilter(domain)}
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
          >
            Add Concept
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Concepts" className="flex flex-col">
          <div className="text-3xl font-bold">{concepts.length}</div>
          <div className="text-text-secondary text-sm">Building blocks of your data model</div>
        </Card>
        
        <Card title="Core Concepts" className="flex flex-col">
          <div className="text-3xl font-bold text-blue-500">
            {concepts.filter(c => c.category === 'core').length}
          </div>
          <div className="text-text-secondary text-sm">Fundamental business entities</div>
        </Card>
        
        <Card title="Relationships" className="flex flex-col">
          <div className="text-3xl font-bold text-green-500">
            {concepts.reduce((sum, concept) => sum + (concept.relationships?.length || 0), 0)}
          </div>
          <div className="text-text-secondary text-sm">Connections between concepts</div>
        </Card>
        
        <Card title="Attributes" className="flex flex-col">
          <div className="text-3xl font-bold text-purple-500">
            {concepts.reduce((sum, concept) => sum + (concept.attributes?.length || 0), 0)}
          </div>
          <div className="text-text-secondary text-sm">Properties across all concepts</div>
        </Card>
      </div>
      
      {/* Main View with Concept List and Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Concept List */}
        <div className="lg:col-span-1">
          <Card title="Concepts" className="h-[calc(100vh-400px)] overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-grow">
              {filteredConcepts.length > 0 ? (
                <ul className="divide-y divide-secondary/10">
                  {filteredConcepts.map(concept => (
                    <li 
                      key={concept.id}
                      className={`p-4 hover:bg-background-elevated cursor-pointer ${
                        selectedConcept?.id === concept.id ? 'bg-background-elevated border-l-4 border-primary' : ''
                      }`}
                      onClick={() => setSelectedConcept(concept)}
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
        </div>
        
        {/* Concept Detail Panel */}
        <div className="lg:col-span-2">
          {selectedConcept ? (
            <Card title={selectedConcept.name} className="h-[calc(100vh-400px)] overflow-hidden flex flex-col">
              <div className="overflow-y-auto flex-grow p-2">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-text-secondary">{selectedConcept.description}</p>
                    <div className="flex items-center mt-2">
                      <div className="px-2 py-1 rounded-full bg-primary/10 text-xs capitalize mr-2">
                        {selectedConcept.domain}
                      </div>
                      <div className="px-2 py-1 rounded-full bg-secondary/10 text-xs capitalize">
                        {selectedConcept.category}
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
                    <h3 className="text-md font-medium mb-3 border-b border-secondary/20 pb-2">
                      Attributes ({selectedConcept.attributes?.length || 0})
                    </h3>
                    
                    {selectedConcept.attributes?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedConcept.attributes.map(attr => (
                          <div key={attr.name} className="border border-secondary/20 rounded-md p-3">
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
                    <h3 className="text-md font-medium mb-3 border-b border-secondary/20 pb-2">
                      Relationships ({selectedConcept.relationships?.length || 0})
                    </h3>
                    
                    {selectedConcept.relationships?.length > 0 ? (
                      <div className="space-y-3">
                        {selectedConcept.relationships.map((rel, index) => (
                          <div key={index} className="border border-secondary/20 rounded-md p-3">
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
                      <div>{formatDate(selectedConcept.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary">Last Updated</div>
                      <div>{formatDate(selectedConcept.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[calc(100vh-400px)] flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-xl font-medium mb-2">Select a Concept</h3>
                <p className="text-text-secondary mb-4">
                  Choose a concept from the list to view its details
                </p>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  variant="primary"
                >
                  Create New Concept
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Add Concept Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-paper rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary/20">
              <h3 className="text-xl font-semibold">Create New Concept</h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Concept Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Customer, Product, Order"
                      className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea 
                      placeholder="Describe what this concept represents"
                      className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                      rows={3}
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Domain</label>
                      <select 
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
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select 
                        className="w-full px-3 py-2 bg-background-elevated border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
                      >
                        <option value="">Select category</option>
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
                
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Attributes</label>
                      <Button variant="secondary" size="sm">+ Add</Button>
                    </div>
                    <div className="border border-secondary/20 rounded-md p-3 min-h-[120px] text-text-secondary text-sm">
                      No attributes defined. Click "Add" to define attributes like id, name, date, etc.
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Relationships</label>
                      <Button variant="secondary" size="sm">+ Add</Button>
                    </div>
                    <div className="border border-secondary/20 rounded-md p-3 min-h-[120px] text-text-secondary text-sm">
                      No relationships defined. Click "Add" to define how this concept relates to others.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-secondary/20 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowAddModal(false)}>
                Create Concept
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
} 