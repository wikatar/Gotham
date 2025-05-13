'use client'

import { useState } from 'react'
import { useMission } from '../../lib/missionContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Exempeldata för spårning
const initialCheckpoints = [
  {
    id: 'cp1',
    title: 'Mission Started',
    description: 'Initial data collection and requirements gathering',
    date: '2023-09-10T09:00:00Z',
    status: 'completed',
    artifacts: [
      { name: 'Requirements.pdf', url: '#', type: 'document' },
      { name: 'Kickoff Meeting Notes', url: '#', type: 'notes' }
    ]
  },
  {
    id: 'cp2',
    title: 'Data Integration',
    description: 'Connected primary data sources and created transformation pipelines',
    date: '2023-09-12T15:30:00Z',
    status: 'completed',
    artifacts: [
      { name: 'Data Sources Overview', url: '#', type: 'document' },
      { name: 'ETL Pipeline Config', url: '#', type: 'config' }
    ]
  },
  {
    id: 'cp3',
    title: 'Initial Analysis',
    description: 'First set of dashboards and insights delivered',
    date: '2023-09-15T11:45:00Z',
    status: 'in-progress',
    artifacts: [
      { name: 'Preliminary Dashboard', url: '#', type: 'dashboard' }
    ]
  },
  {
    id: 'cp4',
    title: 'AI Model Training',
    description: 'Train predictive models based on collected data',
    date: '2023-09-18T00:00:00Z',
    status: 'planned',
    artifacts: []
  },
  {
    id: 'cp5',
    title: 'Final Presentation',
    description: 'Present findings and recommendations',
    date: '2023-09-25T14:00:00Z',
    status: 'planned',
    artifacts: []
  }
];

