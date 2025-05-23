'use client'

import { useEffect } from 'react'
import { useMission } from '../../lib/missionContext'
import AppLayout from '../../components/layout/AppLayout'
import MissionObjectives from '../components/MissionObjectives'
import MissionTimeline from '../components/MissionTimeline'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Exempeldata för en mission
const sampleMission = {
  id: 'mission-1',
  name: 'Market Expansion Analysis',
  description: 'Analyze potential for expanding into European markets based on customer data, market trends, and competitor analysis.',
  created: '2023-09-01T10:00:00Z',
  updated: '2023-09-15T14:30:00Z',
  team: [
    { id: 'user1', name: 'John Smith', role: 'Lead Analyst', avatar: '/avatars/user1.png' },
    { id: 'user2', name: 'Sarah Johnson', role: 'Data Scientist', avatar: '/avatars/user2.png' },
    { id: 'user3', name: 'Michael Chen', role: 'Business Strategist', avatar: '/avatars/user3.png' }
  ],
  dataSources: [
    { id: 'ds1', name: 'Customer Database', type: 'SQL Database' },
    { id: 'ds2', name: 'Market Research Reports', type: 'Document Collection' },
    { id: 'ds3', name: 'Competitor Analysis', type: 'Web Scraping' }
  ]
};

export default function MissionDashboardPage({ params }) {
  const { id } = params;
  const { currentMission, setCurrentMission } = useMission();
  
  // Simulerar inläsning av mission-data
  useEffect(() => {
    // I en riktig implementering skulle vi hämta mission-data från API
    // baserat på params.id
    setCurrentMission(sampleMission);
  }, [id, setCurrentMission]);
  
  if (!currentMission) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-30">Loading mission...</div>
            <div className="text-text-secondary">Please wait while we load your mission data</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Additional safety check for critical mission properties
  if (!currentMission.name) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-2xl mb-2 text-red-500">⚠️ Mission Error</div>
            <div className="text-text-secondary">Mission data is incomplete. Please try again.</div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold mb-1">{currentMission.name}</h1>
            <p className="text-text-secondary">{currentMission.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary">
              Share
            </Button>
            <Button>
              Create Report
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6 mb-6">
        {/* Mission Stats */}
        <div className="col-span-4">
          <Card title="Mission Overview">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-text-secondary mb-1">Created</div>
                <div>{new Date(currentMission.created).toLocaleDateString()}</div>
              </div>
              
              <div>
                <div className="text-sm text-text-secondary mb-1">Last Updated</div>
                <div>{new Date(currentMission.updated).toLocaleDateString()}</div>
              </div>
              
              <div>
                <div className="text-sm text-text-secondary mb-1">Team</div>
                <div className="flex flex-wrap gap-2">
                  {currentMission.team?.map(member => (
                    <div key={member.id} className="flex items-center text-sm bg-secondary/10 rounded-full px-3 py-1">
                      <div className="w-6 h-6 rounded-full bg-secondary/30 mr-2"></div>
                      <div>{member.name}</div>
                    </div>
                  )) || <div className="text-sm text-text-secondary">No team members assigned</div>}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-text-secondary mb-1">Data Sources</div>
                <div className="flex flex-col gap-1">
                  {currentMission.dataSources?.map(source => (
                    <div key={source.id} className="text-sm">
                      <span className="font-medium">{source.name}</span>
                      <span className="text-text-secondary ml-1">({source.type})</span>
                    </div>
                  )) || <div className="text-sm text-text-secondary">No data sources connected</div>}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="col-span-8">
          <Card title="Mission Actions">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 border border-secondary/20 rounded-md hover:bg-secondary/5 cursor-pointer">
                <div className="text-xl mb-2">📊</div>
                <div className="font-medium mb-1">Create Dashboard</div>
                <div className="text-sm text-text-secondary">Build interactive visualization of your mission data</div>
              </div>
              
              <div className="p-3 border border-secondary/20 rounded-md hover:bg-secondary/5 cursor-pointer">
                <div className="text-xl mb-2">🤖</div>
                <div className="font-medium mb-1">AI Analysis</div>
                <div className="text-sm text-text-secondary">Generate insights from your data using AI</div>
              </div>
              
              <div className="p-3 border border-secondary/20 rounded-md hover:bg-secondary/5 cursor-pointer">
                <div className="text-xl mb-2">📝</div>
                <div className="font-medium mb-1">Mission Notes</div>
                <div className="text-sm text-text-secondary">Collaborate on mission documentation</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Mission Objectives */}
      <MissionObjectives />
      
      {/* Mission Timeline */}
      <MissionTimeline />
      
      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="space-y-3">
          <div className="p-3 border-b border-secondary/10">
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-secondary/20 mr-3"></div>
              <div>
                <div className="text-sm">
                  <span className="font-medium">Sarah Johnson</span>
                  <span className="text-text-secondary"> added a new dashboard: </span>
                  <span className="text-accent">Sales Performance</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">Today, 10:45 AM</div>
              </div>
            </div>
          </div>
          
          <div className="p-3 border-b border-secondary/10">
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-secondary/20 mr-3"></div>
              <div>
                <div className="text-sm">
                  <span className="font-medium">Michael Chen</span>
                  <span className="text-text-secondary"> updated objective: </span>
                  <span className="text-accent">Optimize Marketing Spend</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">Yesterday, 4:12 PM</div>
              </div>
            </div>
          </div>
          
          <div className="p-3 border-b border-secondary/10">
            <div className="flex">
              <div className="w-8 h-8 rounded-full bg-secondary/20 mr-3"></div>
              <div>
                <div className="text-sm">
                  <span className="font-medium">John Smith</span>
                  <span className="text-text-secondary"> added a new data source: </span>
                  <span className="text-accent">Competitor Analysis</span>
                </div>
                <div className="text-xs text-text-secondary mt-1">Sep 14, 2023, 9:30 AM</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
} 