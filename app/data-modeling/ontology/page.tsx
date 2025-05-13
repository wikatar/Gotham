'use client'

import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useMission } from '../../lib/missionContext'

// Exempeldata för entiteter och relationer
const sampleEntities = [
  { 
    id: 'entity1', 
    name: 'Customer', 
    description: 'End user that purchases products or services',
    attributes: [
      { name: 'id', type: 'string', isPrimary: true },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'segment', type: 'string' },
      { name: 'lifetime_value', type: 'number' }
    ],
    color: '#4A90E2'
  },
  { 
    id: 'entity2', 
    name: 'Order', 
    description: 'Transaction made by a customer',
    attributes: [
      { name: 'id', type: 'string', isPrimary: true },
      { name: 'customer_id', type: 'string', isForeign: true },
      { name: 'date', type: 'date' },
      { name: 'total', type: 'number' },
      { name: 'status', type: 'string' }
    ],
    color: '#D0021B'
  },
  { 
    id: 'entity3', 
    name: 'Product', 
    description: 'Item that can be purchased',
    attributes: [
      { name: 'id', type: 'string', isPrimary: true },
      { name: 'name', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'inventory_count', type: 'number' }
    ],
    color: '#7ED321'
  },
  { 
    id: 'entity4', 
    name: 'Campaign', 
    description: 'Marketing initiative',
    attributes: [
      { name: 'id', type: 'string', isPrimary: true },
      { name: 'name', type: 'string' },
      { name: 'start_date', type: 'date' },
      { name: 'end_date', type: 'date' },
      { name: 'budget', type: 'number' },
      { name: 'status', type: 'string' }
    ],
    color: '#F5A623'
  }
];

const sampleRelationships = [
  { 
    id: 'rel1', 
    sourceId: 'entity1', 
    targetId: 'entity2', 
    name: 'places', 
    cardinality: 'one-to-many',
    description: 'A customer places multiple orders'
  },
  { 
    id: 'rel2', 
    sourceId: 'entity2', 
    targetId: 'entity3', 
    name: 'contains', 
    cardinality: 'many-to-many',
    description: 'An order contains multiple products'
  },
  { 
    id: 'rel3', 
    sourceId: 'entity4', 
    targetId: 'entity3', 
    name: 'promotes', 
    cardinality: 'many-to-many',
    description: 'A campaign promotes multiple products'
  },
  { 
    id: 'rel4', 
    sourceId: 'entity1', 
    targetId: 'entity4', 
    name: 'targets', 
    cardinality: 'many-to-many',
    description: 'A campaign targets multiple customers'
  }
];

