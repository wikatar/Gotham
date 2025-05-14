'use client'

import { useState, useRef, useEffect } from 'react'

interface DraggableProps {
  children: React.ReactNode
  isExpanded: boolean
  initialPosition?: { x: number, y: number }
  onPositionChange?: (position: { x: number, y: number }) => void
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export default function TARSDraggable({ 
  children, 
  isExpanded,
  initialPosition = { x: 0, y: 0 },
  onPositionChange,
  minWidth = 300,
  minHeight = 60,
  maxWidth = 800,
  maxHeight = 800
}: DraggableProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [size, setSize] = useState({ width: 400, height: 600 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  
  const dragRef = useRef<HTMLDivElement>(null)
  const resizeStartPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ width: 0, height: 0 })

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('tars-position', JSON.stringify(position))
    }
    onPositionChange?.(position)
  }, [position, onPositionChange])

  // Save size to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tars-size', JSON.stringify(size))
  }, [size])

  // Load position and size from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('tars-position')
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition))
      } catch (e) {
        console.error('Failed to parse saved position', e)
      }
    }

    const savedSize = localStorage.getItem('tars-size')
    if (savedSize) {
      try {
        setSize(JSON.parse(savedSize))
      } catch (e) {
        console.error('Failed to parse saved size', e)
      }
    }
  }, [])

  // Save position before hiding if isExpanded changes from true to false
  useEffect(() => {
    if (!isExpanded) {
      localStorage.setItem('tars-position', JSON.stringify(position));
    }
  }, [isExpanded, position]);

  // Handle dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('.no-drag')) {
      return
    }
    
    setIsDragging(true)
    
    // Store starting position
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new position
      let newX = e.clientX - startX
      let newY = e.clientY - startY
      
      // Constrain to viewport
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const elementWidth = dragRef.current?.offsetWidth || 0
      const elementHeight = dragRef.current?.offsetHeight || 0
      
      newX = Math.max(0, Math.min(newX, windowWidth - elementWidth))
      newY = Math.max(0, Math.min(newY, windowHeight - elementHeight))
      
      setPosition({ x: newX, y: newY })
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation() // Prevent drag start
    setIsResizing(true)
    setResizeDirection(direction)
    
    resizeStartPos.current = { x: e.clientX, y: e.clientY }
    startSize.current = { width: size.width, height: size.height }
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x
      const deltaY = e.clientY - resizeStartPos.current.y
      
      let newWidth = startSize.current.width
      let newHeight = startSize.current.height
      
      if (direction.includes('e')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.current.width + deltaX))
      }
      if (direction.includes('s')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.current.height + deltaY))
      }
      if (direction.includes('w')) {
        const widthDelta = -deltaX
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.current.width - widthDelta))
        if (newWidth !== startSize.current.width - widthDelta) {
          // Width constrained, adjust x position accordingly
          const adjustedDelta = startSize.current.width - newWidth
          setPosition(prev => ({ ...prev, x: prev.x + adjustedDelta }))
        } else {
          setPosition(prev => ({ ...prev, x: prev.x + deltaX }))
        }
      }
      if (direction.includes('n')) {
        const heightDelta = -deltaY
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.current.height - heightDelta))
        if (newHeight !== startSize.current.height - heightDelta) {
          // Height constrained, adjust y position accordingly
          const adjustedDelta = startSize.current.height - newHeight
          setPosition(prev => ({ ...prev, y: prev.y + adjustedDelta }))
        } else {
          setPosition(prev => ({ ...prev, y: prev.y + deltaY }))
        }
      }
      
      setSize({ width: newWidth, height: newHeight })
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeDirection(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Calculate styles
  const draggableStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    width: isExpanded ? `${size.width}px` : undefined,
    height: isExpanded ? `${size.height}px` : undefined,
    cursor: isDragging ? 'grabbing' : 'auto',
    display: isExpanded ? 'flex' : 'none',
  }

  // Return the draggable component
  return (
    <div
      ref={dragRef}
      className={`fixed bg-background-paper rounded-lg shadow-lg border border-secondary/30 flex flex-col z-50 ${
        isDragging ? 'cursor-grabbing' : ''
      }`}
      style={draggableStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Actual content */}
      {children}
      
      {/* Resize handles - only visible when expanded */}
      {isExpanded && (
        <>
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div 
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div 
            className="absolute top-0 left-0 right-0 h-1 cursor-n-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
        </>
      )}
    </div>
  )
} 