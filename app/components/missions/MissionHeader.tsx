'use client';

import React from 'react';
import { EnhancedMission, MissionStatus, MissionPriority } from './types';
import Button from '../ui/Button';

// Status badge component
const StatusBadge: React.FC<{ status: MissionStatus }> = ({ status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = () => {
    switch(status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      case 'planning':
        return 'Planning';
      default:
        return status;
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusLabel()}
    </span>
  );
};

// Priority badge component
const PriorityBadge: React.FC<{ priority: MissionPriority }> = ({ priority }) => {
  const getPriorityColor = () => {
    switch(priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor()}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </span>
  );
};

type MissionHeaderProps = {
  mission: EnhancedMission;
  onEdit?: () => void;
  onShare?: () => void;
};

const MissionHeader: React.FC<MissionHeaderProps> = ({ 
  mission,
  onEdit,
  onShare
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return null;
    
    // Create consistent date format for both server and client
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  return (
    <div className="mb-6 bg-background-elevated rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={mission.status} />
            <PriorityBadge priority={mission.priority} />
            {mission.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-paper">
                {mission.category}
              </span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">{mission.name}</h1>
          {mission.description && (
            <p className="text-text-secondary mb-4">{mission.description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm">
            {mission.startDate && (
              <div>
                <div className="text-text-secondary text-xs">Start Date</div>
                <div>{formatDate(mission.startDate)}</div>
              </div>
            )}
            
            {mission.endDate && (
              <div>
                <div className="text-text-secondary text-xs">Target End Date</div>
                <div className={mission.endDate < new Date() && mission.status !== 'completed' ? 'text-red-500' : ''}>
                  {formatDate(mission.endDate)}
                </div>
              </div>
            )}
            
            {mission.owner && (
              <div>
                <div className="text-text-secondary text-xs">Owner</div>
                <div>{mission.owner}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Edit Mission
            </Button>
          )}
          
          {onShare && (
            <Button variant="primary" size="sm" onClick={onShare}>
              Share
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-1">
          <div>
            <span className="text-text-secondary">Overall Progress: </span>
            <span className="font-medium">{mission.progress}%</span>
          </div>
          <div className="text-text-secondary">
            {mission.objectives.filter(o => o.status === 'completed').length} / {mission.objectives.length} objectives completed
          </div>
        </div>
        
        <div className="w-full h-2 bg-background-paper rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${mission.progress}%` }}
          ></div>
        </div>
      </div>
      
      {mission.team.length > 0 && (
        <div className="mt-4">
          <div className="text-text-secondary text-xs mb-2">Team</div>
          <div className="flex flex-wrap gap-2">
            {mission.team.map(member => (
              <div key={member.id} className="flex items-center text-sm bg-background-paper rounded-full px-3 py-1">
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-6 h-6 rounded-full mr-2" 
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-secondary/30 mr-2"></div>
                )}
                <div>
                  <span className="font-medium">{member.name}</span>
                  {member.role && (
                    <span className="text-text-secondary text-xs ml-1">({member.role})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionHeader; 