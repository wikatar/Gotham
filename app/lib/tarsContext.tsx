'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface TARSContextType {
  isExpanded: boolean
  expandTARS: () => void
  collapseTARS: () => void
  toggleTARS: () => void
  currentContext: string
  trustLevel: number
  suggestQuery: (query: string) => void
}

const TARSContext = createContext<TARSContextType | undefined>(undefined)

export function useTARS() {
  const context = useContext(TARSContext)
  if (context === undefined) {
    throw new Error('useTARS must be used within a TARSProvider')
  }
  return context
}

interface TARSProviderProps {
  children: ReactNode
}

export function TARSProvider({ children }: TARSProviderProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentContext, setCurrentContext] = useState('Gotham Analytics')
  const [trustLevel, setTrustLevel] = useState(85)
  const [suggestedQuery, setSuggestedQuery] = useState<string | null>(null)
  const pathname = usePathname()
  
  // Function to expand TARS
  const expandTARS = () => setIsExpanded(true)
  
  // Function to collapse TARS
  const collapseTARS = () => setIsExpanded(false)
  
  // Function to toggle TARS
  const toggleTARS = () => setIsExpanded(prev => !prev)
  
  // Function to suggest a query to TARS
  const suggestQuery = (query: string) => setSuggestedQuery(query)
  
  // Update context and trust level based on current page
  useEffect(() => {
    // Set context based on current page
    if (pathname === '/') {
      setCurrentContext('Dashboard')
      setTrustLevel(88)
    } else if (pathname === '/globe') {
      setCurrentContext('Global Intelligence')
      setTrustLevel(82)
    } else if (pathname === '/database') {
      setCurrentContext('Database Explorer')
      setTrustLevel(90)
    } else if (pathname === '/ai-insights') {
      setCurrentContext('AI Insights')
      setTrustLevel(95)
    } else {
      setCurrentContext('Gotham Analytics')
      setTrustLevel(85)
    }
  }, [pathname])
  
  const value = {
    isExpanded,
    expandTARS,
    collapseTARS,
    toggleTARS,
    currentContext,
    trustLevel,
    suggestQuery
  }
  
  return (
    <TARSContext.Provider value={value}>
      {children}
    </TARSContext.Provider>
  )
} 