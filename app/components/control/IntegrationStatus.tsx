'use client';

import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

type Integration = {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync?: Date;
  type: 'data' | 'api' | 'auth' | 'storage';
  description: string;
};

const sampleIntegrations: Integration[] = [
  {
    id: 'int-001',
    name: 'GCPD Data Lake',
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: 'data',
    description: 'Central database for all GCPD records and case files'
  },
  {
    id: 'int-002',
    name: 'Arkham Patient Records',
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    type: 'api',
    description: 'Secure API connection to Arkham Asylum patient database'
  },
  {
    id: 'int-003',
    name: 'Wayne Enterprises',
    status: 'pending',
    type: 'data',
    description: 'Integration with Wayne Enterprises research database'
  },
  {
    id: 'int-004',
    name: 'ACE Chemicals',
    status: 'error',
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    type: 'data',
    description: 'Chemical compound database from ACE Chemicals'
  },
  {
    id: 'int-005',
    name: 'Gotham City Hall',
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    type: 'api',
    description: 'Gotham City public records and municipal data'
  },
  {
    id: 'int-006',
    name: 'S3 Storage Bucket',
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    type: 'storage',
    description: 'Cloud storage for evidence files and large datasets'
  },
  {
    id: 'int-007',
    name: 'OAuth Provider',
    status: 'connected',
    lastSync: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    type: 'auth',
    description: 'Authentication service for external partners'
  }
];

export default function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<Integration[]>(sampleIntegrations);
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected' | 'error' | 'pending'>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const filteredIntegrations = integrations.filter(integration => {
    if (filter === 'all') return true;
    if (filter === 'connected' && integration.status === 'connected') return true;
    if (filter === 'disconnected' && integration.status === 'disconnected') return true;
    if (filter === 'error' && integration.status === 'error') return true;
    if (filter === 'pending' && integration.status === 'pending') return true;
    return false;
  });

  const handleSync = (id: string) => {
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === id 
          ? { ...integration, lastSync: new Date(), status: 'connected' } 
          : integration
      )
    );
  };

  const handleToggleStatus = (id: string) => {
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => 
        integration.id === id 
          ? { 
              ...integration, 
              status: integration.status === 'connected' ? 'disconnected' : 'connected',
              lastSync: integration.status !== 'connected' ? new Date() : integration.lastSync
            } 
          : integration
      )
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Connected</span>;
      case 'disconnected':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Disconnected</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'error':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Error</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: Integration['type']) => {
    switch (type) {
      case 'data':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Data</span>;
      case 'api':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">API</span>;
      case 'auth':
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Auth</span>;
      case 'storage':
        return <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium">Storage</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">System Integrations</h2>
          <p className="text-sm text-text-secondary mt-1">Manage external data connections and APIs</p>
        </div>
        <Button variant="primary">Add New Integration</Button>
      </div>

      {/* Filter Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button 
          variant={filter === 'all' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-[#FF3333] border-[#FF3333] hover:bg-[#CC0000]' : ''}
        >
          All Integrations
        </Button>
        <Button 
          variant={filter === 'connected' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('connected')}
          className={filter === 'connected' ? 'bg-[#FF3333] border-[#FF3333] hover:bg-[#CC0000]' : ''}
        >
          Connected
        </Button>
        <Button 
          variant={filter === 'disconnected' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('disconnected')}
          className={filter === 'disconnected' ? 'bg-[#FF3333] border-[#FF3333] hover:bg-[#CC0000]' : ''}
        >
          Disconnected
        </Button>
        <Button 
          variant={filter === 'error' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('error')}
          className={filter === 'error' ? 'bg-[#FF3333] border-[#FF3333] hover:bg-[#CC0000]' : ''}
        >
          Error
        </Button>
        <Button 
          variant={filter === 'pending' ? 'primary' : 'secondary'} 
          size="sm"
          onClick={() => setFilter('pending')}
          className={filter === 'pending' ? 'bg-[#FF3333] border-[#FF3333] hover:bg-[#CC0000]' : ''}
        >
          Pending
        </Button>
      </div>

      {/* Integrations List */}
      <Card title="Active Integrations" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-secondary/20">
                <th className="px-4 py-3">Integration</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Sync</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIntegrations.length > 0 ? (
                filteredIntegrations.map((integration) => (
                  <tr key={integration.id} className="border-b border-secondary/10 hover:bg-background-elevated">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-text-secondary text-xs">{integration.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getTypeBadge(integration.type)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(integration.status)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(integration.lastSync)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleSync(integration.id)}
                          disabled={integration.status === 'pending'}
                        >
                          Sync
                        </Button>
                        <Button 
                          variant={integration.status === 'connected' ? 'warning' : 'primary'} 
                          size="sm"
                          onClick={() => handleToggleStatus(integration.id)}
                          disabled={integration.status === 'pending' || integration.status === 'error'}
                        >
                          {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-secondary">
                    No integrations found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Integration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Integrations" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Total Integrations</div>
          <div className="text-3xl font-bold">{integrations.length}</div>
        </Card>
        
        <Card title="Connected" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Connected</div>
          <div className="text-3xl font-bold text-green-500">
            {integrations.filter(i => i.status === 'connected').length}
          </div>
        </Card>
        
        <Card title="Pending" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-500">
            {integrations.filter(i => i.status === 'pending').length}
          </div>
        </Card>
        
        <Card title="Error" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Error</div>
          <div className="text-3xl font-bold text-red-500">
            {integrations.filter(i => i.status === 'error').length}
          </div>
        </Card>
      </div>
    </div>
  );
} 