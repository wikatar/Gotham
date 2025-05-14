'use client';

import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  SAMPLE_ENHANCED_MISSIONS,
} from '../components/missions/sampleData';
import { 
  EnhancedMission, 
  MissionStatus, 
  MissionPriority 
} from '../components/missions/types';
import Link from 'next/link';

export default function MissionsPage() {
  const [missions, setMissions] = useState<EnhancedMission[]>(SAMPLE_ENHANCED_MISSIONS);
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<MissionPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter missions based on filters and search query
  const filteredMissions = missions.filter(mission => {
    // Apply status filter
    if (statusFilter !== 'all' && mission.status !== statusFilter) return false;
    
    // Apply priority filter
    if (priorityFilter !== 'all' && mission.priority !== priorityFilter) return false;
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return mission.name.toLowerCase().includes(query) || 
             (mission.description?.toLowerCase().includes(query) || false) ||
             mission.tags.some(tag => tag.toLowerCase().includes(query));
    }
    
    return true;
  });
  
  // Get counts for dashboard stats
  const totalMissions = missions.length;
  const activeMissions = missions.filter(m => m.status === 'active').length;
  const criticalMissions = missions.filter(m => m.priority === 'critical').length;
  const overdueMissions = missions.filter(m => 
    m.endDate && m.endDate < new Date() && m.status !== 'completed'
  ).length;
  
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: MissionStatus }) => {
    const getColor = () => {
      switch(status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'completed': return 'bg-blue-100 text-blue-800';
        case 'on-hold': return 'bg-yellow-100 text-yellow-800';
        case 'planning': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColor()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Priority indicator component
  const PriorityIndicator = ({ priority }: { priority: MissionPriority }) => {
    const getColor = () => {
      switch(priority) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    };
    
    return (
      <div className="flex items-center">
        <span className={`w-2 h-2 rounded-full ${getColor()} mr-1`}></span>
        <span className="text-xs">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
      </div>
    );
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Missions</h1>
        <p className="text-text-secondary">Create and manage strategic goals, KPIs, and action plans</p>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Total Missions</div>
          <div className="text-3xl font-bold">{totalMissions}</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Active Missions</div>
          <div className="text-3xl font-bold text-green-500">{activeMissions}</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Critical Priority</div>
          <div className="text-3xl font-bold text-red-500">{criticalMissions}</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Overdue</div>
          <div className="text-3xl font-bold text-yellow-500">{overdueMissions}</div>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-background-elevated p-4 rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-medium">Filter Missions</h3>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search missions..."
              className="w-full px-4 py-2 bg-background-paper border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-1 mr-4">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All Status
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'planning' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('planning')}
            >
              Planning
            </Button>
            <Button
              variant={statusFilter === 'on-hold' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('on-hold')}
            >
              On Hold
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
          </div>
          
          {/* Priority Filter */}
          <div className="flex flex-wrap gap-1">
            <Button
              variant={priorityFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('all')}
            >
              All Priorities
            </Button>
            <Button
              variant={priorityFilter === 'critical' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('critical')}
            >
              Critical
            </Button>
            <Button
              variant={priorityFilter === 'high' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('high')}
            >
              High
            </Button>
            <Button
              variant={priorityFilter === 'medium' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('medium')}
            >
              Medium
            </Button>
            <Button
              variant={priorityFilter === 'low' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('low')}
            >
              Low
            </Button>
          </div>
        </div>
      </div>
      
      {/* Create Mission Button */}
      <div className="flex justify-end mb-6">
        <Link href="/missions/create">
          <Button variant="primary">Create New Mission</Button>
        </Link>
      </div>
      
      {/* Missions List */}
      <Card title="Active Missions" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-secondary/20">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMissions.length > 0 ? (
                filteredMissions.map((mission) => (
                  <tr key={mission.id} className="border-b border-secondary/10 hover:bg-background-elevated">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{mission.name}</div>
                        <div className="text-text-secondary text-xs line-clamp-1">
                          {mission.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={mission.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityIndicator priority={mission.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-16 h-1.5 bg-background-paper rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${mission.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{mission.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(mission.startDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={
                        mission.endDate && mission.endDate < new Date() && mission.status !== 'completed'
                          ? 'text-red-500 font-medium'
                          : ''
                      }>
                        {formatDate(mission.endDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/missions/${mission.id}`}>
                        <Button variant="secondary" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-text-secondary">
                    No missions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-medium mb-1">Create Mission</h3>
          <p className="text-text-secondary text-sm mb-4">Set up a new strategic mission with goals and KPIs</p>
          <Link href="/missions/create" className="mt-auto">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </Card>
        
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-medium mb-1">KPI Dashboard</h3>
          <p className="text-text-secondary text-sm mb-4">View all KPIs across missions in one place</p>
          <Link href="/missions/kpis" className="mt-auto">
            <Button variant="secondary" size="sm">View KPIs</Button>
          </Link>
        </Card>
        
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-medium mb-1">AI Recommendations</h3>
          <p className="text-text-secondary text-sm mb-4">Get AI-powered insights and recommendations</p>
          <Link href="/missions/recommendations" className="mt-auto">
            <Button variant="primary" size="sm">View Insights</Button>
          </Link>
        </Card>
      </div>
'use client';

import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  SAMPLE_ENHANCED_MISSIONS,
} from '../components/missions/sampleData';
import { 
  EnhancedMission, 
  MissionStatus, 
  MissionPriority 
} from '../components/missions/types';
import Link from 'next/link';

export default function MissionsPage() {
  const [missions, setMissions] = useState<EnhancedMission[]>(SAMPLE_ENHANCED_MISSIONS);
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<MissionPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter missions based on filters and search query
  const filteredMissions = missions.filter(mission => {
    // Apply status filter
    if (statusFilter !== 'all' && mission.status !== statusFilter) return false;
    
    // Apply priority filter
    if (priorityFilter !== 'all' && mission.priority !== priorityFilter) return false;
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return mission.name.toLowerCase().includes(query) || 
             (mission.description?.toLowerCase().includes(query) || false) ||
             mission.tags.some(tag => tag.toLowerCase().includes(query));
    }
    
    return true;
  });
  
  // Get counts for dashboard stats
  const totalMissions = missions.length;
  const activeMissions = missions.filter(m => m.status === 'active').length;
  const criticalMissions = missions.filter(m => m.priority === 'critical').length;
  const overdueMissions = missions.filter(m => 
    m.endDate && m.endDate < new Date() && m.status !== 'completed'
  ).length;
  
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: MissionStatus }) => {
    const getColor = () => {
      switch(status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'completed': return 'bg-blue-100 text-blue-800';
        case 'on-hold': return 'bg-yellow-100 text-yellow-800';
        case 'planning': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColor()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Priority indicator component
  const PriorityIndicator = ({ priority }: { priority: MissionPriority }) => {
    const getColor = () => {
      switch(priority) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-blue-500';
        default: return 'bg-gray-500';
      }
    };
    
    return (
      <div className="flex items-center">
        <span className={`w-2 h-2 rounded-full ${getColor()} mr-1`}></span>
        <span className="text-xs">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
      </div>
    );
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Missions</h1>
        <p className="text-text-secondary">Create and manage strategic goals, KPIs, and action plans</p>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Total Missions</div>
          <div className="text-3xl font-bold">{totalMissions}</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Active Missions</div>
          <div className="text-3xl font-bold text-green-500">{activeMissions}</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Critical Priority</div>
          <div className="text-3xl font-bold text-red-500">{criticalMissions}</div>
        </Card>
        
        <Card className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Overdue</div>
          <div className="text-3xl font-bold text-yellow-500">{overdueMissions}</div>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-background-elevated p-4 rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-medium">Filter Missions</h3>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search missions..."
              className="w-full px-4 py-2 bg-background-paper border border-secondary/30 rounded-md focus:outline-none focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-1 mr-4">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All Status
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'planning' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('planning')}
            >
              Planning
            </Button>
            <Button
              variant={statusFilter === 'on-hold' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('on-hold')}
            >
              On Hold
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
          </div>
          
          {/* Priority Filter */}
          <div className="flex flex-wrap gap-1">
            <Button
              variant={priorityFilter === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('all')}
            >
              All Priorities
            </Button>
            <Button
              variant={priorityFilter === 'critical' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('critical')}
            >
              Critical
            </Button>
            <Button
              variant={priorityFilter === 'high' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('high')}
            >
              High
            </Button>
            <Button
              variant={priorityFilter === 'medium' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('medium')}
            >
              Medium
            </Button>
            <Button
              variant={priorityFilter === 'low' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPriorityFilter('low')}
            >
              Low
            </Button>
          </div>
        </div>
      </div>
      
      {/* Create Mission Button */}
      <div className="flex justify-end mb-6">
        <Link href="/missions/create">
          <Button variant="primary">Create New Mission</Button>
        </Link>
      </div>
      
      {/* Missions List */}
      <Card title="Active Missions" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-secondary/20">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMissions.length > 0 ? (
                filteredMissions.map((mission) => (
                  <tr key={mission.id} className="border-b border-secondary/10 hover:bg-background-elevated">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{mission.name}</div>
                        <div className="text-text-secondary text-xs line-clamp-1">
                          {mission.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={mission.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityIndicator priority={mission.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-16 h-1.5 bg-background-paper rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ width: `${mission.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs">{mission.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(mission.startDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={
                        mission.endDate && mission.endDate < new Date() && mission.status !== 'completed'
                          ? 'text-red-500 font-medium'
                          : ''
                      }>
                        {formatDate(mission.endDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/missions/${mission.id}`}>
                        <Button variant="secondary" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-text-secondary">
                    No missions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-medium mb-1">Create Mission</h3>
          <p className="text-text-secondary text-sm mb-4">Set up a new strategic mission with goals and KPIs</p>
          <Link href="/missions/create" className="mt-auto">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </Card>
        
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-medium mb-1">KPI Dashboard</h3>
          <p className="text-text-secondary text-sm mb-4">View all KPIs across missions in one place</p>
          <Link href="/missions/kpis" className="mt-auto">
            <Button variant="secondary" size="sm">View KPIs</Button>
          </Link>
        </Card>
        
        <Card className="p-4 flex flex-col items-center text-center">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-medium mb-1">AI Recommendations</h3>
          <p className="text-text-secondary text-sm mb-4">Get AI-powered insights and recommendations</p>
          <Link href="/missions/recommendations" className="mt-auto">
            <Button variant="secondary" size="sm">View Insights</Button>
          </Link>
        </Card>
      </div>
    </AppLayout>
  );
} 