'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Navigation items
const navItems = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Control Interface', path: '/control', icon: '🧭' },
  { name: 'Feed Center', path: '/feed-center', icon: '🔌' },
  { name: 'Semantic Model', path: '/semantic-model', icon: '🧠' },
  { name: 'Missions', path: '/missions', icon: '📋' },
  { name: 'Agent Center', path: '/agent-center', icon: '🤖' },
  { name: 'Explainability', path: '/explainability', icon: '🔍' },
  { name: 'Global View', path: '/globe', icon: '🌐' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'Data Integration', path: '/data-integrations', icon: '🔄' },
  { name: 'Data Modeling', path: '/data-modeling', icon: '🧩' },
  { name: 'AI Insights', path: '/ai-insights', icon: '🤖' },
  { name: 'Templates', path: '/templates', icon: '📋' },
  { name: 'Access Control', path: '/access-control', icon: '🔐' },
  { name: 'Database', path: '/database', icon: '💾' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div 
      className={`bg-background-paper border-r border-secondary/20 transition-all duration-300 ease-in-out h-screen ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-secondary/20">
        {!collapsed && (
          <div className="text-lg font-bold text-gradient">Enterprise Brain</div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-secondary/20 text-text-secondary"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="px-2 mb-6">
        <div className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2 pl-2">
          Enterprise Brain
        </div>
        <nav className="space-y-1">
          <SidebarItem 
            icon="🧭" 
            label="Control Interface" 
            href="/control"
            badge={4}
          />
          <SidebarItem 
            icon="🔌" 
            label="Feed Center" 
            href="/feed-center"
            badge={2}
          />
          <SidebarItem 
            icon="🧠" 
            label="Semantic Model" 
            href="/semantic-model"
          />
          <SidebarItem 
            icon="📋" 
            label="Missions" 
            href="/missions"
            badge={3}
            active={pathname.startsWith('/missions')}
          />
          <SidebarItem 
            icon="🤖" 
            label="Agent Center" 
            href="/agent-center"
          />
          <SidebarItem 
            icon="🔍" 
            label="Explainability" 
            href="/explainability"
          />
          <SidebarItem 
            icon="🌍" 
            label="Global View" 
            href="/globe"
          />
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-secondary/20">
        {!collapsed && (
          <div className="text-sm text-text-secondary">
            Enterprise Brain v1.0.0
          </div>
        )}
      </div>
    </div>
  )
} 