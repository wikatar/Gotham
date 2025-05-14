'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { GlobeIcon, LightbulbIcon } from 'lucide-react'

export default function CleanedDataViewer({
  sourceId,
  pipelineId,
}: {
  sourceId: string
  pipelineId: string
}) {
  const [rows, setRows] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/data/cleaned/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, pipelineId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRows(data.rows)
        if (data.rows.length > 0) {
          setColumns(Object.keys(data.rows[0].row))
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching cleaned data:', error)
        toast({
          title: 'Error fetching data',
          description: 'Could not load cleaned data rows',
          variant: 'destructive',
        })
        setLoading(false)
      })
  }, [sourceId, pipelineId])

  const filteredRows = rows.filter((r) =>
    JSON.stringify(r.row).toLowerCase().includes(filter.toLowerCase())
  )

  const exportCSV = () => {
    if (columns.length === 0 || filteredRows.length === 0) {
      toast({
        title: 'Cannot export',
        description: 'No data available to export',
        variant: 'destructive',
      })
      return
    }

    try {
      const csv = [
        columns.join(','),
        ...filteredRows.map((r) =>
          columns.map((c) => `"${(r.row[c] ?? '').toString().replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cleaned-${pipelineId}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Export successful',
        description: `Exported ${filteredRows.length} rows to CSV`,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: 'Export failed',
        description: (error as Error).message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cleaned Data</h1>
        
        <div className="flex gap-2">
          <Link href={`/data-analytics/${sourceId}/${pipelineId}`}>
            <Button variant="default" className="flex items-center gap-2">
              <GlobeIcon className="h-4 w-4" />
              Analyze Data
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <Input
          className="w-full"
          placeholder="🔍 Filter rows..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={loading || rows.length === 0}
        />
        <Button 
          variant="secondary" 
          onClick={exportCSV}
          disabled={loading || rows.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : rows.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No cleaned data available for this pipeline.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-auto max-h-[600px]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="text-left p-2 border-b bg-muted/20 sticky top-0">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice(0, 100).map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    {columns.map((c) => (
                      <td key={c} className="p-2 border-b border-muted truncate max-w-[200px]">
                        {typeof row.row[c] === 'string' ? row.row[c] : JSON.stringify(row.row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(filteredRows.length, 100)} of {filteredRows.length} rows
            {filteredRows.length !== rows.length && ` (filtered from ${rows.length} total)`}
          </div>
        </>
      )}
    </div>
  )
} 