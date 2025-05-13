'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Navigation items
const navItems = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Globe', path: '/globe', icon: '🌐' },
  { name: 'Database', path: '/database', icon: '💾' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'AI Insights', path: '/ai-insights', icon: '🤖' },
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
          <div className="text-lg font-bold text-gradient">Monolith Analytics</div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-secondary/20 text-text-secondary"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="p-2">
        <ul className="space-y-2">
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
            Monolith Analytics v0.1.0
          </div>
        )}
      </div>
    </div>
  )
} 