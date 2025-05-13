'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTARS } from '../../lib/tarsContext'
import EnhancedTARSAssistant from './EnhancedTARSAssistant'

interface TARSControllerProps {
  externalExpanded?: boolean;
}

export default function TARSController({ externalExpanded }: TARSControllerProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [showInfoBadge, setShowInfoBadge] = useState(false)
  const pathname = usePathname()
  
  const { 
    isExpanded, 
    expandTARS, 
    toggleTARS,
    trustLevel 
  } = useTARS()
  
  // Check if should show info badge (client-side only)
  useEffect(() => {
    const introShown = localStorage.getItem('tars-intro-shown')
    setShowInfoBadge(!introShown)
  }, [])
  
  // Update expanded state if external prop changes
  useEffect(() => {
    if (externalExpanded !== undefined && externalExpanded) {
      expandTARS()
    }
  }, [externalExpanded, expandTARS])

  // When first visiting AI insights, show TARS expanded
  useEffect(() => {
    if (pathname === '/ai-insights' && !sessionStorage.getItem('tars-shown-ai-insights')) {
      // Open TARS automatically only once per session on AI insights page
      expandTARS()
      sessionStorage.setItem('tars-shown-ai-insights', 'true')
    }
  }, [pathname, expandTARS])
  
  // Handler for keyboard shortcut to toggle TARS
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt+T to toggle TARS
      if (e.altKey && e.key === 't') {
        toggleTARS()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [toggleTARS])
  
  const hideInfoBadge = () => {
    localStorage.setItem('tars-intro-shown', 'true')
    setShowInfoBadge(false)
    expandTARS()
  }
  
  return (
    <>
      {/* Side indicator that's always visible when collapsed */}
      {!isExpanded && isSidebarVisible && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-background-paper border-l border-t border-b border-secondary/20 rounded-l-md p-2 cursor-pointer z-40"
          onClick={expandTARS}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold">T</span>
            </div>
            <div className="text-xs text-text-secondary rotate-90 whitespace-nowrap mt-8">TARS READY</div>
          </div>
        </div>
      )}
      
      <EnhancedTARSAssistant />
      
      {/* Add an info badge on first visit */}
      {showInfoBadge && (
        <div className="fixed bottom-28 right-28 bg-accent text-white text-xs px-3 py-1 rounded-full animate-bounce z-50"
          onClick={hideInfoBadge}
        >
          Press Alt+T for TARS
        </div>
      )}
    </>
  )
} 