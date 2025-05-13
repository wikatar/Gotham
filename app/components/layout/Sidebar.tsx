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

      <nav className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <div
                  className={`flex items-center p-3 rounded-md transition-colors duration-200 ${
                    pathname === item.path
                      ? 'bg-primary text-text-primary'
                      : 'hover:bg-secondary/20 text-text-secondary'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
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