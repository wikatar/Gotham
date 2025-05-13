'use client'

import { useState } from 'react'
import { useMission } from '../../lib/missionContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Exempeldata för mål
const sampleObjectives = [
  {
    id: 'obj1',
    title: 'Increase Customer Retention',
    description: 'Identify key factors affecting customer churn and implement strategies to improve retention.',
    priority: 'high',
    status: 'in-progress',
    progress: 65
  },
  {
    id: 'obj2',
    title: 'Optimize Marketing Spend',
    description: 'Analyze ROI across marketing channels and optimize budget allocation.',
    priority: 'medium',
    status: 'in-progress',
    progress: 40
  },
  {
    id: 'obj3',
    title: 'Forecast Q4 Sales',
    description: 'Develop predictive model for Q4 sales based on historical data and current trends.',
    priority: 'high',
    status: 'not-started',
    progress: 0
  }
];

function ObjectiveForm({ objective = null, onSave, onCancel }) {
  const [editedObjective, setEditedObjective] = useState(objective || {
    id: `obj-${Date.now()}`,
    title: '',
    description: '',
    priority: 'medium',
    status: 'not-started',
    progress: 0
  });
  
  const handleSave = () => {
    if (!editedObjective.title) return;
    onSave(editedObjective);
  };
  
  return (
    <div className="p-4 border border-secondary/20 rounded-md bg-secondary/5">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={editedObjective.title}
            onChange={(e) => setEditedObjective({...editedObjective, title: e.target.value})}
            className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            placeholder="Objective title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={editedObjective.description}
            onChange={(e) => setEditedObjective({...editedObjective, description: e.target.value})}
            className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            rows={3}
            placeholder="Describe this objective"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={editedObjective.priority}
              onChange={(e) => setEditedObjective({...editedObjective, priority: e.target.value})}
              className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editedObjective.status}
              onChange={(e) => setEditedObjective({...editedObjective, status: e.target.value})}
              className="w-full px-3 py-2 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Progress ({editedObjective.progress}%)</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={editedObjective.progress}
            onChange={(e) => setEditedObjective({...editedObjective, progress: parseInt(e.target.value)})}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            variant="secondary" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!editedObjective.title}
          >
            {objective ? 'Update' : 'Create'} Objective
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MissionObjectives() {
  const { currentMission } = useMission();
  const [objectives, setObjectives] = useState(sampleObjectives);
  const [editingObjectiveId, setEditingObjectiveId] = useState(null);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  
  const handleEditObjective = (objectiveId) => {
    setEditingObjectiveId(objectiveId);
    setIsAddingObjective(false);
  };
  
  const handleAddObjective = () => {
    setIsAddingObjective(true);
    setEditingObjectiveId(null);
  };
  
  const handleSaveObjective = (savedObjective) => {
    if (editingObjectiveId) {
      // Uppdatera befintligt mål
      setObjectives(objectives.map(obj => 
        obj.id === editingObjectiveId ? savedObjective : obj
      ));
      setEditingObjectiveId(null);
    } else {
      // Lägg till nytt mål
      setObjectives([...objectives, savedObjective]);
      setIsAddingObjective(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingObjectiveId(null);
    setIsAddingObjective(false);
  };
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'not-started': return 'Not Started';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500 text-green-600';
      case 'in-progress': return 'bg-blue-500 text-blue-600';
      case 'not-started': return 'bg-gray-400 text-gray-600';
      case 'blocked': return 'bg-red-500 text-red-600';
      default: return 'bg-gray-400 text-gray-600';
    }
  };
  
  return (
    <Card title="Mission Objectives" className="mb-6">
      <div className="mb-4">
        <div className="text-sm text-text-secondary">
          Define and track key objectives for this mission to ensure alignment with business goals.
        </div>
        <div className="mt-3 flex justify-end">
          {!isAddingObjective && (
            <Button onClick={handleAddObjective}>Add Objective</Button>
          )}
        </div>
      </div>
      
      {isAddingObjective && (
        <div className="mb-4">
          <ObjectiveForm onSave={handleSaveObjective} onCancel={handleCancelEdit} />
        </div>
      )}
      
      <div className="space-y-4">
        {objectives.map(objective => (
          <div key={objective.id}>
            {editingObjectiveId === objective.id ? (
              <ObjectiveForm 
                objective={objective} 
                onSave={handleSaveObjective} 
                onCancel={handleCancelEdit} 
              />
            ) : (
              <div className="p-4 border border-secondary/20 rounded-md hover:bg-secondary/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      {objective.priority === 'high' ? (
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                      ) : objective.priority === 'medium' ? (
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                      )}
                      <h3 className="font-medium">{objective.title}</h3>
                      <span 
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor(objective.status)}/20`}
                      >
                        {getStatusLabel(objective.status)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{objective.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditObjective(objective.id)}
                      className="px-2 py-1 text-xs bg-secondary/10 hover:bg-secondary/20 rounded"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <div>Progress</div>
                    <div>{objective.progress}%</div>
                  </div>
                  <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent"
                      style={{ width: `${objective.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

