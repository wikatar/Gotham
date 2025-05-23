'use client'

import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-text-secondary">Configure your Monolith Analytics system preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card title="Account Settings">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Organization Name</label>
              <input 
                type="text" 
                defaultValue="Acme Corporation"
                className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Time Zone</label>
              <select className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+1 (Central European Time)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary">
                <option>English</option>
                <option>Svenska</option>
                <option>Español</option>
                <option>Français</option>
              </select>
            </div>

            <Button variant="primary">Save Account Settings</Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card title="Notification Settings">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Agent Alerts</div>
                <div className="text-sm text-text-secondary">Get notified when agents complete actions</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Anomaly Detection</div>
                <div className="text-sm text-text-secondary">Alert when anomalies are detected</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">System Updates</div>
                <div className="text-sm text-text-secondary">Notifications about system maintenance</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Reports</div>
                <div className="text-sm text-text-secondary">Receive weekly performance summaries</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <Button variant="primary">Save Notification Settings</Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card title="Security Settings">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <div className="flex">
                <input 
                  type="password" 
                  defaultValue="sk_live_abc123def456..."
                  className="flex-1 p-2 border border-secondary/30 rounded-l focus:outline-none focus:border-primary"
                  readOnly
                />
                <Button variant="secondary" className="rounded-l-none">Regenerate</Button>
              </div>
              <div className="text-xs text-text-secondary mt-1">Keep your API key secure and never share it</div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-text-secondary">Add an extra layer of security</div>
              </div>
              <Button variant="secondary" size="sm">Enable 2FA</Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout</label>
              <select className="w-full p-2 border border-secondary/30 rounded focus:outline-none focus:border-primary">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
                <option>8 hours</option>
                <option>Never</option>
              </select>
            </div>

            <Button variant="primary">Save Security Settings</Button>
          </div>
        </Card>

        {/* System Information */}
        <Card title="System Information">
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Version</span>
              <span className="text-sm text-text-secondary">v1.0.0</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Updated</span>
              <span className="text-sm text-text-secondary">2024-01-15</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Database Status</span>
              <span className="text-sm text-green-500">Connected</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">API Status</span>
              <span className="text-sm text-green-500">Operational</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-text-secondary">23.4 GB / 100 GB</span>
            </div>

            <div className="w-full bg-secondary/20 rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{width: '23.4%'}}></div>
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="secondary" className="w-full">Download System Logs</Button>
              <Button variant="secondary" className="w-full">Export Configuration</Button>
              <Button variant="danger" className="w-full">Reset to Factory Settings</Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
} 