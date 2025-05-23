'use client'

import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function AnomaliesPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Anomaly Detection</h1>
        <p className="text-text-secondary">Monitor and investigate anomalies across your data sources</p>
      </div>
      
      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Active Anomalies" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Active Anomalies</div>
          <div className="text-3xl font-bold text-red-500">7</div>
        </Card>
        
        <Card title="Resolved Today" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Resolved Today</div>
          <div className="text-3xl font-bold text-green-500">15</div>
        </Card>
        
        <Card title="Detection Rate" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Detection Accuracy</div>
          <div className="text-3xl font-bold text-blue-500">94%</div>
        </Card>
        
        <Card title="Avg Resolution" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Average Resolution</div>
          <div className="text-3xl font-bold text-purple-500">2.4h</div>
        </Card>
      </div>

      {/* Active Anomalies */}
      <Card title="Active Anomalies" className="mb-6">
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-red-800">Unusual Traffic Pattern</div>
                  <div className="text-sm text-red-600">Website traffic dropped 45% in the last hour</div>
                  <div className="text-xs text-red-500 mt-1">Detected 23 minutes ago</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">Investigate</Button>
                <Button variant="primary" size="sm">Resolve</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-yellow-800">Database Query Performance</div>
                  <div className="text-sm text-yellow-600">Query response time increased by 200%</div>
                  <div className="text-xs text-yellow-500 mt-1">Detected 1 hour ago</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">Investigate</Button>
                <Button variant="primary" size="sm">Resolve</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-orange-800">Customer Churn Spike</div>
                  <div className="text-sm text-orange-600">Cancellation rate 3x higher than normal</div>
                  <div className="text-xs text-orange-500 mt-1">Detected 2 hours ago</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">Investigate</Button>
                <Button variant="primary" size="sm">Resolve</Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Detection Timeline">
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">Today</div>
                <div className="text-sm text-text-secondary">22 detected • 15 resolved</div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">Yesterday</div>
                <div className="text-sm text-text-secondary">31 detected • 29 resolved</div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '94%'}}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">This Week</div>
                <div className="text-sm text-text-secondary">187 detected • 172 resolved</div>
              </div>
              <div className="w-full bg-secondary/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Top Data Sources">
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">User Database</div>
                  <div className="text-sm text-text-secondary">3 anomalies today</div>
                </div>
                <div className="text-red-500">🔴</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Payment System</div>
                  <div className="text-sm text-text-secondary">2 anomalies today</div>
                </div>
                <div className="text-yellow-500">🟡</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Analytics API</div>
                  <div className="text-sm text-text-secondary">1 anomaly today</div>
                </div>
                <div className="text-yellow-500">🟡</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Service</div>
                  <div className="text-sm text-text-secondary">0 anomalies today</div>
                </div>
                <div className="text-green-500">🟢</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">File Storage</div>
                  <div className="text-sm text-text-secondary">0 anomalies today</div>
                </div>
                <div className="text-green-500">🟢</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
} 