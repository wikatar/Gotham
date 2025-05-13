import AppLayout from '../components/layout/AppLayout'
import AIInsightsPanel from '../components/analytics/AIInsightsPanel'

export default function AIInsightsPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">AI Insights</h1>
        <p className="text-text-secondary">Leverage AI to gain actionable insights from your data</p>
      </div>
      
      <AIInsightsPanel />
    </AppLayout>
  )
} 