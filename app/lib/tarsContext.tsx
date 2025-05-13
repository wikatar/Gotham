'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

interface TARSInstance {
  id: string;
  isExpanded: boolean;
  position?: { x: number, y: number };
  conversationId?: string;
}

interface TARSContextType {
  instances: TARSInstance[];
  isExpanded: boolean;
  expandTARS: () => void;
  collapseTARS: () => void;
  toggleTARS: () => void;
  currentContext: string;
  trustLevel: number;
  suggestQuery: (query: string) => void;
  createNewInstance: () => void;
  closeInstance: (id: string) => void;
  expandInstance: (id: string) => void;
  collapseInstance: (id: string) => void;
  updateInstancePosition: (id: string, position: { x: number, y: number }) => void;
  activeInstanceId: string | null;
  setActiveInstanceId: (id: string | null) => void;
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
  const [instances, setInstances] = useState<TARSInstance[]>([])
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null)
  const pathname = usePathname()
  
  // Initialize with one instance on mount (client-side only)
  useEffect(() => {
    if (instances.length === 0) {
      const initialInstanceId = uuidv4()
      setInstances([
        {
          id: initialInstanceId,
          isExpanded: false,
          position: { x: window.innerWidth - 420, y: window.innerHeight - 620 }
        }
      ])
      setActiveInstanceId(initialInstanceId)
    }
  }, [instances.length])

  // Function to expand TARS (legacy support for main instance)
  const expandTARS = () => {
    setIsExpanded(true)
    if (activeInstanceId) {
      expandInstance(activeInstanceId)
    }
  }
  
  // Function to collapse TARS (legacy support for main instance)
  const collapseTARS = () => {
    setIsExpanded(false)
    if (activeInstanceId) {
      collapseInstance(activeInstanceId)
    }
  }
  
  // Function to toggle TARS (legacy support for main instance)
  const toggleTARS = () => {
    setIsExpanded(prev => !prev)
    if (activeInstanceId) {
      const instance = instances.find(i => i.id === activeInstanceId)
      if (instance) {
        if (instance.isExpanded) {
          collapseInstance(activeInstanceId)
        } else {
          expandInstance(activeInstanceId)
        }
      }
    }
  }
  
  // Function to suggest a query to TARS
  const suggestQuery = (query: string) => setSuggestedQuery(query)
  
  // Function to create a new TARS instance
  const createNewInstance = () => {
    const newInstanceId = uuidv4()
    
    // Calculate position for new window (offset from active window or default position)
    let position = { x: window.innerWidth - 420, y: window.innerHeight - 620 }
    
    if (activeInstanceId) {
      const activeInstance = instances.find(i => i.id === activeInstanceId)
      if (activeInstance && activeInstance.position) {
        position = {
          x: Math.min(window.innerWidth - 420, activeInstance.position.x + 60),
          y: Math.min(window.innerHeight - 620, activeInstance.position.y + 60)
        }
      }
    }
    
    setInstances(prev => [
      ...prev,
      {
        id: newInstanceId,
        isExpanded: true,
        position
      }
    ])
    
    setActiveInstanceId(newInstanceId)
    return newInstanceId
  }
  
  // Function to close a TARS instance
  const closeInstance = (id: string) => {
    setInstances(prev => prev.filter(instance => instance.id !== id))
    
    // If closing the active instance, set the first remaining one as active
    if (activeInstanceId === id) {
      setActiveInstanceId(instances.filter(i => i.id !== id)[0]?.id || null)
    }
  }
  
  // Function to expand a TARS instance
  const expandInstance = (id: string) => {
    setInstances(prev => prev.map(instance => 
      instance.id === id 
        ? { ...instance, isExpanded: true } 
        : instance
    ))
    
    // If this is the active instance, also update the legacy state
    if (id === activeInstanceId) {
      setIsExpanded(true)
    }
  }
  
  // Function to collapse a TARS instance
  const collapseInstance = (id: string) => {
    setInstances(prev => prev.map(instance => 
      instance.id === id 
        ? { ...instance, isExpanded: false } 
        : instance
    ))
    
    // If this is the active instance, also update the legacy state
    if (id === activeInstanceId) {
      setIsExpanded(false)
    }
  }
  
  // Function to update a TARS instance position
  const updateInstancePosition = (id: string, position: { x: number, y: number }) => {
    setInstances(prev => prev.map(instance => 
      instance.id === id 
        ? { ...instance, position } 
        : instance
    ))
  }
  
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
    suggestQuery,
    instances,
    createNewInstance,
    closeInstance,
    expandInstance,
    collapseInstance,
    updateInstancePosition,
    activeInstanceId,
    setActiveInstanceId
  }
  
  return (
    <TARSContext.Provider value={value}>
      {children}
    </TARSContext.Provider>
  )
} 