function TimelineItem({ checkpoint, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCheckpoint, setEditedCheckpoint] = useState({...checkpoint});
  
  const statusColors = {
    'completed': { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-500' },
    'in-progress': { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500' },
    'planned': { bg: 'bg-gray-400', text: 'text-gray-600', border: 'border-gray-400' },
    'blocked': { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-500' },
  };
  
  const statusColor = statusColors[checkpoint.status] || statusColors.planned;
  
  const handleSave = () => {
    onUpdate(editedCheckpoint);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedCheckpoint({...checkpoint});
    setIsEditing(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className={`relative pl-8 pb-6 ${!isExpanded ? 'cursor-pointer' : ''}`}>
      {/* Vertical timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-secondary/30"></div>
      
      {/* Timeline node */}
      <div 
        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${statusColor.border} flex items-center justify-center`}
        style={{ backgroundColor: 'var(--background)' }}
      >
        {checkpoint.status === 'completed' && <span className="text-accent">✓</span>}
      </div>
      
      {/* Timeline content */}
      <div 
        className={`p-3 border border-secondary/20 rounded-md hover:bg-secondary/5 ${isEditing ? 'bg-secondary/5' : ''}`}
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div>
            {isEditing ? (
              <input 
                type="text" 
                value={editedCheckpoint.title}
                onChange={(e) => setEditedCheckpoint({...editedCheckpoint, title: e.target.value})}
                className="font-medium bg-background border border-secondary/40 rounded px-2 py-1 w-full"
              />
            ) : (
              <div className="font-medium">{checkpoint.title}</div>
            )}
            
            <div className="flex items-center mt-1 text-sm">
              <span className={`px-2 py-0.5 rounded-full ${statusColor.bg}/20 ${statusColor.text} text-xs mr-2`}>
                {checkpoint.status.charAt(0).toUpperCase() + checkpoint.status.slice(1)}
              </span>
              <span className="text-text-secondary">{formatDate(checkpoint.date)}</span>
            </div>
          </div>
          
          {!isEditing && (
            <div className="flex space-x-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setIsExpanded(true);
                }}
                className="text-xs px-2 py-1 bg-secondary/10 hover:bg-secondary/20 rounded"
              >
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs px-2 py-1 bg-secondary/10 hover:bg-secondary/20 rounded"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && (
          <div className="mt-3">
            {isEditing ? (
              <textarea 
                value={editedCheckpoint.description}
                onChange={(e) => setEditedCheckpoint({...editedCheckpoint, description: e.target.value})}
                className="text-sm bg-background border border-secondary/40 rounded px-2 py-1 w-full mb-3"
                rows={3}
              />
            ) : (
              <div className="text-sm text-text-secondary mb-3">{checkpoint.description}</div>
            )}
            
            {/* Artifacts section */}
            {checkpoint.artifacts && checkpoint.artifacts.length > 0 && (
              <div className="border-t border-secondary/10 pt-2 mt-2">
                <div className="text-xs font-medium mb-1">Related documents:</div>
                <div className="flex flex-wrap gap-2">
                  {checkpoint.artifacts.map((artifact, index) => (
                    <a 
                      key={index} 
                      href={artifact.url}
                      className="flex items-center text-xs px-2 py-1 rounded bg-secondary/10 hover:bg-secondary/20"
                    >
                      {artifact.type === 'document' && <span className="mr-1">📄</span>}
                      {artifact.type === 'notes' && <span className="mr-1">📝</span>}
                      {artifact.type === 'config' && <span className="mr-1">⚙️</span>}
                      {artifact.type === 'dashboard' && <span className="mr-1">📊</span>}
                      {artifact.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {isEditing && (
              <div className="flex justify-end mt-3 space-x-2">
                <button 
                  onClick={handleCancel} 
                  className="text-xs px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="text-xs px-3 py-1 bg-accent text-text-primary rounded"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AddCheckpointButton({ onAdd }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCheckpoint, setNewCheckpoint] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'planned',
    artifacts: []
  });
  
  const handleAdd = () => {
    if (!newCheckpoint.title) return;
    
    onAdd({
      ...newCheckpoint,
      id: `cp-${Date.now()}`,
      date: new Date(newCheckpoint.date).toISOString()
    });
    
    setNewCheckpoint({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'planned',
      artifacts: []
    });
    
    setIsAdding(false);
  };
  
  if (!isAdding) {
    return (
      <button 
        onClick={() => setIsAdding(true)}
        className="ml-8 flex items-center text-sm text-accent hover:text-accent-dark"
      >
        <span className="mr-2">+</span> Add Checkpoint
      </button>
    );
  }
  
  return (
    <div className="relative pl-8 pb-6">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-secondary/30"></div>
      <div 
        className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-accent flex items-center justify-center"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <span className="text-accent">+</span>
      </div>
      
      <div className="p-3 border border-secondary/20 rounded-md bg-secondary/5">
        <div className="space-y-3">
          <div>
            <label className="block text-xs mb-1">Title</label>
            <input 
              type="text" 
              value={newCheckpoint.title}
              onChange={(e) => setNewCheckpoint({...newCheckpoint, title: e.target.value})}
              className="w-full px-2 py-1 text-sm bg-background border border-secondary/40 rounded"
              placeholder="Checkpoint title"
            />
          </div>
          
          <div>
            <label className="block text-xs mb-1">Description</label>
            <textarea 
              value={newCheckpoint.description}
              onChange={(e) => setNewCheckpoint({...newCheckpoint, description: e.target.value})}
              className="w-full px-2 py-1 text-sm bg-background border border-secondary/40 rounded"
              placeholder="Describe this checkpoint"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Date</label>
              <input 
                type="date" 
                value={newCheckpoint.date}
                onChange={(e) => setNewCheckpoint({...newCheckpoint, date: e.target.value})}
                className="w-full px-2 py-1 text-sm bg-background border border-secondary/40 rounded"
              />
            </div>
            
            <div>
              <label className="block text-xs mb-1">Status</label>
              <select 
                value={newCheckpoint.status}
                onChange={(e) => setNewCheckpoint({...newCheckpoint, status: e.target.value})}
                className="w-full px-2 py-1 text-sm bg-background border border-secondary/40 rounded"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setIsAdding(false)} 
              className="text-xs px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd} 
              className="text-xs px-3 py-1 bg-accent text-text-primary rounded"
              disabled={!newCheckpoint.title}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MissionTimeline() {
  const { currentMission } = useMission();
  const [checkpoints, setCheckpoints] = useState(initialCheckpoints);
  
  const handleUpdateCheckpoint = (updatedCheckpoint) => {
    setCheckpoints(checkpoints.map(cp => 
      cp.id === updatedCheckpoint.id ? updatedCheckpoint : cp
    ));
  };
  
  const handleAddCheckpoint = (newCheckpoint) => {
    setCheckpoints([...checkpoints, newCheckpoint]);
  };
  
  return (
    <Card title="Mission Timeline" className="mb-6">
      <div className="mb-4">
        <div className="text-sm text-text-secondary">
          Track mission progress and key milestones to ensure visibility and alignment.
        </div>
      </div>
      
      <div className="my-6">
        {checkpoints.map(checkpoint => (
          <TimelineItem 
            key={checkpoint.id} 
            checkpoint={checkpoint} 
            onUpdate={handleUpdateCheckpoint} 
          />
        ))}
        
        <AddCheckpointButton onAdd={handleAddCheckpoint} />
      </div>
      
      <div className="flex justify-between mt-6">
        <div className="text-sm">
          <span className="text-accent font-medium">{checkpoints.filter(cp => cp.status === 'completed').length}</span>
          <span className="text-text-secondary"> of </span>
          <span className="text-text-primary">{checkpoints.length}</span>
          <span className="text-text-secondary"> checkpoints completed</span>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            Export Timeline
          </Button>
          <Button size="sm">
            View Calendar
          </Button>
        </div>
      </div>
    </Card>
  );
} 