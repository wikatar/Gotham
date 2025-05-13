'use client'

import { useState, useEffect } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useMission } from '../lib/missionContext'

// Import our new components
import StatusBadge from '../components/feed-center/StatusBadge'
import { TypeBadge, CategoryBadge } from '../components/feed-center/TypeBadge'
import DataSourceCard from '../components/feed-center/DataSourceCard'
import FilterPanel from '../components/feed-center/FilterPanel'
import StatisticsPanel from '../components/feed-center/StatisticsPanel'
import DataSourceDetail from '../components/feed-center/DataSourceDetail'
import DataSourceForm from '../components/feed-center/DataSourceForm'
import { SAMPLE_DATA_SOURCES } from '../components/feed-center/sampleData'
import { DataSource, DataSourceType, DataSourceCategory, DataSourceStatus } from '../components/feed-center/types'

// Helper functions for displaying data
const formatDate = (date) => {
  if (!date) return 'Never';
  
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // Seconds
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  
  return date.toLocaleDateString();
};

export default function FeedCenterPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>(SAMPLE_DATA_SOURCES);
  const [selectedStatus, setSelectedStatus] = useState<DataSourceStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<DataSourceType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<DataSourceCategory | 'all'>('all');
  const [showStrategicOnly, setShowStrategicOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  
  // Filter the data sources based on active filters and search query
  const filteredDataSources = dataSources.filter(source => {
    // Apply status filter
    if (selectedStatus !== 'all' && source.status !== selectedStatus) return false;
    
    // Apply type filter
    if (selectedType !== 'all' && source.type !== selectedType) return false;
    
    // Apply category filter
    if (selectedCategory !== 'all' && source.category !== selectedCategory) return false;
    
    // Apply strategic filter
    if (showStrategicOnly && !source.is_strategic) return false;
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return source.name.toLowerCase().includes(query) || 
             source.description.toLowerCase().includes(query) ||
             source.tags.some(tag => tag.toLowerCase().includes(query));
    }
    
    return true;
  });

  const handleAddSource = (newSource: DataSource) => {
    setDataSources(prev => [...prev, newSource]);
    setShowAddForm(false);
  };

  const handleEditSource = (updatedSource: DataSource) => {
    setDataSources(prev => 
      prev.map(source => source.id === updatedSource.id ? updatedSource : source)
    );
    setEditingSource(null);
    setSelectedSource(updatedSource);
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Feed Center</h1>
        <p className="text-text-secondary">Manage and monitor all data sources and feeds</p>
      </div>
      
      {/* Statistics Panel */}
      <StatisticsPanel dataSources={dataSources} />
      
      {/* Filter Panel */}
      <FilterPanel
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        selectedCategory={selectedCategory}
        showStrategicOnly={showStrategicOnly}
        searchQuery={searchQuery}
        onStatusChange={setSelectedStatus}
        onTypeChange={setSelectedType}
        onCategoryChange={setSelectedCategory}
        onStrategicToggle={() => setShowStrategicOnly(!showStrategicOnly)}
        onSearchChange={setSearchQuery}
      />
      
      {/* Add Source Button */}
      <div className="flex justify-end mb-6">
        <Button variant="primary" onClick={() => setShowAddForm(true)}>
          Add Data Source
        </Button>
      </div>
      
      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredDataSources.length > 0 ? (
          filteredDataSources.map(source => (
            <DataSourceCard
              key={source.id}
              dataSource={source}
              onClick={() => setSelectedSource(source)}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-text-secondary">
            <p className="text-lg mb-2">No data sources found</p>
            <p>Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <Button variant="secondary" className="py-6">
            <div className="text-center">
              <div className="text-xl mb-2">🔄</div>
              <div>Refresh All Sources</div>
            </div>
          </Button>
          
          <Button variant="secondary" className="py-6">
            <div className="text-center">
              <div className="text-xl mb-2">🔍</div>
              <div>Analyze Data Quality</div>
            </div>
          </Button>
          
          <Button variant="secondary" className="py-6">
            <div className="text-center">
              <div className="text-xl mb-2">📝</div>
              <div>Batch Update Sources</div>
            </div>
          </Button>
        </div>
      </Card>
      
      {/* Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Recent Health Incidents" className="h-96 overflow-y-auto">
          <div className="space-y-4 p-4">
            {dataSources
              .filter(src => src.health_history.some(check => check.status !== 'active'))
              .map(source => (
                <div key={`health-${source.id}`} className="p-4 border border-secondary/20 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{source.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <TypeBadge type={source.type} />
                        <CategoryBadge category={source.category} />
                      </div>
                    </div>
                    <StatusBadge status={source.status} />
                  </div>
                  
                  <div className="mt-3 text-sm">
                    {source.health_history
                      .filter(check => check.status !== 'active')
                      .slice(0, 1)
                      .map((check, i) => (
                        <div key={i} className="flex items-center mt-2">
                          <StatusBadge status={check.status} size="sm" showLabel={false} />
                          <span className="ml-2">
                            {check.message || (check.status === 'warning' ? 'Slow response time' : 'Connection failed')} 
                            {' '}({formatDate(check.timestamp)})
                          </span>
                        </div>
                    ))}
                  </div>
                </div>
              ))}
              
            {dataSources.filter(src => src.health_history.some(check => check.status !== 'active')).length === 0 && (
              <div className="p-8 text-center text-text-secondary">
                <div className="text-3xl mb-2">✅</div>
                <p>All systems operational</p>
                <p className="text-sm">No health incidents recorded recently</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Feed Usage" className="h-96">
          <div className="p-4 h-full flex items-center justify-center text-text-secondary">
            <div className="text-center">
              <p>Feed usage analytics will be displayed here</p>
              <p className="text-sm mt-2">Coming soon</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Data Source Detail Modal */}
      {selectedSource && (
        <DataSourceDetail
          dataSource={selectedSource}
          onClose={() => setSelectedSource(null)}
          onEdit={() => {
            setEditingSource(selectedSource);
            setSelectedSource(null);
          }}
        />
      )}
      
      {/* Add/Edit Data Source Form */}
      {(showAddForm || editingSource) && (
        <DataSourceForm
          isOpen={true}
          onClose={() => {
            setShowAddForm(false);
            setEditingSource(null);
          }}
          onSave={editingSource ? handleEditSource : handleAddSource}
          dataSource={editingSource || undefined}
        />
      )}
    </AppLayout>
  )
} 