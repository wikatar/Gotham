'use client'

import { useState, useEffect } from 'react'
import DataImporter from '@/components/data/DataImporter'
import DataTableViewer from '@/components/data/DataTableViewer'
import Card from '../components/ui/Card'
import AppLayout from '@/app/components/layout/AppLayout'
import Button from '../components/ui/Button'
import Link from 'next/link'

interface DataSource {
  id: string
  name: string
  recordCount: number
  createdAt: string
  status: string
}

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/data/sources')
      if (response.ok) {
        const data = await response.json()
        setSources(data.sources)
      }
    } catch (error) {
      console.error('Error fetching sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSourceImported = () => {
    fetchSources() // Refresh the list
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Data Sources</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Import Section */}
          <Card title="Import New Data">
            <DataImporter onSourceImported={handleSourceImported} />
          </Card>

          {/* Sources List */}
          <Card title="Existing Data Sources">
            {loading ? (
              <div className="text-center py-8">Loading sources...</div>
            ) : sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map(source => (
                  <div 
                    key={source.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSource(source.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-gray-600">
                          {source.recordCount} records
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(source.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/data-cleaner/${source.id}`}>
                          <Button size="sm" variant="secondary">
                            Clean
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSource(source.id)
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data sources found. Import your first dataset above.
              </div>
            )}
          </Card>
        </div>

        {/* Data Viewer */}
        {selectedSource && (
          <Card title="Data Preview">
            <div className="mb-4">
              <Button 
                variant="secondary" 
                onClick={() => setSelectedSource(null)}
              >
                Close Preview
              </Button>
            </div>
            <DataTableViewer sourceId={selectedSource} />
          </Card>
        )}
      </div>
    </AppLayout>
  )
} 