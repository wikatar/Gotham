import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function GlobePage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Global Data Visualization</h1>
        <p className="text-text-secondary">Visualize and analyze data across geographical locations</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card title="Location Categories" className="mb-4">
          <div className="flex space-x-2 mb-4">
            <Button variant="primary">All</Button>
            <Button variant="secondary">Office</Button>
            <Button variant="secondary">Warehouse</Button>
            <Button variant="secondary">Partner</Button>
          </div>
          
          <p className="text-text-secondary mb-4">
            Filter locations by category to focus on specific types of facilities in your network.
          </p>
        </Card>
        
        <Card title="Global Data Map" className="mb-4">
          <div className="h-96 w-full bg-background-elevated rounded-lg flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-medium mb-2">3D Globe Visualization</h3>
              <p className="text-text-secondary mb-4">
                Interactive globe visualization is currently being updated to resolve compatibility issues.
              </p>
              <div className="space-y-2 text-left max-w-lg mx-auto">
                <div className="p-3 bg-background rounded-lg">
                  <strong className="block mb-1">New York</strong>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Office</span>
                    <span>84</span>
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <strong className="block mb-1">London</strong>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Office</span>
                    <span>93</span>
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <strong className="block mb-1">Sydney</strong>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Warehouse</span>
                    <span>39</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Connection Analysis" className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Active Connections</h3>
            <Button variant="secondary" size="sm">Show All</Button>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-background rounded-lg">
              <div className="flex justify-between mb-2">
                <span>New York → Sydney</span>
                <span className="text-info">Active</span>
              </div>
              <div className="w-full h-2 bg-background-elevated rounded-full">
                <div className="h-full bg-info rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            
            <div className="p-3 bg-background rounded-lg">
              <div className="flex justify-between mb-2">
                <span>London → Singapore</span>
                <span className="text-info">Active</span>
              </div>
              <div className="w-full h-2 bg-background-elevated rounded-full">
                <div className="h-full bg-info rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="p-3 bg-background rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Los Angeles → Tokyo</span>
                <span className="text-info">Active</span>
              </div>
              <div className="w-full h-2 bg-background-elevated rounded-full">
                <div className="h-full bg-info rounded-full" style={{ width: '63%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
} 