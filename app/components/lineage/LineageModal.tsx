'use client'

import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { 
  GitBranch, 
  Calendar,
  Filter,
  X,
  Eye
} from 'lucide-react'
import { LineageVisualization } from './LineageVisualization'
import { useLineage } from '@/app/hooks/useLineage'

interface LineageModalProps {
  trigger: React.ReactNode
  entityId?: string
  pipelineId?: string
  agentId?: string
  title?: string
  description?: string
}

export function LineageModal({ 
  trigger, 
  entityId, 
  pipelineId, 
  agentId, 
  title = "Data Lineage",
  description 
}: LineageModalProps) {
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState('7d')
  const [stepFilter, setStepFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const { steps, loading, error, refresh } = useLineage({
    entityId,
    pipelineId,
    agentId,
    enabled: open
  })

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      refresh()
    }
  }

  // Filter steps based on selected filters
  const filteredSteps = steps.filter(step => {
    const stepDate = new Date(step.createdAt)
    const now = new Date()
    
    // Date filter
    if (dateRange !== 'all') {
      const days = parseInt(dateRange.replace('d', ''))
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      if (stepDate < cutoff) return false
    }
    
    // Step filter
    if (stepFilter !== 'all' && step.step !== stepFilter) return false
    
    // Source filter
    if (sourceFilter !== 'all' && step.source !== sourceFilter) return false
    
    return true
  })

  const uniqueSteps = [...new Set(steps.map(s => s.step))]
  const uniqueSources = [...new Set(steps.map(s => s.source))]

  return (
    <>
      <div onClick={() => handleOpenChange(true)}>
        {trigger}
      </div>
      
      <Modal
        isOpen={open}
        onClose={() => handleOpenChange(false)}
        title={
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            {title}
          </div>
        }
        size="xl"
      >
        <div className="p-6">
          {description && (
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="1d">Senaste dagen</option>
                <option value="7d">Senaste veckan</option>
                <option value="30d">Senaste månaden</option>
                <option value="all">Alla</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                value={stepFilter} 
                onChange={(e) => setStepFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">Alla steg</option>
                {uniqueSteps.map(step => (
                  <option key={step} value={step}>{step}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <select 
                value={sourceFilter} 
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">Alla källor</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            {(dateRange !== '7d' || stepFilter !== 'all' || sourceFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateRange('7d')
                  setStepFilter('all')
                  setSourceFilter('all')
                }}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Rensa filter
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="outline">
              {filteredSteps.length} av {steps.length} steg
            </Badge>
            {filteredSteps.length !== steps.length && (
              <span className="text-sm text-gray-600">
                {steps.length - filteredSteps.length} steg filtrerade bort
              </span>
            )}
          </div>

          {/* Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Laddar lineage-data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 mb-2">Fel vid laddning av lineage-data</p>
                  <p className="text-sm text-gray-600">{error}</p>
                  <Button variant="outline" size="sm" onClick={refresh} className="mt-4">
                    Försök igen
                  </Button>
                </div>
              </div>
            ) : filteredSteps.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">🫥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Inga transformationssteg hittades
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {steps.length === 0 
                      ? "Inga transformationssteg har loggats än för denna entitet/agent."
                      : "Inga steg matchar de valda filtren."
                    }
                  </p>
                  {steps.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Kör en pipeline eller agent för att generera lineage-data.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <LineageVisualization
                entityId={entityId}
                pipelineId={pipelineId}
                steps={filteredSteps}
                title=""
                showFilters={false}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  )
} 