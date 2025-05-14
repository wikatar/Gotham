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

interface SidebarItemProps {
  icon: string;
  label: string;
  href: string;
  badge?: number;
  active?: boolean;
}

// SidebarItem component
function SidebarItem({ icon, label, href, badge, active }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = active !== undefined ? active : pathname === href;

  return (
    <Link 
      href={href}
      className={`flex items-center p-2 rounded-md mb-1 ${
        isActive 
          ? 'bg-background-elevated border-l-2 border-[#FF3333] text-white' 
          : 'text-text-primary hover:bg-secondary/10'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-background-elevated border border-[#FF3333]/70 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

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
          <div className="text-lg font-bold text-white">Monolith AI</div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-secondary/20 text-text-secondary"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="px-2 mb-6 pt-4">
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
            v1.0.0
          </div>
        )}
      </div>
    </div>
  )
} 