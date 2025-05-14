'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ControlPanelProps {
  showMasterControl: boolean;
}

export default function ControlPanel({ showMasterControl }: ControlPanelProps) {
  const [systemState, setSystemState] = useState<{
    aiProcessing: boolean;
    dataFlow: boolean;
    realTimeAnalytics: boolean;
    autonomousAgents: boolean;
    notifications: boolean;
    securityMonitoring: boolean;
  }>({
    aiProcessing: true,
    dataFlow: true,
    realTimeAnalytics: true,
    autonomousAgents: true,
    notifications: true,
    securityMonitoring: true,
  });

  const [powerLevel, setPowerLevel] = useState<number>(80);

  const toggleSystem = (key: keyof typeof systemState) => {
    setSystemState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPowerLevel(Number(e.target.value));
  };

  const handleEmergencyShutdown = () => {
    // In a real app, this would trigger an API call
    const confirmShutdown = window.confirm(
      "WARNING: Emergency shutdown will halt all system processes. This should only be used in critical situations. Continue?"
    );
    
    if (confirmShutdown) {
      setSystemState({
        aiProcessing: false,
        dataFlow: false,
        realTimeAnalytics: false,
        autonomousAgents: false,
        notifications: false,
        securityMonitoring: true, // Keep security on
      });
      setPowerLevel(10); // Minimum power to keep security running
    }
  };

  return (
    <div>
      {/* Control Systems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card title="AI Processing Pipeline" className="h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${systemState.aiProcessing ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{systemState.aiProcessing ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={systemState.aiProcessing}
                    onChange={() => toggleSystem('aiProcessing')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Model Processing</span>
                  <span>{systemState.aiProcessing ? 'Running' : 'Stopped'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: systemState.aiProcessing ? '85%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Inference Engine</span>
                  <span>{systemState.aiProcessing ? 'Online' : 'Offline'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ width: systemState.aiProcessing ? '92%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Model Updates</span>
                  <span>{systemState.aiProcessing ? 'Available' : 'Unavailable'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: systemState.aiProcessing ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="w-full"
                disabled={!systemState.aiProcessing}
              >
                Manage AI Models
              </Button>
            </div>
          </div>
        </Card>
        
        <Card title="Data Flow Control" className="h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${systemState.dataFlow ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{systemState.dataFlow ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={systemState.dataFlow}
                    onChange={() => toggleSystem('dataFlow')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Input Streams</span>
                  <span>{systemState.dataFlow ? '12 Active' : 'Paused'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: systemState.dataFlow ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Data Processing</span>
                  <span>{systemState.dataFlow ? 'Running' : 'Stopped'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ width: systemState.dataFlow ? '78%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Output Channels</span>
                  <span>{systemState.dataFlow ? '8 Active' : 'Closed'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: systemState.dataFlow ? '95%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="w-full"
                disabled={!systemState.dataFlow}
              >
                Configure Data Flows
              </Button>
            </div>
          </div>
        </Card>
        
        <Card title="Autonomous Agents" className="h-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${systemState.autonomousAgents ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{systemState.autonomousAgents ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={systemState.autonomousAgents}
                    onChange={() => toggleSystem('autonomousAgents')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Agents</span>
                  <span>{systemState.autonomousAgents ? '14 Online' : 'All Offline'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: systemState.autonomousAgents ? '88%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Agent Tasks</span>
                  <span>{systemState.autonomousAgents ? '32 Running' : 'None'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ width: systemState.autonomousAgents ? '65%' : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>System Autonomy</span>
                  <span>{systemState.autonomousAgents ? 'Level 3' : 'Disabled'}</span>
                </div>
                <div className="h-1.5 bg-background-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: systemState.autonomousAgents ? '60%' : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="w-full"
                disabled={!systemState.autonomousAgents}
              >
                Manage Agent Controls
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Master Control Section */}
      {showMasterControl && (
        <Card title="Master System Control" className="mb-6">
          <div className="p-4">
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">System Power Level: {powerLevel}%</label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                value={powerLevel}
                onChange={handlePowerChange}
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Eco Mode</span>
                <span>Balanced</span>
                <span>Performance</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Button 
                variant={systemState.aiProcessing ? "primary" : "secondary"}
                className="w-full"
                onClick={() => toggleSystem('aiProcessing')}
              >
                AI Processing
              </Button>
              
              <Button 
                variant={systemState.dataFlow ? "primary" : "secondary"}
                className="w-full"
                onClick={() => toggleSystem('dataFlow')}
              >
                Data Flow
              </Button>
              
              <Button 
                variant={systemState.realTimeAnalytics ? "primary" : "secondary"}
                className="w-full"
                onClick={() => toggleSystem('realTimeAnalytics')}
              >
                Real-Time Analytics
              </Button>
              
              <Button 
                variant={systemState.autonomousAgents ? "primary" : "secondary"}
                className="w-full"
                onClick={() => toggleSystem('autonomousAgents')}
              >
                Autonomous Agents
              </Button>
              
              <Button 
                variant={systemState.notifications ? "primary" : "secondary"}
                className="w-full"
                onClick={() => toggleSystem('notifications')}
              >
                Notifications
              </Button>
              
              <Button 
                variant={systemState.securityMonitoring ? "primary" : "secondary"}
                className="w-full"
                onClick={() => toggleSystem('securityMonitoring')}
              >
                Security Monitoring
              </Button>
              
              <Button 
                variant="secondary"
                className="w-full"
              >
                System Restart
              </Button>
              
              <Button 
                variant="secondary"
                className="w-full text-red-500 hover:bg-red-50"
                onClick={handleEmergencyShutdown}
              >
                Emergency Shutdown
              </Button>
            </div>
            
            <div className="bg-background-elevated p-3 rounded-md text-sm text-text-secondary">
              <p className="font-medium mb-1">System Information:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>Version: 1.0.5</div>
                <div>Build: 20231105-a7f2</div>
                <div>Environment: Production</div>
                <div>Last Updated: 14 hours ago</div>
                <div>Current Load: {powerLevel > 50 ? 'Medium' : 'Low'}</div>
                <div>Status: {Object.values(systemState).every(Boolean) ? 'Fully Operational' : 'Partially Active'}</div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">System Uptime</h3>
              <div className="text-green-500">Active</div>
            </div>
            <div className="text-2xl font-bold mb-1">27 days, 14 hours</div>
            <div className="text-text-secondary text-sm">Since last restart</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Processing Queue</h3>
              <div className="text-blue-500">Normal</div>
            </div>
            <div className="text-2xl font-bold mb-1">12 items</div>
            <div className="text-text-secondary text-sm">Average wait: 1.2s</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Service Status</h3>
              <div className="text-green-500">All Systems Go</div>
            </div>
            <div className="text-2xl font-bold mb-1">24/24</div>
            <div className="text-text-secondary text-sm">Services online</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">System Load</h3>
              <div className="text-yellow-500">Moderate</div>
            </div>
            <div className="text-2xl font-bold mb-1">42%</div>
            <div className="text-text-secondary text-sm">CPU utilization</div>
          </div>
        </Card>
      </div>
    </div>
  );
} 