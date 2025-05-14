'use client'

import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Sample event data
const eventData = [
  {
    id: 'e-001',
    title: 'Enterprise System Upgrade',
    category: 'infrastructure',
    location: 'Global',
    timestamp: '2025-05-25T14:00:00Z',
    description: 'Scheduled upgrade of core enterprise systems. Expected downtime: 2 hours.',
    impact: 'medium',
    status: 'scheduled',
    owner: 'IT Operations'
  },
  {
    id: 'e-002',
    title: 'New Product Launch',
    category: 'business',
    location: 'North America',
    timestamp: '2025-05-20T09:00:00Z',
    description: 'Official launch of Enterprise Brain Pro tier with enhanced capabilities.',
    impact: 'high',
    status: 'confirmed',
    owner: 'Product Team'
  },
  {
    id: 'e-003',
    title: 'Quarterly Data Review',
    category: 'data',
    location: 'Global',
    timestamp: '2025-05-15T15:30:00Z',
    description: 'Review of data quality, completeness, and system performance across all regions.',
    impact: 'low',
    status: 'confirmed',
    owner: 'Data Governance'
  },
  {
    id: 'e-004',
    title: 'European Datacenter Maintenance',
    category: 'infrastructure',
    location: 'Europe',
    timestamp: '2025-05-18T02:00:00Z',
    description: 'Scheduled maintenance of primary European datacenter. Service failover to backup center will be activated.',
    impact: 'medium',
    status: 'scheduled',
    owner: 'EU Infrastructure Team'
  },
  {
    id: 'e-005',
    title: 'AI Model Retraining',
    category: 'ai',
    location: 'Global',
    timestamp: '2025-05-16T08:00:00Z',
    description: 'Scheduled retraining of core prediction models with latest data.',
    impact: 'low',
    status: 'scheduled',
    owner: 'AI Team'
  },
  {
    id: 'e-006',
    title: 'Customer Feedback Integration',
    category: 'data',
    location: 'Global',
    timestamp: '2025-05-14T10:00:00Z',
    description: 'New customer feedback sources will be integrated into the data lake.',
    impact: 'medium',
    status: 'confirmed',
    owner: 'Data Integration Team'
  },
  {
    id: 'e-007',
    title: 'Security Audit',
    category: 'security',
    location: 'Global',
    timestamp: '2025-05-22T09:00:00Z',
    description: 'Comprehensive security audit of all systems and access controls.',
    impact: 'medium',
    status: 'scheduled',
    owner: 'Security Team'
  },
  {
    id: 'e-008',
    title: 'New Market Expansion',
    category: 'business',
    location: 'Asia Pacific',
    timestamp: '2025-06-01T00:00:00Z',
    description: 'Official expansion into Singapore and Malaysia markets.',
    impact: 'high',
    status: 'confirmed',
    owner: 'Executive Team'
  },
  {
    id: 'e-009',
    title: 'Database Schema Update',
    category: 'infrastructure',
    location: 'Global',
    timestamp: '2025-05-17T23:00:00Z',
    description: 'Schema changes to accommodate new data types and improve query performance.',
    impact: 'medium',
    status: 'scheduled',
    owner: 'Database Team'
  },
  {
    id: 'e-010',
    title: 'Marketing Campaign Launch',
    category: 'business',
    location: 'North America',
    timestamp: '2025-05-19T08:00:00Z',
    description: 'Launch of Q2 marketing campaign across digital channels.',
    impact: 'medium',
    status: 'confirmed',
    owner: 'Marketing Team'
  }
];

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Helper function to get impact class
const getImpactClass = (impact: string) => {
  switch(impact) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get status class
const getStatusClass = (status: string) => {
  switch(status) {
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'tentative': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to format date for timeline
const formatDateForTimeline = (timestamp: string) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get days until event
const getDaysUntil = (timestamp: string) => {
  const now = new Date();
  const eventDate = new Date(timestamp);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

type GlobalEventsProps = {
  filter?: string | null;
}

const GlobalEvents: React.FC<GlobalEventsProps> = ({ filter }) => {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(filter || null);
  const [impactFilter, setImpactFilter] = useState<string | null>(null);
  const [timeframeFilter, setTimeframeFilter] = useState<'upcoming' | 'all' | 'past'>('upcoming');
  
  // Get unique categories, impacts
  const categories = Array.from(new Set(eventData.map(event => event.category)));
  const impacts = Array.from(new Set(eventData.map(event => event.impact)));
  
  // Process events based on filters
  const now = new Date();
  const filteredEvents = eventData
    .filter(event => {
      // Apply category filter
      if (categoryFilter && event.category !== categoryFilter) return false;
      
      // Apply impact filter
      if (impactFilter && event.impact !== impactFilter) return false;
      
      // Apply timeframe filter
      const eventDate = new Date(event.timestamp);
      if (timeframeFilter === 'upcoming' && eventDate < now) return false;
      if (timeframeFilter === 'past' && eventDate >= now) return false;
      
      return true;
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  // Group events by date
  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const dateKey = formatDateForTimeline(event.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, typeof eventData>);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-secondary/20 p-4">
            <h2 className="text-lg font-medium">Global Events Timeline</h2>
            <p className="text-sm text-text-secondary">
              Track and manage upcoming and past events across your enterprise
            </p>
          </div>
          
          <div className="p-4 border-b border-secondary/20 bg-background-elevated">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-sm text-text-secondary">Timeframe:</span>
                <div className="flex gap-1 mt-1">
                  <Button 
                    variant={timeframeFilter === 'upcoming' ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setTimeframeFilter('upcoming')}
                  >
                    Upcoming
                  </Button>
                  <Button 
                    variant={timeframeFilter === 'all' ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setTimeframeFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={timeframeFilter === 'past' ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setTimeframeFilter('past')}
                  >
                    Past
                  </Button>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-text-secondary">Category:</span>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <Button 
                    variant={categoryFilter === null ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setCategoryFilter(null)}
                  >
                    All
                  </Button>
                  {categories.map(category => (
                    <Button 
                      key={category}
                      variant={categoryFilter === category ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setCategoryFilter(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm text-text-secondary">Impact:</span>
                <div className="flex gap-1 mt-1">
                  <Button 
                    variant={impactFilter === null ? 'primary' : 'secondary'} 
                    size="sm"
                    onClick={() => setImpactFilter(null)}
                  >
                    All
                  </Button>
                  {impacts.map(impact => (
                    <Button 
                      key={impact}
                      variant={impactFilter === impact ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => setImpactFilter(impact)}
                      className="capitalize"
                    >
                      {impact}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-auto max-h-[calc(100vh-400px)]">
            {Object.keys(eventsByDate).length > 0 ? (
              <div className="p-4">
                {Object.entries(eventsByDate).map(([dateKey, events]) => (
                  <div key={dateKey} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-3">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <h3 className="font-medium">{dateKey}</h3>
                      <div className="ml-2 text-xs text-text-secondary">
                        {events.length} event{events.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="ml-4 border-l-2 border-secondary/30 pl-4 space-y-4">
                      {events.map(event => (
                        <div 
                          key={event.id}
                          className={`p-3 border border-secondary/20 rounded-md hover:shadow-md cursor-pointer ${
                            selectedEvent === event.id ? 'border-primary bg-background-elevated' : ''
                          }`}
                          onClick={() => setSelectedEvent(event.id === selectedEvent ? null : event.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactClass(event.impact)} mr-2`}>
                                {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)} Impact
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(event.status)}`}>
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-xs text-text-secondary">
                              {formatTimestamp(event.timestamp)}
                            </div>
                          </div>
                          
                          <h4 className="font-medium mb-1">{event.title}</h4>
                          
                          <div className="flex justify-between text-xs text-text-secondary">
                            <div>
                              <span className="capitalize">{event.category}</span> • {event.location}
                            </div>
                            <div>Owner: {event.owner}</div>
                          </div>
                          
                          {selectedEvent === event.id && (
                            <div className="mt-3 text-sm border-t border-secondary/20 pt-3">
                              <p>{event.description}</p>
                              
                              <div className="flex justify-end mt-3 space-x-2">
                                <Button variant="secondary" size="sm">View Details</Button>
                                <Button variant="primary" size="sm">Add to Calendar</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-lg font-medium mb-2">No matching events</h3>
                <p className="text-text-secondary">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <Card title="Upcoming Events" className="mb-6">
          <div className="space-y-4">
            {eventData
              .filter(event => new Date(event.timestamp) > now)
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .slice(0, 5)
              .map(event => {
                const daysUntil = getDaysUntil(event.timestamp);
                
                return (
                  <div key={event.id} className="border-b border-secondary/20 last:border-b-0 pb-3 last:pb-0">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <span className={`text-xs ${
                        daysUntil <= 3 ? 'text-red-500' : 
                        daysUntil <= 7 ? 'text-yellow-500' : 
                        'text-text-secondary'
                      }`}>
                        {daysUntil <= 0 ? 'Today' : 
                         daysUntil === 1 ? 'Tomorrow' : 
                         `${daysUntil} days`}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {formatTimestamp(event.timestamp)} • {event.location}
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        event.impact === 'high' ? 'bg-red-500' :
                        event.impact === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      } mr-1`}></span>
                      <span className="text-xs capitalize">{event.category}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
        
        <Card title="Event Categories" className="mb-6">
          <div className="space-y-2">
            {categories.map(category => {
              const count = eventData.filter(e => e.category === category).length;
              const percentage = Math.round((count / eventData.length) * 100);
              
              return (
                <div key={category} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="capitalize">{category}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full h-2 bg-background-paper rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Button variant="secondary" className="w-full">Create New Event</Button>
            <Button variant="secondary" className="w-full">Import from Calendar</Button>
            <Button variant="secondary" className="w-full">Export Events</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GlobalEvents; 