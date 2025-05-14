'use client';

import { useState, useEffect } from 'react';
import { SAMPLE_AGENT_RECOMMENDATIONS } from '../agent/sampleData';
import { AgentRecommendation } from '../agent/types';
import RecommendationCard from './RecommendationCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Link from 'next/link';

interface AiRecommendationTabProps {
  missionId: string;
}

export default function AiRecommendationTab({ missionId }: AiRecommendationTabProps) {
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'accepted' | 'implemented' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load recommendations for this mission
  useEffect(() => {
    // In a real app, fetch from API instead of filtering sample data
    setIsLoading(true);
    
    setTimeout(() => {
      const missionRecommendations = SAMPLE_AGENT_RECOMMENDATIONS.filter(
        rec => rec.missionId === missionId
      );
      setRecommendations(missionRecommendations);
      setIsLoading(false);
    }, 500);
  }, [missionId]);

  // Filter recommendations
  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.status === filter);

  // Handle accepting a recommendation
  const handleAcceptRecommendation = (id: string) => {
    setRecommendations(prevRecs => 
      prevRecs.map(rec => 
        rec.id === id ? { ...rec, status: 'accepted' as const } : rec
      )
    );
  };

  // Handle rejecting a recommendation
  const handleRejectRecommendation = (id: string) => {
    setRecommendations(prevRecs => 
      prevRecs.map(rec => 
        rec.id === id ? { ...rec, status: 'rejected' as const } : rec
      )
    );
  };

  // Handle implementing a recommendation
  const handleImplementRecommendation = (id: string) => {
    setRecommendations(prevRecs => 
      prevRecs.map(rec => 
        rec.id === id ? { ...rec, status: 'implemented' as const } : rec
      )
    );
  };

  // Count recommendations by status
  const counts = {
    all: recommendations.length,
    new: recommendations.filter(r => r.status === 'new').length,
    accepted: recommendations.filter(r => r.status === 'accepted').length,
    implemented: recommendations.filter(r => r.status === 'implemented').length,
    rejected: recommendations.filter(r => r.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-5xl mb-4">🤖</div>
        <h3 className="text-xl font-medium mb-2">No AI Recommendations Yet</h3>
        <p className="text-text-secondary mb-4">
          Agents are analyzing this mission's data. Recommendations will appear here once generated.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium">AI Recommendations</h2>
          <p className="text-text-secondary">Insights and suggestions from our AI agents</p>
        </div>
        <Link href="/missions/recommendations">
          <Button variant="secondary" size="sm">View All Recommendations</Button>
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={filter === 'all' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </Button>
        <Button 
          variant={filter === 'new' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('new')}
        >
          New ({counts.new})
        </Button>
        <Button 
          variant={filter === 'accepted' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('accepted')}
        >
          Accepted ({counts.accepted})
        </Button>
        <Button 
          variant={filter === 'implemented' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('implemented')}
        >
          Implemented ({counts.implemented})
        </Button>
        <Button 
          variant={filter === 'rejected' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          Rejected ({counts.rejected})
        </Button>
      </div>

      {/* Recommendations */}
      <div>
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(recommendation => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onAccept={handleAcceptRecommendation}
              onReject={handleRejectRecommendation}
              onImplement={handleImplementRecommendation}
            />
          ))
        ) : (
          <Card className="p-6 text-center">
            <p className="text-text-secondary">
              No recommendations match the selected filter.
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-2"
              onClick={() => setFilter('all')}
            >
              Show All Recommendations
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
} 