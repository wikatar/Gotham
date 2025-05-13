'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useMission } from '../lib/missionContext'

// Import components
import ConceptList from '../components/semantic-model/ConceptList'
import ConceptDetail from '../components/semantic-model/ConceptDetail'
import StatisticsCards from '../components/semantic-model/StatisticsCards'
import ControlPanel from '../components/semantic-model/ControlPanel'
import AddConceptModal from '../components/semantic-model/AddConceptModal'
import { Concept } from '../components/semantic-model/types'

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
  const [concepts, setConcepts] = useState<Concept[]>(SAMPLE_CONCEPTS);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [editingConcept, setEditingConcept] = useState<Concept | undefined>(undefined);
  
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
  
  // Handlers
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleAddConcept = () => {
    setEditingConcept(undefined);
    setShowAddModal(true);
  };
  
  const handleEditConcept = (concept: Concept) => {
    setEditingConcept(concept);
    setShowAddModal(true);
  };
  
  const handleSaveConcept = (concept: Concept) => {
    // Check if we're editing an existing concept or adding a new one
    if (editingConcept) {
      // Update existing concept
      const updatedConcepts = concepts.map(c => 
        c.id === concept.id ? concept : c
      );
      setConcepts(updatedConcepts);
      
      // Update selected concept if needed
      if (selectedConcept?.id === concept.id) {
        setSelectedConcept(concept);
      }
    } else {
      // Add new concept
      setConcepts(prev => [...prev, concept]);
    }
    
    setShowAddModal(false);
    setEditingConcept(undefined);
  };

  const handleUpdateConcept = (updatedConcept: Concept) => {
    const updatedConcepts = concepts.map(concept => 
      concept.id === updatedConcept.id ? updatedConcept : concept
    );
    
    setConcepts(updatedConcepts);
    
    // Also update selected concept
    if (selectedConcept?.id === updatedConcept.id) {
      setSelectedConcept(updatedConcept);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Semantic Model</h1>
        <p className="text-text-secondary">Build and manage your business ontology</p>
      </div>
      
      {/* Control Panel */}
      <ControlPanel 
        domains={domains}
        activeFilter={activeFilter}
        searchQuery={searchQuery}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddConcept={handleAddConcept}
      />
      
      {/* Statistics Cards */}
      <StatisticsCards concepts={concepts} />
      
      {/* Main View with Concept List and Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Concept List */}
        <div className="lg:col-span-1">
          <ConceptList 
            concepts={filteredConcepts}
            selectedConcept={selectedConcept}
            onSelectConcept={setSelectedConcept}
          />
        </div>
        
        {/* Concept Detail Panel */}
        <div className="lg:col-span-2">
          <ConceptDetail 
            concept={selectedConcept} 
            onCreateConcept={handleAddConcept} 
            availableConcepts={concepts}
            onUpdateConcept={handleUpdateConcept}
          />
        </div>
      </div>
      
      {/* Add/Edit Concept Modal */}
      <AddConceptModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveConcept}
        editingConcept={editingConcept}
      />
    </AppLayout>
  )
} 