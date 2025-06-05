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

import { useState, useEffect } from 'react'
import Button from '../../app/components/ui/Button'
import Card from '../../app/components/ui/Card'
import { Search, Download, RefreshCw, Filter } from 'lucide-react'

// Simple toast function
const toast = ({ title, description, variant }: { 
  title: string; 
  description: string; 
  variant?: string;
}) => {
  console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`)
  // In a real app, this would show a proper toast notification
}

interface DataTableViewerProps {
  sourceId: string
}

export default function DataTableViewer({ sourceId }: DataTableViewerProps) {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [sourceInfo, setSourceInfo] = useState<any>(null)
  const pageSize = 50

  const fetchData = async (page = 1, search = '') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/data/source/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          page,
          limit: pageSize,
          search
        }),
      })
      
      const result = await response.json()
      
      if (result.error) {
        setError(result.message || 'Error loading data')
        setData([])
        setColumns([])
      } else {
        setData(result.data || [])
        setColumns(result.columns || [])
        setTotalRecords(result.total || 0)
        setTotalPages(Math.ceil((result.total || 0) / pageSize))
        setCurrentPage(page)
        setSourceInfo(result.sourceInfo)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
      setData([])
      setColumns([])
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData(1, searchTerm)
  }, [sourceId])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchData(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage, searchTerm)
    }
  }

  const downloadData = async () => {
    try {
      const response = await fetch('/api/data/source/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId,
          search: searchTerm
        }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `data-${sourceId}-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast({
          title: 'Success',
          description: 'Data exported successfully'
        })
      } else {
        throw new Error('Export failed')
      }
    } catch (err) {
      console.error('Error exporting data:', err)
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card title="Data Table Viewer">
      <div className="space-y-4">
        {/* Source Info */}
        {sourceInfo && (
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">Source: {sourceInfo.name}</h4>
            <p className="text-sm text-gray-600">
              {sourceInfo.recordCount?.toLocaleString()} total records • {columns.length} columns
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              variant="secondary"
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => fetchData(currentPage, searchTerm)}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={downloadData}
              disabled={loading || data.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        {totalRecords > 0 && (
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords.toLocaleString()} records
            {searchTerm && ` (filtered)`}
          </div>
        )}

        {/* Data Table */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium mb-2">Could not load data</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={() => fetchData(currentPage, searchTerm)}>
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No data available</p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {row[column] !== null && row[column] !== undefined 
                            ? String(row[column]) 
                            : '-'
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
} 