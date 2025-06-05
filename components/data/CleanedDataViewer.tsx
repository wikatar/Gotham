'use client'

import { useState, useEffect } from 'react'
import Button from '../../app/components/ui/Button'
import Card from '../../app/components/ui/Card'
import { Download, Search, Filter, RefreshCw } from 'lucide-react'

// Simple toast function
const toast = ({ title, description, variant }: { 
  title: string; 
  description: string; 
  variant?: string;
}) => {
  console.log(`${variant === 'destructive' ? 'ERROR' : 'SUCCESS'}: ${title} - ${description}`)
  // In a real app, this would show a proper toast notification
}

interface CleanedDataViewerProps {
  sourceId: string
  pipelineId?: string
}

export default function CleanedDataViewer({ sourceId, pipelineId }: CleanedDataViewerProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [columns, setColumns] = useState<string[]>([])
  const pageSize = 50

  const fetchData = async (page = 1, search = '') => {
    setLoading(true)
    setError(null)
    
    try {
      const requestBody: any = {
        sourceId,
        page,
        limit: pageSize
      }
      
      if (pipelineId) requestBody.pipelineId = pipelineId
      if (search) requestBody.search = search
      
      const response = await fetch('/api/data/cleaned/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const result = await response.json()
      
      if (result.error) {
        setError(result.message || 'Error loading cleaned data')
        setData([])
        setColumns([])
      } else {
        setData(result.data || [])
        setColumns(result.columns || [])
        setTotalRecords(result.total || 0)
        setTotalPages(Math.ceil((result.total || 0) / pageSize))
        setCurrentPage(page)
      }
    } catch (err) {
      console.error('Error fetching cleaned data:', err)
      setError('Failed to load cleaned data')
      setData([])
      setColumns([])
    }
    
    setLoading(false)
  }

  useEffect(() => {
    fetchData(1, searchTerm)
  }, [sourceId, pipelineId])

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
      const requestBody: any = { sourceId }
      if (pipelineId) requestBody.pipelineId = pipelineId
      if (searchTerm) requestBody.search = searchTerm
      
      const response = await fetch('/api/data/cleaned/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cleaned-data-${sourceId}-${Date.now()}.csv`
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
    <Card title="Cleaned Data Viewer">
      <div className="space-y-4">
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
            <p className="text-gray-600">Loading cleaned data...</p>
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