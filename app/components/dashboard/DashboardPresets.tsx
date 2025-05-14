'use client'

import { useState } from 'react'
import { useMission } from '../../lib/missionContext'
import Button from '../ui/Button'

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DashboardPresets() {
  const { 
    currentDashboard, 
    applyPreset, 
    saveCurrentAsPreset 
  } = useMission()

  const [isOpen, setIsOpen] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')
  const [isCreatingPreset, setIsCreatingPreset] = useState(false)

  if (!currentDashboard) return null

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      saveCurrentAsPreset(newPresetName.trim())
      setNewPresetName('')
      setIsCreatingPreset(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-background-paper hover:bg-secondary/10 text-text-primary"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">
            {currentDashboard.activePreset || 'Default View'}
          </span>
          <span className="text-xs text-text-secondary">Dashboard Preset</span>
        </div>
        <span className="text-text-secondary">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="absolute mt-2 right-0 w-64 rounded-md shadow-lg bg-background-elevated z-50 py-1 border border-secondary/20">
          <div className="px-4 py-2 border-b border-secondary/20">
            <div className="text-sm font-medium mb-1">Dashboard Presets</div>
            <div className="text-xs text-text-secondary">Save and load custom views</div>
          </div>
          
          <div className="max-h-64 overflow-y-auto py-1">
            {currentDashboard.presets.length > 0 ? (
              currentDashboard.presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    applyPreset(preset.name)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-secondary/10 ${
                    currentDashboard.activePreset === preset.name ? 'bg-secondary/20' : ''
                  }`}
                >
                  <div className="text-sm">{preset.name}</div>
                  <div className="text-xs text-text-secondary">
                    {formatDate(new Date(preset.createdAt))}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-text-secondary">
                No saved presets yet
              </div>
            )}
          </div>
          
          <div className="border-t border-secondary/20 p-2">
            {isCreatingPreset ? (
              <div className="p-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset name"
                  className="w-full px-3 py-2 mb-2 bg-background rounded-md border border-secondary/40 focus:border-accent focus:outline-none text-sm"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSavePreset}
                    disabled={!newPresetName.trim()}
                    className="flex-1 text-sm"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreatingPreset(false)
                      setNewPresetName('')
                    }}
                    className="flex-1 text-sm bg-secondary/20 hover:bg-secondary/30"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingPreset(true)}
                className="w-full text-center text-sm py-2 px-4 rounded-md bg-secondary/10 hover:bg-secondary/20 text-text-primary"
              >
                Save Current View
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 