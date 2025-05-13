'use client'

import { useState } from 'react'
import { useMission } from '../../lib/missionContext'

export default function DataSourceSelector() {
  const { 
    currentMission, 
    activeDataSources, 
    toggleDataSource
  } = useMission()

  const [isOpen, setIsOpen] = useState(false)

  if (!currentMission) return null

  const dataSources = currentMission.dataSources
  
  const activeCount = activeDataSources.length
  const totalCount = dataSources.length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-background-paper hover:bg-secondary/10 text-text-primary"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">
            Data Sources <span className="text-text-secondary">{activeCount}/{totalCount}</span>
          </span>
          <span className="text-xs text-text-secondary">
            {activeCount === 0 
              ? 'No data sources selected' 
              : activeCount === totalCount 
                ? 'All data sources active' 
                : `${activeCount} sources active`}
          </span>
        </div>
        <span className="text-text-secondary">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="absolute mt-2 w-64 rounded-md shadow-lg bg-background-elevated z-50 py-1 border border-secondary/20">
          <div className="px-4 py-2 border-b border-secondary/20">
            <div className="text-sm font-medium mb-1">Data Sources</div>
            <div className="text-xs text-text-secondary">Select which data to visualize</div>
          </div>
          
          <div className="max-h-64 overflow-y-auto py-1">
            {dataSources.length > 0 ? (
              dataSources.map(dataSource => (
                <div key={dataSource.id} className="px-4 py-2 hover:bg-secondary/10">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeDataSources.includes(dataSource.id)}
                      onChange={() => toggleDataSource(dataSource.id)}
                      className="form-checkbox h-4 w-4 text-accent rounded border-secondary/40"
                    />
                    <div>
                      <div className="text-sm">{dataSource.name}</div>
                      <div className="text-xs text-text-secondary flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getDataSourceStatusColor(dataSource.status)}`}></div>
                        <span className="capitalize">{dataSource.type}</span>
                        {dataSource.lastUpdated && (
                          <span className="ml-2">
                            {new Date(dataSource.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-text-secondary">
                No data sources available
                <div className="mt-2">
                  <a href="/data-sources" className="text-accent hover:underline">
                    Add Data Source
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-secondary/20 p-2 flex space-x-2">
            <button
              onClick={() => {
                dataSources.forEach(ds => {
                  if (!activeDataSources.includes(ds.id)) {
                    toggleDataSource(ds.id)
                  }
                })
              }}
              className="flex-1 text-center text-sm py-1 px-2 rounded-md bg-secondary/10 hover:bg-secondary/20 text-text-primary"
            >
              Select All
            </button>
            <button
              onClick={() => {
                activeDataSources.forEach(dsId => {
                  toggleDataSource(dsId)
                })
              }}
              className="flex-1 text-center text-sm py-1 px-2 rounded-md bg-secondary/10 hover:bg-secondary/20 text-text-primary"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function for data source status
function getDataSourceStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'inactive':
      return 'bg-gray-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-yellow-500'
  }
} 