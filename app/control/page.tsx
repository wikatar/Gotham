'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ControlPanel from '../components/control/ControlPanel';
import SystemMetrics from '../components/control/SystemMetrics';
import AlertPanel from '../components/control/AlertPanel';
import WorkflowController from '../components/control/WorkflowController';
import IntegrationStatus from '../components/control/IntegrationStatus';

export default function ControlInterfacePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'integrations' | 'alerts'>('overview');
  const [showMasterControl, setShowMasterControl] = useState(false);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle system status changes
  const handleSystemStatusChange = (status: 'healthy' | 'warning' | 'critical') => {
    setSystemHealth(status);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading control interface...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Control Interface</h1>
            <p className="text-text-secondary">
              Manage system operations, workflows, and infrastructure
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowMasterControl(prev => !prev)}
            >
              {showMasterControl ? 'Hide Master Controls' : 'Show Master Controls'}
            </Button>
            <Button variant="primary">System Actions</Button>
          </div>
        </div>
      </div>

      {/* System Health Status */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">System Health Status</h2>
            <div className={`px-3 py-1 rounded-full text-sm ${
              systemHealth === 'healthy' ? 'bg-green-100 text-green-800' :
              systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {systemHealth === 'healthy' ? 'Healthy' : 
               systemHealth === 'warning' ? 'Warning' : 'Critical Issues'}
            </div>
          </div>
          
          <SystemMetrics onSystemStatusChange={handleSystemStatusChange} />
        </div>
      </Card>

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
            activeTab === 'workflows' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('workflows')}
        >
          Workflows
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'integrations' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'alerts' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts & Notifications
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <ControlPanel showMasterControl={showMasterControl} />
      )}

      {activeTab === 'workflows' && (
        <WorkflowController />
      )}

      {activeTab === 'integrations' && (
        <IntegrationStatus />
      )}

      {activeTab === 'alerts' && (
        <AlertPanel />
      )}
    </AppLayout>
  );
} 