// Komponent för att lista entiteter
function EntityList({ entities, onAdd, onEdit, onSelect, activeEntityId }) {
  return (
    <Card title="Entities" className="h-full">
      <div className="mb-4">
        <div className="text-sm text-text-secondary mb-2">
          Define the core concepts in your data model.
        </div>
        <Button 
          onClick={onAdd} 
          className="w-full"
        >
          Add New Entity
        </Button>
      </div>
      
      <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
        {entities.map(entity => (
          <div 
            key={entity.id}
            onClick={() => onSelect(entity.id)}
            className={`p-3 rounded-md cursor-pointer border transition-colors ${
              activeEntityId === entity.id 
                ? 'border-accent bg-primary/50' 
                : 'border-secondary/20 hover:bg-secondary/10'
            }`}
            style={{ borderLeft: `4px solid ${entity.color}` }}
          >
            <div className="font-medium">{entity.name}</div>
            <div className="text-sm text-text-secondary line-clamp-2 mb-1">
              {entity.description}
            </div>
            <div className="text-xs text-text-secondary">
              {entity.attributes?.length || 0} attributes
            </div>
            <div className="flex justify-end mt-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(entity.id);
                }}
                className="text-xs px-2 py-1 bg-secondary/10 hover:bg-secondary/20 rounded"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Komponent för att visa och redigera entitet
function EntityDetails({ entity, onUpdate, onClose, relationships }) {
  const [editedEntity, setEditedEntity] = useState({...entity});
  const [activeTab, setActiveTab] = useState('details');
  
  // Beräkna relationer för denna entitet
  const entityRelationships = relationships.filter(
    rel => rel.sourceId === entity.id || rel.targetId === entity.id
  );
  
  if (!entity) return null;
  
  return (
    <Card title={`Entity: ${entity.name}`} className="h-full relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded hover:bg-secondary/20"
      >
        ✕
      </button>
      
      <div className="border-b border-secondary/20 mb-4">
        <nav className="flex space-x-4">
          {['details', 'attributes', 'relationships'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text"
              value={editedEntity.name}
              onChange={(e) => setEditedEntity({...editedEntity, name: e.target.value})}
              className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              value={editedEntity.description}
              onChange={(e) => setEditedEntity({...editedEntity, description: e.target.value})}
              className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex items-center space-x-2">
              <input 
                type="color"
                value={editedEntity.color}
                onChange={(e) => setEditedEntity({...editedEntity, color: e.target.value})}
                className="w-10 h-10 rounded border border-secondary/40"
              />
              <span className="text-sm text-text-secondary">{editedEntity.color}</span>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onUpdate(editedEntity)}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === 'attributes' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm font-medium">Entity Attributes</div>
            <button className="text-xs px-2 py-1 bg-secondary/10 hover:bg-secondary/20 rounded">
              Add Attribute
            </button>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-secondary/20">
            <table className="w-full text-sm">
              <thead className="bg-secondary/10">
                <tr>
                  <th className="py-2 px-3 text-left font-medium">Name</th>
                  <th className="py-2 px-3 text-left font-medium">Type</th>
                  <th className="py-2 px-3 text-left font-medium">Flags</th>
                  <th className="py-2 px-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entity.attributes.map((attr, index) => (
                  <tr key={index} className="border-t border-secondary/10">
                    <td className="py-2 px-3">{attr.name}</td>
                    <td className="py-2 px-3">{attr.type}</td>
                    <td className="py-2 px-3">
                      {attr.isPrimary && (
                        <span className="bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded-full text-xs mr-1">
                          Primary
                        </span>
                      )}
                      {attr.isForeign && (
                        <span className="bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                          Foreign Key
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <button className="text-xs px-2 py-1 bg-secondary/10 hover:bg-secondary/20 rounded">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'relationships' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm font-medium">Entity Relationships</div>
            <button className="text-xs px-2 py-1 bg-secondary/10 hover:bg-secondary/20 rounded">
              Add Relationship
            </button>
          </div>
          
          {entityRelationships.length > 0 ? (
            <div className="space-y-3">
              {entityRelationships.map(rel => {
                const isSource = rel.sourceId === entity.id;
                const otherEntityId = isSource ? rel.targetId : rel.sourceId;
                const otherEntity = sampleEntities.find(e => e.id === otherEntityId);
                
                return (
                  <div key={rel.id} className="p-3 border border-secondary/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="font-medium text-sm">
                        {isSource ? (
                          <>
                            <span>This entity</span>
                            <span className="mx-2 text-accent">{rel.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-secondary/20" style={{ color: otherEntity?.color }}>
                              {otherEntity?.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 rounded-full bg-secondary/20" style={{ color: otherEntity?.color }}>
                              {otherEntity?.name}
                            </span>
                            <span className="mx-2 text-accent">{rel.name}</span>
                            <span>this entity</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {rel.description} • {rel.cardinality}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              No relationships defined for this entity yet.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Huvudkomponent för Ontology Builder-sidan
export default function OntologyBuilderPage() {
  const { currentMission } = useMission();
  const [entities, setEntities] = useState(sampleEntities);
  const [relationships, setRelationships] = useState(sampleRelationships);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const selectedEntity = entities.find(e => e.id === selectedEntityId);
  
  const handleAddEntity = () => {
    // Implementera logik för att lägga till ny entitet
    setShowCreateModal(true);
  };
  
  const handleEditEntity = (entityId) => {
    setSelectedEntityId(entityId);
  };
  
  const handleUpdateEntity = (updatedEntity) => {
    setEntities(entities.map(e => 
      e.id === updatedEntity.id ? updatedEntity : e
    ));
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Ontology Builder</h1>
        <p className="text-text-secondary">Define the semantic layer for your data model</p>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <EntityList 
            entities={entities}
            onAdd={handleAddEntity}
            onEdit={handleEditEntity}
            onSelect={setSelectedEntityId}
            activeEntityId={selectedEntityId}
          />
        </div>
        
        <div className="col-span-8">
          {selectedEntity ? (
            <EntityDetails 
              entity={selectedEntity}
              onUpdate={handleUpdateEntity}
              onClose={() => setSelectedEntityId(null)}
              relationships={relationships}
            />
          ) : (
            <div className="bg-background-paper rounded-lg p-8 border border-secondary/20 h-full flex flex-col items-center justify-center">
              <div className="text-2xl mb-4 text-text-secondary">🧩</div>
              <div className="text-lg font-medium mb-2">Ontology Visualization</div>
              <p className="text-text-secondary text-center mb-6 max-w-md">
                Select an entity to view or edit its details, or create a new entity to build your semantic data model.
              </p>
              <Button onClick={handleAddEntity}>Create New Entity</Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Information panel om semantiska lager */}
      <div className="mt-6 bg-secondary/5 rounded-lg p-4 border border-secondary/10">
        <h3 className="font-medium mb-2">About Semantic Layer</h3>
        <p className="text-sm text-text-secondary mb-3">
          The semantic layer translates raw data into business concepts that your team understands.
          By defining entities and their relationships, you create a common language for your data that can be used across:
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-background-paper rounded-md border border-secondary/10">
            <div className="font-medium mb-1">AI & Machine Learning</div>
            <div className="text-text-secondary">Models can understand and reference your business concepts</div>
          </div>
          <div className="p-3 bg-background-paper rounded-md border border-secondary/10">
            <div className="font-medium mb-1">Dashboards & Reports</div>
            <div className="text-text-secondary">Consistent naming and relationships across visualizations</div>
          </div>
          <div className="p-3 bg-background-paper rounded-md border border-secondary/10">
            <div className="font-medium mb-1">Data Governance</div>
            <div className="text-text-secondary">Clear definitions for compliance and documentation</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
