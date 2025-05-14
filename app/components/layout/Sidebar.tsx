'use client'

import { useState, useEffect } from 'react'
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
  collapsed?: boolean;
}

// SidebarItem component
function SidebarItem({ icon, label, href, badge, active, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = active !== undefined ? active : pathname === href;

  return (
    <Link 
      href={href}
      className={`flex items-center rounded-md mb-1 ${
        collapsed 
          ? 'justify-center p-2' 
          : 'p-2'
      } ${
        isActive 
          ? `bg-background-elevated ${collapsed ? 'border-l-2' : 'border-l-2'} border-[#FF3333] text-white` 
          : 'text-text-primary hover:bg-secondary/10'
      }`}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
      {!collapsed && <span className="flex-1">{label}</span>}
      {badge && !collapsed && (
        <span className="bg-background-elevated border border-[#FF3333]/70 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {badge && collapsed && (
        <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-[#FF3333] text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pathname = usePathname()
  
  // Handle clean transition when collapsing/expanding
  const handleToggleCollapse = () => {
    setIsTransitioning(true)
    setCollapsed(!collapsed)
    // Wait for transition to complete before allowing content to show/hide
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300) // Match the duration in the CSS transition
  }

  return (
    <div 
      className={`bg-background-paper border-r border-secondary/20 transition-all duration-300 ease-in-out h-screen ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-secondary/20">
        {!collapsed && !isTransitioning && (
          <div className="text-lg font-bold text-white overflow-hidden whitespace-nowrap">Monolith AI</div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <span className="text-lg font-bold">M</span>
          </div>
        )}
        <button 
          onClick={handleToggleCollapse}
          className={`${collapsed ? 'mx-auto' : ''} p-2 rounded-md hover:bg-secondary/20 text-text-secondary`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className={`px-2 mb-6 pt-4 ${collapsed ? 'px-1' : 'px-2'}`}>
        <nav className="space-y-1">
          <SidebarItem 
            icon="🧭" 
            label="Control Interface" 
            href="/control"
            badge={4}
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🔌" 
            label="Feed Center" 
            href="/feed-center"
            badge={2}
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🧠" 
            label="Semantic Model" 
            href="/semantic-model"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="📋" 
            label="Missions" 
            href="/missions"
            badge={3}
            active={pathname.startsWith('/missions')}
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="⚙️" 
            label="ETL Manager" 
            href="/etl-manager"
            active={pathname.startsWith('/etl-manager')}
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🤖" 
            label="Agent Center" 
            href="/agent-center"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🔍" 
            label="Explainability" 
            href="/explainability"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🌍" 
            label="Global View" 
            href="/globe"
            collapsed={collapsed}
          />
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-secondary/20">
        {!collapsed && !isTransitioning && (
          <div className="text-sm text-text-secondary">
            v1.0.0
          </div>
        )}
        {collapsed && (
          <div className="text-sm text-text-secondary text-center">
            v1
          </div>
        )}
      </div>
    </div>
  )
} 