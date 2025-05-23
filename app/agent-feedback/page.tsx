'use client'

import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'

export default function AgentFeedbackPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Agent Feedback</h1>
        <p className="text-text-secondary">Monitor and analyze feedback on agent performance</p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Feedback" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Total Feedback</div>
          <div className="text-3xl font-bold text-primary">247</div>
        </Card>
        
        <Card title="Average Rating" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Average Rating</div>
          <div className="text-3xl font-bold text-green-500">4.2</div>
        </Card>
        
        <Card title="Effectiveness Rate" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">Actions Effective</div>
          <div className="text-3xl font-bold text-blue-500">87%</div>
        </Card>
        
        <Card title="This Week" className="flex flex-col">
          <div className="text-text-secondary text-sm mb-1">New Feedback</div>
          <div className="text-3xl font-bold text-yellow-500">23</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Feedback">
          <div className="p-4">
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Sales Pipeline Agent</div>
                  <div className="flex">
                    {'★'.repeat(5).split('').map((star, i) => (
                      <span key={i} className={i < 4 ? 'text-yellow-500' : 'text-gray-300'}>{star}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-secondary">"Excellent automation of follow-up emails. Saved 2 hours daily."</p>
                <div className="text-xs text-text-secondary mt-2">2 hours ago</div>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Customer Support Agent</div>
                  <div className="flex">
                    {'★'.repeat(5).split('').map((star, i) => (
                      <span key={i} className={i < 3 ? 'text-yellow-500' : 'text-gray-300'}>{star}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-secondary">"Good response time but needs better context understanding."</p>
                <div className="text-xs text-text-secondary mt-2">5 hours ago</div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Data Analysis Agent</div>
                  <div className="flex">
                    {'★'.repeat(5).split('').map((star, i) => (
                      <span key={i} className={i < 5 ? 'text-yellow-500' : 'text-gray-300'}>{star}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-secondary">"Perfect insights generation. Exactly what we needed."</p>
                <div className="text-xs text-text-secondary mt-2">1 day ago</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Agent Performance Trends">
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Sales Pipeline Agent</span>
                  <span className="text-sm text-green-500">↗ +0.3</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <div className="text-xs text-text-secondary mt-1">4.2/5 average • 89% effective</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Customer Support Agent</span>
                  <span className="text-sm text-blue-500">→ 0.0</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>
                <div className="text-xs text-text-secondary mt-1">3.5/5 average • 76% effective</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Data Analysis Agent</span>
                  <span className="text-sm text-green-500">↗ +0.5</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '95%'}}></div>
                </div>
                <div className="text-xs text-text-secondary mt-1">4.8/5 average • 94% effective</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Email Marketing Agent</span>
                  <span className="text-sm text-yellow-500">↘ -0.2</span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                <div className="text-xs text-text-secondary mt-1">3.0/5 average • 67% effective</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
} 