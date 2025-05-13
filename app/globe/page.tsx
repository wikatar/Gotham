import AppLayout from '../components/layout/AppLayout'
import CDNGlobe from '../components/globe/CDNGlobe'

export default function GlobePage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Global Data Visualization</h1>
        <p className="text-text-secondary">Visualize and analyze data across geographical locations</p>
      </div>
      
      <div className="h-[calc(100vh-200px)]">
        <CDNGlobe />
      </div>
    </AppLayout>
  )
} 