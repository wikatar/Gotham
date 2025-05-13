import AppLayout from '../components/layout/AppLayout'
import DatabaseViewer from '../components/database/DatabaseViewer'

export default function DatabasePage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Database Explorer</h1>
        <p className="text-text-secondary">View, query, and analyze your data structure</p>
      </div>
      
      <DatabaseViewer />
    </AppLayout>
  )
} 