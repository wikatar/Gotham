'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import RecommendationCard from '../../components/missions/RecommendationCard';
import { 
  SAMPLE_AGENT_RECOMMENDATIONS, 
  SAMPLE_AGENTS 
} from '../../components/agent/sampleData';
import { AgentRecommendation } from '../../components/agent/types';
import { SAMPLE_ENHANCED_MISSIONS } from '../../components/missions/sampleData';
import Link from 'next/link';

export default function MissionRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>(SAMPLE_AGENT_RECOMMENDATIONS);
  const [filteredRecommendations, setFilteredRecommendations] = useState<AgentRecommendation[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter recommendations based on selected filters
  useEffect(() => {
    let filtered = [...recommendations];
    
    // Filter by mission
    if (selectedMission !== 'all') {
      filtered = filtered.filter(rec => rec.missionId === selectedMission);
    }
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(rec => rec.type === selectedType);
    }
    
    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(rec => rec.priority === selectedPriority);
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(rec => rec.status === selectedStatus);
    }
    
    setFilteredRecommendations(filtered);
  }, [recommendations, selectedMission, selectedType, selectedPriority, selectedStatus]);

  // Handle accepting a recommendation
  const handleAcceptRecommendation = (id: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedRecommendations = recommendations.map(rec => 
        rec.id === id ? { ...rec, status: 'accepted' as const } : rec
      );
      
      setRecommendations(updatedRecommendations);
      setIsLoading(false);
    }, 500);
  };

  // Handle rejecting a recommendation
  const handleRejectRecommendation = (id: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedRecommendations = recommendations.map(rec => 
        rec.id === id ? { ...rec, status: 'rejected' as const } : rec
      );
      
      setRecommendations(updatedRecommendations);
      setIsLoading(false);
    }, 500);
  };

  // Handle implementing a recommendation
  const handleImplementRecommendation = (id: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedRecommendations = recommendations.map(rec => 
        rec.id === id ? { ...rec, status: 'implemented' as const } : rec
      );
      
      setRecommendations(updatedRecommendations);
      setIsLoading(false);
    }, 800);
  };
  
  // Get mission name by ID
  const getMissionName = (id: string) => {
    const mission = SAMPLE_ENHANCED_MISSIONS.find(m => m.id === id);
    return mission ? mission.name : 'Unknown Mission';
  };
  
  // Get agent name by ID
  const getAgentName = (id: string) => {
    const agent = SAMPLE_AGENTS.find(a => a.id === id);
    return agent ? agent.name : 'Unknown Agent';
  };
  
  // Count recommendations by status
  const countByStatus = {
    new: recommendations.filter(r => r.status === 'new').length,
    accepted: recommendations.filter(r => r.status === 'accepted').length,
    implemented: recommendations.filter(r => r.status === 'implemented').length,
    rejected: recommendations.filter(r => r.status === 'rejected').length,
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">AI Recommendations</h1>
            <p className="text-text-secondary">AI-generated insights and recommended actions for your missions</p>
          </div>
          <Link href="/missions">
            <Button variant="secondary">Back to Missions</Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary">
          <div className="p-4">
            <div className="text-sm mb-1 opacity-80">New Recommendations</div>
            <div className="text-3xl font-bold">{countByStatus.new}</div>
          </div>
        </Card>
        
        <Card className="bg-success text-white">
          <div className="p-4">
            <div className="text-sm mb-1 opacity-80">Implemented</div>
            <div className="text-3xl font-bold">{countByStatus.implemented}</div>
          </div>
        </Card>
        
        <Card className="bg-warning text-white">
          <div className="p-4">
            <div className="text-sm mb-1 opacity-80">Accepted</div>
            <div className="text-3xl font-bold">{countByStatus.accepted}</div>
          </div>
        </Card>
        
        <Card className="bg-error text-white">
          <div className="p-4">
            <div className="text-sm mb-1 opacity-80">Rejected</div>
            <div className="text-3xl font-bold">{countByStatus.rejected}</div>
          </div>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-medium mb-4">Filter Recommendations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Mission Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Mission</label>
              <select
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={selectedMission}
                onChange={(e) => setSelectedMission(e.target.value)}
              >
                <option value="all">All Missions</option>
                {SAMPLE_ENHANCED_MISSIONS.map(mission => (
                  <option key={mission.id} value={mission.id}>
                    {mission.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="action">Action</option>
                <option value="insight">Insight</option>
                <option value="warning">Warning</option>
                <option value="opportunity">Opportunity</option>
              </select>
            </div>
            
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full px-3 py-2 bg-background-paper border border-secondary/30 rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="implemented">Implemented</option>
              </select>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Recommendations List */}
      <div className="mb-6">
        <h2 className="text-xl font-medium mb-4">
          {filteredRecommendations.length} Recommendations
        </h2>
        
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!isLoading && filteredRecommendations.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-medium mb-2">No Recommendations Found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your filters to see more recommendations.
            </p>
            <Button 
              variant="primary"
              onClick={() => {
                setSelectedMission('all');
                setSelectedType('all');
                setSelectedPriority('all');
                setSelectedStatus('all');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        )}
        
        {!isLoading && filteredRecommendations.map(recommendation => (
          <div key={recommendation.id} className="mb-6">
            <div className="mb-2 flex justify-between">
              <div>
                <div className="text-sm text-text-secondary">
                  Mission: <span className="font-medium">{getMissionName(recommendation.missionId)}</span>
                </div>
                <div className="text-sm text-text-secondary">
                  Generated by: <span className="font-medium">{getAgentName(recommendation.agentId)}</span>
                </div>
              </div>
            </div>
            
            <RecommendationCard
              recommendation={recommendation}
              onAccept={handleAcceptRecommendation}
              onReject={handleRejectRecommendation}
              onImplement={handleImplementRecommendation}
            />
          </div>
        ))}
      </div>
    </AppLayout>
  );
} 