'use client'

import { useState } from 'react'
import { useMission } from '../../lib/missionContext'
import Link from 'next/link'

export default function MissionSelector() {
  const { 
    currentMission, 
    setCurrentMission, 
    missions,
    currentDashboard,
    setCurrentDashboard
  } = useMission()

  const [isOpen, setIsOpen] = useState(false)

  const handleMissionChange = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId)
    if (mission) {
      setCurrentMission(mission)
      
      // Set active dashboard to default or first available
      if (mission.dashboards.length > 0) {
        const defaultDashboard = mission.defaultDashboardId 
          ? mission.dashboards.find(d => d.id === mission.defaultDashboardId)
          : mission.dashboards[0]
          
        if (defaultDashboard) {
          setCurrentDashboard(defaultDashboard)
        }
      } else {
        setCurrentDashboard(null)
      }
    }
    
    setIsOpen(false)
  }

  if (!currentMission) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-background-paper hover:bg-secondary/10 text-text-primary"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{currentMission.name}</span>
          <span className="text-xs text-text-secondary">{currentMission.category}</span>
        </div>
        <span className="text-text-secondary">{isOpen ? "▲" : "▼"}</span>
      </button>
      
      {isOpen && (
        <div className="absolute mt-2 w-64 rounded-md shadow-lg bg-background-elevated z-50 py-1 border border-secondary/20">
          <div className="px-4 py-2 border-b border-secondary/20">
            <div className="text-sm font-medium mb-1">Missions</div>
            <div className="text-xs text-text-secondary">Switch between different workspaces</div>
          </div>
          
          <div className="max-h-64 overflow-y-auto py-1">
            {missions.map(mission => (
              <button
                key={mission.id}
                onClick={() => handleMissionChange(mission.id)}
                className={`w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-secondary/10 ${
                  currentMission.id === mission.id ? 'bg-secondary/20' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${getMissionCategoryColor(mission.category)}`}></div>
                <div>
                  <div className="text-sm">{mission.name}</div>
                  <div className="text-xs text-text-secondary">{mission.description}</div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="border-t border-secondary/20 p-2">
            <Link href="/templates" className="block text-center text-sm py-2 px-4 rounded-md bg-secondary/10 hover:bg-secondary/20 text-text-primary">
              Create New Mission
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to get color based on mission category
function getMissionCategoryColor(category?: string): string {
  switch (category) {
    case 'business':
      return 'bg-blue-500'
    case 'finance':
      return 'bg-green-500'
    case 'hr':
      return 'bg-purple-500'
    case 'marketing':
      return 'bg-yellow-500'
    case 'operations':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
} 