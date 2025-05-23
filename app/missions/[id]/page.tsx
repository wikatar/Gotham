'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MissionHeader from '../../components/missions/MissionHeader';
import KpiCard from '../../components/missions/KpiCard';
import ObjectiveCard from '../../components/missions/ObjectiveCard';
import ActionItem from '../../components/missions/ActionItem';
import AiRecommendationTab from '../../components/missions/AiRecommendationTab';
import AssignedAgentsTab from '../../components/missions/AssignedAgentsTab';
import { CollaborationPanel } from '../../components/collaboration';
import { SAMPLE_ENHANCED_MISSIONS } from '../../components/missions/sampleData';
import { EnhancedMission, MissionAction } from '../../components/missions/types';
import Link from 'next/link';

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function MissionDetailPage() {
  const params = useParams();
  const [mission, setMission] = useState<EnhancedMission | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'objectives' | 'kpis' | 'actions' | 'recommendations' | 'agents' | 'collaboration'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Current user (in a real app, this would come from auth context)
  const currentUser = {
    id: 'current-user',
    name: 'Current User',
    email: 'user@gotham.se'
  }
  
  // Fetch mission data based on ID
  useEffect(() => {
    const missionId = params.id;
    
    // For demo purposes, just find from sample data
    const found = SAMPLE_ENHANCED_MISSIONS.find(m => m.id === missionId);
    
    // In real app, would fetch from API
    setTimeout(() => {
      setMission(found || null);
      setIsLoading(false);
    }, 500);
  }, [params.id]);
  
  // Handle action approvals
  const handleApproveAction = (actionId: string) => {
    if (!mission) return;
    
    const updatedActions = mission.actions.map(action => 
      action.id === actionId 
        ? { ...action, status: 'approved' as const } 
        : action
    );
    
    setMission({
      ...mission,
      actions: updatedActions
    });
  };
  
  // Handle action rejections
  const handleRejectAction = (actionId: string) => {
    if (!mission) return;
    
    const updatedActions = mission.actions.map(action => 
      action.id === actionId 
        ? { ...action, status: 'rejected' as const } 
        : action
    );
    
    setMission({
      ...mission,
      actions: updatedActions
    });
  };
  
  // Handle action completion
  const handleCompleteAction = (actionId: string) => {
    if (!mission) return;
    
    const updatedActions = mission.actions.map(action => 
      action.id === actionId 
        ? { ...action, status: 'completed' as const, completedAt: new Date() } 
        : action
    );
    
    setMission({
      ...mission,
      actions: updatedActions
    });
  };
  
  // If loading or mission not found
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading mission data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!mission) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-medium mb-2">Mission Not Found</h2>
            <p className="text-text-secondary mb-4">The mission you're looking for doesn't exist or has been deleted.</p>
            <Link href="/missions">
              <Button variant="primary">Back to Missions</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Group actions by status for better organization
  const pendingActions = mission.actions.filter(a => a.status === 'pending');
  const approvedActions = mission.actions.filter(a => a.status === 'approved' && !a.completedAt);
  const completedRejectedActions = mission.actions.filter(a => 
    a.status === 'completed' || a.status === 'rejected'
  );
  
  return (
    <AppLayout>
      {/* Mission Header */}
      <MissionHeader 
        mission={mission} 
        onEdit={() => {}} 
        onShare={() => {}}
      />
      
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-secondary/20 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'overview' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'objectives' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('objectives')}
        >
          Objectives
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'kpis' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('kpis')}
        >
          KPIs
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'actions' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'recommendations' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('recommendations')}
        >
          AI Recommendations
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'agents' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('agents')}
        >
          Agents
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'collaboration' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('collaboration')}
        >
          Collaboration
        </button>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Top Level KPIs and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {mission.kpis.slice(0, 3).map(kpi => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Key Objectives */}
            <div className="md:col-span-2">
              <Card title="Key Objectives" className="h-full">
                <div className="space-y-4">
                  {mission.objectives.slice(0, 3).map(objective => (
                    <div key={objective.id} className="border-b border-secondary/10 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{objective.title}</h3>
                        <div className="text-xs">{objective.progress}% Complete</div>
                      </div>
                      <div className="w-full h-1.5 bg-background-elevated rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full ${
                            objective.status === 'completed' ? 'bg-green-500' :
                            objective.status === 'blocked' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`} 
                          style={{ width: `${objective.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-text-secondary">{objective.description}</p>
                    </div>
                  ))}
                  
                  {mission.objectives.length > 3 && (
                    <div className="text-center mt-2">
                      <button 
                        className="text-sm text-primary hover:text-primary/80"
                        onClick={() => setActiveTab('objectives')}
                      >
                        View all {mission.objectives.length} objectives
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            
            {/* Pending Actions */}
            <div>
              <Card title="Pending Actions" className="h-full">
                {pendingActions.length > 0 ? (
                  <div className="space-y-2">
                    {pendingActions.slice(0, 3).map(action => (
                      <div key={action.id} className="border-b border-secondary/10 last:border-0 pb-2 last:pb-0">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <div className="flex justify-between mt-1">
                          <div className="text-xs text-text-secondary">{action.assignedTo}</div>
                          {action.scheduledFor && (
                            <div className="text-xs">Due: {formatDate(new Date(action.scheduledFor))}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {pendingActions.length > 3 && (
                      <div className="text-center mt-2">
                        <button 
                          className="text-sm text-primary hover:text-primary/80"
                          onClick={() => setActiveTab('actions')}
                        >
                          View all {pendingActions.length} pending actions
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-text-secondary">
                    No pending actions
                  </div>
                )}
              </Card>
            </div>
          </div>
          
          {/* Data Sources */}
          <Card title="Data Sources" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mission.dataSources.map((source) => (
                <div key={source.id} className="p-3 border border-secondary/20 rounded-md">
                  <h3 className="font-medium">{source.name}</h3>
                  <div className="text-sm text-text-secondary mt-1">Type: {source.type}</div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Button variant="secondary" className="py-3">
              <div className="text-center">
                <div>Edit Mission</div>
              </div>
            </Button>
            
            <Button variant="secondary" className="py-3">
              <div className="text-center">
                <div>Add Objective</div>
              </div>
            </Button>
            
            <Button variant="secondary" className="py-3">
              <div className="text-center">
                <div>Add KPI</div>
              </div>
            </Button>
            
            <Button variant="secondary" className="py-3">
              <div className="text-center">
                <div>Create Action</div>
              </div>
            </Button>
          </div>
        </div>
      )}
      
      {/* Objectives Tab */}
      {activeTab === 'objectives' && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Objectives</h2>
            <Button variant="primary" size="sm">Add Objective</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {mission.objectives.map(objective => (
              <ObjectiveCard key={objective.id} objective={objective} />
            ))}
          </div>
          
          {mission.objectives.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-medium mb-2">No Objectives Yet</h3>
              <p className="text-text-secondary mb-4">
                Add objectives to track progress towards your mission goals.
              </p>
              <Button variant="primary">Add First Objective</Button>
            </Card>
          )}
        </div>
      )}
      
      {/* KPIs Tab */}
      {activeTab === 'kpis' && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
            <Button variant="primary" size="sm">Add KPI</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {mission.kpis.map(kpi => (
              <KpiCard key={kpi.id} kpi={kpi} />
            ))}
          </div>
          
          {mission.kpis.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-medium mb-2">No KPIs Defined</h3>
              <p className="text-text-secondary mb-4">
                Add KPIs to measure success and track progress.
              </p>
              <Button variant="primary">Add First KPI</Button>
            </Card>
          )}
        </div>
      )}
      
      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Actions</h2>
            <Button variant="primary" size="sm">Create Action</Button>
          </div>
          
          {pendingActions.length > 0 && (
            <Card title="Pending Approval" className="mb-6">
              {pendingActions.map(action => (
                <ActionItem 
                  key={action.id} 
                  action={action}
                  onApprove={handleApproveAction}
                  onReject={handleRejectAction}
                />
              ))}
            </Card>
          )}
          
          {approvedActions.length > 0 && (
            <Card title="In Progress" className="mb-6">
              {approvedActions.map(action => (
                <ActionItem 
                  key={action.id} 
                  action={action}
                  onComplete={handleCompleteAction}
                />
              ))}
            </Card>
          )}
          
          {completedRejectedActions.length > 0 && (
            <Card title="Completed & Rejected" className="mb-6">
              {completedRejectedActions.map(action => (
                <ActionItem 
                  key={action.id} 
                  action={action}
                />
              ))}
            </Card>
          )}
          
          {mission.actions.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-medium mb-2">No Actions Yet</h3>
              <p className="text-text-secondary mb-4">
                Create actions to implement your mission objectives.
              </p>
              <Button variant="primary">Create First Action</Button>
            </Card>
          )}
        </div>
      )}

      {/* AI Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <AiRecommendationTab missionId={mission.id} />
      )}

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <AssignedAgentsTab missionId={mission.id} />
      )}

      {/* Collaboration Tab */}
      {activeTab === 'collaboration' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Collaboration</h2>
            <p className="text-text-secondary mt-1">
              Collaborate with team members on this mission through comments and activity tracking.
            </p>
          </div>
          
          <CollaborationPanel 
            entityType="mission"
            entityId={mission.id}
            currentUser={currentUser}
          />
        </div>
      )}
    </AppLayout>
  );
} 