'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import DataTableViewer from '@/components/data/DataTableViewer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DataSource {
  id: string
  name: string
  recordCount: number
  importedAt: string
  accountId: string
}

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data/sources')
      .then(res => res.json())
      .then(data => {
        setSources(data.sources)
        if (data.sources.length > 0) {
          setSelectedSource(data.sources[0].id)
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data sources:', error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <Link href="/data-import">
          <Button>Import New Data</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">Available Sources</h2>
            {loading ? (
              <div className="text-center py-4">Loading sources...</div>
            ) : sources.length === 0 ? (
              <div className="text-center py-4">
                No data sources available.
                <div className="mt-2">
                  <Link href="/data-import">
                    <Button variant="outline" size="sm">Import Data</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {sources.map(source => (
                  <div 
                    key={source.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-muted/50 ${
                      selectedSource === source.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedSource(source.id)}
                  >
                    <div className="font-medium">{source.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {source.recordCount} records • {new Date(source.importedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-3">
          {selectedSource ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Link href={`/data-cleaner/${selectedSource}`}>
                    <Button variant="outline" size="sm">
                      <span className="mr-1">🧼</span> Clean Data
                    </Button>
                  </Link>
                </div>
              </div>
              <DataTableViewer sourceId={selectedSource} />
            </div>
          ) : (
            <Card className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">No Data Source Selected</h2>
              <p className="text-muted-foreground">
                Select a data source from the sidebar to view its data
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 