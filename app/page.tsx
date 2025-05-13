import AppLayout from './components/layout/AppLayout'
import ChartWidget from './components/dashboard/ChartWidget'
import StatsCard from './components/dashboard/StatsCard'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Analytics overview and key metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Revenue" 
          value="$1,234,567" 
          change={{ value: 12.5, isPositive: true }}
          icon="💰"
        />
        <StatsCard 
          title="Active Users" 
          value="24,789" 
          change={{ value: 8.3, isPositive: true }}
          icon="👥"
        />
        <StatsCard 
          title="Order Completion" 
          value="87.2%" 
          change={{ value: 2.1, isPositive: true }}
          icon="📦"
        />
        <StatsCard 
          title="Avg. Response Time" 
          value="1.8s" 
          change={{ value: 0.3, isPositive: false }}
          icon="⏱️"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartWidget title="Revenue Trends" initialChartType="line" />
        <ChartWidget title="User Acquisition" initialChartType="bar" dataKey="count" />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ChartWidget title="Overall Performance" initialChartType="area" className="h-80" />
      </div>
    </AppLayout>
  )
} 