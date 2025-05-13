'use client'

import { useState } from 'react'
import { useMission } from '../lib/missionContext'
import AppLayout from '../components/layout/AppLayout'
import Link from 'next/link'

export default function TemplatesPage() {
  const { availableTemplates, applyTemplate } = useMission()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  
  // Extract all unique categories and roles
  const categories = [...new Set(availableTemplates.map(t => t.category))]
  const roles = [...new Set(availableTemplates.flatMap(t => t.roleFocus))]
  
  // Filter templates based on selected category and role
  const filteredTemplates = availableTemplates.filter(template => {
    if (selectedCategory && template.category !== selectedCategory) return false
    if (selectedRole && !template.roleFocus.includes(selectedRole)) return false
    return true
  })

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Templates</h1>
        <p className="text-text-secondary">Create a new mission from a template</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <div className="text-sm font-medium mb-2">Category</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === null 
                  ? 'bg-primary text-text-primary' 
                  : 'bg-secondary/10 text-text-secondary hover:bg-secondary/20'
              }`}
            >
              All
            </button>
            
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-text-primary' 
                    : 'bg-secondary/10 text-text-secondary hover:bg-secondary/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-sm font-medium mb-2">Role</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRole(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedRole === null 
                  ? 'bg-primary text-text-primary' 
                  : 'bg-secondary/10 text-text-secondary hover:bg-secondary/20'
              }`}
            >
              All
            </button>
            
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedRole === role
                    ? 'bg-primary text-text-primary' 
                    : 'bg-secondary/10 text-text-secondary hover:bg-secondary/20'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="border border-secondary/20 rounded-lg overflow-hidden bg-background-paper hover:border-accent transition-colors">
            <div className="h-40 bg-secondary/20 relative">
              {template.thumbnail ? (
                <img 
                  src={template.thumbnail} 
                  alt={template.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-4xl opacity-30">
                  {getCategoryIcon(template.category)}
                </div>
              )}
              <div className="absolute top-2 right-2 bg-background-paper px-2 py-1 rounded-md text-xs capitalize">
                {template.category}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-text-secondary mb-4">{template.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {template.roleFocus.map(role => (
                  <span 
                    key={role}
                    className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
              
              <button
                onClick={() => applyTemplate(template.id)}
                className="w-full py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md transition-colors"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
        
        {/* Create from scratch */}
        <div className="border border-dashed border-secondary/40 rounded-lg overflow-hidden bg-background-paper hover:border-accent transition-colors flex flex-col">
          <div className="h-40 bg-secondary/10 flex items-center justify-center text-5xl text-text-secondary/30">
            +
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="text-lg font-medium mb-1">Start from scratch</h3>
            <p className="text-sm text-text-secondary mb-4 flex-1">Create a custom mission with your own dashboards and data sources</p>
            
            <Link 
              href="/new-mission"
              className="w-full py-2 bg-secondary/10 hover:bg-secondary/20 text-text-primary rounded-md transition-colors text-center"
            >
              Create Custom Mission
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

// Helper function for category icons
function getCategoryIcon(category: string): string {
  switch (category) {
    case 'business':
      return '💼'
    case 'hr':
      return '👥'
    case 'finance':
      return '💰'
    case 'marketing':
      return '📈'
    case 'operations':
      return '⚙️'
    default:
      return '📊'
  }
} 