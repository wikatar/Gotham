'use client'

import { useState } from 'react'
import AIAssistant from './AIAssistant'

export default function AIAssistantButton() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  
  return (
    <>
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary-light shadow-lg flex items-center justify-center text-text-primary transition-colors z-40"
        onClick={() => setIsAssistantOpen(true)}
        aria-label="Open AI Assistant"
      >
        <span className="text-xl">🤖</span>
      </button>
      
      <AIAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
      />
    </>
  )
} 