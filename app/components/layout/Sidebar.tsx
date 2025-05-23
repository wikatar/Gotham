'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItemProps {
  icon: string;
  label: string;
  href: string;
  badge?: number;
  active?: boolean;
  collapsed?: boolean;
  hidden?: boolean;
  comingSoon?: boolean;
}

// SidebarItem component
function SidebarItem({ icon, label, href, badge, active, collapsed, hidden, comingSoon }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = active !== undefined ? active : pathname === href || pathname.startsWith(href + '/');

  // Don't render if hidden
  if (hidden) return null;

  const linkContent = (
    <div
      className={`flex items-center rounded-md mb-1 ${
        collapsed 
          ? 'justify-center p-2' 
          : 'p-2'
      } ${
        isActive 
          ? `bg-background-elevated ${collapsed ? 'border-l-2' : 'border-l-2'} border-[#FF3333] text-white` 
          : comingSoon
          ? 'text-text-secondary cursor-not-allowed opacity-60'
          : 'text-text-primary hover:bg-secondary/10'
      }`}
      title={collapsed ? label : (comingSoon ? `${label} (Coming Soon)` : undefined)}
    >
      <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
      {!collapsed && (
        <span className="flex-1">
          {label}
          {comingSoon && <span className="text-xs ml-2 opacity-70">(Soon)</span>}
        </span>
      )}
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
    </div>
  );

  // If coming soon, don't make it a link
  if (comingSoon) {
    return linkContent;
  }

  return (
    <Link href={href}>
      {linkContent}
    </Link>
  );
}

// Separator component
function MenuSeparator({ collapsed }: { collapsed: boolean }) {
  return (
    <hr className={`border-secondary/20 ${collapsed ? 'mx-1 my-2' : 'mx-2 my-3'}`} />
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pathname = usePathname()
  
  // Mock user state - replace with actual auth context
  const user = { isAdmin: true } // TODO: Replace with actual user context

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
      className={`bg-background-paper border-r border-secondary/20 transition-all duration-300 ease-in-out h-screen flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
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

      {/* Navigation */}
      <div className={`px-2 pt-4 flex-1 overflow-y-auto ${collapsed ? 'px-1' : 'px-2'}`}>
        <nav className="space-y-1">
          {/* Core Operational Modules */}
          <SidebarItem 
            icon="📊" 
            label="Dashboard" 
            href="/dashboard"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🧭" 
            label="Control Center" 
            href="/control-center"
            badge={4}
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
            icon="📈" 
            label="Agent Feedback" 
            href="/agent-feedback"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="📋" 
            label="Missions" 
            href="/missions"
            badge={3}
            collapsed={collapsed}
          />

          <MenuSeparator collapsed={collapsed} />

          {/* Data Infrastructure */}
          <SidebarItem 
            icon="⚙️" 
            label="ETL Manager" 
            href="/pipelines"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🧠" 
            label="Semantic Modeling" 
            href="/semantic-model"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🔌" 
            label="Data Integrations" 
            href="/data-integrations"
            collapsed={collapsed}
          />

          <MenuSeparator collapsed={collapsed} />

          {/* Monitoring & Analysis */}
          <SidebarItem 
            icon="🌍" 
            label="Globe View" 
            href="/globe"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon="🚨" 
            label="Anomalies" 
            href="/anomalies"
            badge={2}
            collapsed={collapsed}
          />

          <MenuSeparator collapsed={collapsed} />

          {/* Incident Management */}
          <MenuSeparator />
          <SidebarItem 
            icon="📋" 
            label="Incident Reports" 
            href="/incidents"
          />

          <MenuSeparator collapsed={collapsed} />

          {/* Administration */}
          <SidebarItem 
            icon="🛠️" 
            label="Templates" 
            href="/templates"
            collapsed={collapsed}
            hidden={!user.isAdmin}
          />
          <SidebarItem 
            icon="⚙️" 
            label="Settings" 
            href="/settings"
            collapsed={collapsed}
          />
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-secondary/20">
        {!collapsed && !isTransitioning && (
          <div className="text-sm text-text-secondary">
            Monolith Analytics v1.0.0
          </div>
        )}
        {collapsed && (
          <div className="text-sm text-text-secondary text-center">
            v1.0
          </div>
        )}
      </div>
    </div>
  )
} 