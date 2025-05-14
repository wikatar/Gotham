/**
 * Component for displaying imported data from the data lake in table form.
 * Inspired by Palantir Foundry / Observable / Retool.
 *
 * Features:
 * - Fetches rows from a specific data source (dataSourceId)
 * - Displays columns dynamically (from JSON field)
 * - Filter field for easy searching
 * - Export to CSV
 *
 * Design goals:
 * - Scalable to large datasets
 * - Fits into our current design style (Next.js + Tailwind + shadcn/ui)
 * - Highest level of usability and aesthetics (Palantir-vibe)
 */

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'

export default function DataTableViewer({ sourceId }: { sourceId: string }) {
  const [rows, setRows] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/data/source/${sourceId}`)
      .then((res) => res.json())
      .then((data) => {
        setRows(data.rows)
        if (data.rows.length > 0) {
          setColumns(Object.keys(data.rows[0].row))
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error fetching data',
          description: 'Could not load data from source',
          variant: 'destructive',
        })
        setLoading(false)
      })
  }, [sourceId])

  const filteredRows = rows.filter((r) =>
    JSON.stringify(r.row).toLowerCase().includes(filter.toLowerCase())
  )

  const exportCSV = () => {
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
    link.setAttribute('download', `datasource-${sourceId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Data Preview</h1>

      <div className="flex gap-2 items-center">
        <Input
          className="w-full"
          placeholder="🔍 Filter rows..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button variant="secondary" onClick={exportCSV} disabled={rows.length === 0}>
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading data...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8">No data found for this source</div>
      ) : (
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
              {filteredRows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  {columns.map((c) => (
                    <td key={c} className="p-2 border-b border-muted truncate max-w-[200px]">
                      {row.row[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {filteredRows.length} of {rows.length} rows
      </div>
    </div>
  )
} 