'use client'

import { useState } from 'react'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  
  return (
    <header className="bg-background-paper border-b border-secondary/20 h-16 flex items-center justify-between px-4">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search data, entities, insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-background rounded-md border border-secondary/40 focus:border-accent focus:outline-none"
          />
          <button className="absolute right-2 top-2 text-text-secondary hover:text-text-primary">
            🔍
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-secondary/20">
          🔔
        </button>
        
        <div className="relative group">
          <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary/20">
            <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center">
              👤
            </div>
            <span className="text-sm font-medium">User</span>
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-background-elevated rounded-md shadow-lg z-10 hidden group-hover:block">
            <div className="py-1">
              <a href="#" className="block px-4 py-2 text-sm hover:bg-primary">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-primary">Settings</a>
              <a href="#" className="block px-4 py-2 text-sm hover:bg-primary">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 