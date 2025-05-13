'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTARS } from '../../lib/tarsContext'

export default function TARSStatus() {
  const [status, setStatus] = useState<'active' | 'analyzing' | 'idle'>('idle')
  const [statusMessage, setStatusMessage] = useState('Ready for analysis')
  const pathname = usePathname()
  const { expandTARS, currentContext, trustLevel } = useTARS()
  
  // Simulate TARS actively working on the current page context
  useEffect(() => {
    // When page changes, show TARS as analyzing
    setStatus('analyzing')
    setStatusMessage('Processing context...')
    
    // After a delay, show as active with context-aware message
    const timer = setTimeout(() => {
      setStatus('active')
      
      // Set context-aware message
      if (pathname === '/') {
        setStatusMessage('Dashboard metrics analyzed')
      } else if (pathname === '/globe') {
        setStatusMessage('Geographic patterns identified')
      } else if (pathname === '/database') {
        setStatusMessage('Schema relationships mapped')
      } else if (pathname === '/ai-insights') {
        setStatusMessage('Insights ready for review')
      } else {
        setStatusMessage('Ready for analysis')
      }
    }, 1200)
    
    return () => clearTimeout(timer)
  }, [pathname])
  
  // Occasionally show TARS as "actively analyzing" to make it feel alive
  useEffect(() => {
    const randomActivityInterval = setInterval(() => {
      // 10% chance of showing TARS as analyzing random data
      if (Math.random() < 0.1) {
        setStatus('analyzing')
        
        const analysisMessages = [
          'Scanning data patterns...',
          'Correlating variables...',
          'Checking anomalies...',
          'Updating prediction models...'
        ]
        
        setStatusMessage(analysisMessages[Math.floor(Math.random() * analysisMessages.length)])
        
        // Return to active state after a short delay
        setTimeout(() => {
          setStatus('active')
          if (pathname === '/') {
            setStatusMessage('Dashboard metrics analyzed')
          } else if (pathname === '/globe') {
            setStatusMessage('Geographic patterns identified')
          } else if (pathname === '/database') {
            setStatusMessage('Schema relationships mapped')
          } else if (pathname === '/ai-insights') {
            setStatusMessage('Insights ready for review')
          } else {
            setStatusMessage('Ready for analysis')
          }
        }, 2000)
      }
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(randomActivityInterval)
  }, [pathname])
  
  return (
    <button 
      onClick={expandTARS}
      className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-secondary/10 transition-colors"
    >
      <div className="relative">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center bg-primary`}>
          <span className="text-xs font-bold">T</span>
        </div>
        <div 
          className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full ${
            status === 'analyzing' 
              ? 'bg-accent animate-pulse' 
              : status === 'active' 
                ? 'bg-green-500' 
                : 'bg-gray-400'
          }`}
        />
      </div>
      <div>
        <div className="text-xs font-medium">TARS</div>
        <div className="text-xs text-text-secondary max-w-[200px] truncate">
          {statusMessage}
        </div>
      </div>
    </button>
  )
} 