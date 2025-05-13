'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// Exempeldata för templates
const templateCategories = [
  { id: 'analytics', name: 'Analytics', icon: '📊' },
  { id: 'marketing', name: 'Marketing', icon: '📣' },
  { id: 'finance', name: 'Finance', icon: '💰' },
  { id: 'operations', name: 'Operations', icon: '⚙️' },
  { id: 'sales', name: 'Sales', icon: '💼' },
  { id: 'research', name: 'Research', icon: '🔬' },
  { id: 'custom', name: 'Custom', icon: '✨' }
];

const templates = [
  { 
    id: 'template1', 
    name: 'Market Expansion Analysis',
    description: 'Analyze potential for expanding into new markets based on customer data, market trends, and competitor analysis.',
    category: 'analytics',
    complexity: 'medium',
    estimatedDuration: '4-6 weeks',
    popularity: 'high',
    components: ['Customer Segmentation', 'Market Sizing', 'Competitor Analysis', 'Financial Modeling']
  },
  { 
    id: 'template2', 
    name: 'Marketing Campaign Effectiveness',
    description: 'Measure and analyze the ROI and effectiveness of marketing campaigns across different channels.',
    category: 'marketing',
    complexity: 'medium',
    estimatedDuration: '2-3 weeks',
    popularity: 'high',
    components: ['Channel Analysis', 'Conversion Tracking', 'A/B Testing', 'Budget Optimization']
  },
  { 
    id: 'template3', 
    name: 'Financial Performance Dashboard',
    description: 'Track key financial metrics and KPIs to monitor business performance and identify trends.',
    category: 'finance',
    complexity: 'high',
    estimatedDuration: '3-4 weeks',
    popularity: 'medium',
    components: ['Revenue Analysis', 'Cost Structure', 'Cash Flow Monitoring', 'Profitability Metrics']
  },
  { 
    id: 'template4', 
    name: 'Customer Churn Prediction',
    description: 'Build predictive models to identify customers at risk of churning and develop retention strategies.',
    category: 'analytics',
    complexity: 'high',
    estimatedDuration: '4-8 weeks',
    popularity: 'high',
    components: ['Data Preprocessing', 'Feature Engineering', 'Model Training', 'Scoring & Segmentation']
  },
  { 
    id: 'template5', 
    name: 'Supply Chain Optimization',
    description: 'Analyze and optimize inventory levels, supplier performance, and logistics operations.',
    category: 'operations',
    complexity: 'high',
    estimatedDuration: '6-8 weeks',
    popularity: 'medium',
    components: ['Inventory Analysis', 'Supplier Scoring', 'Logistics Optimization', 'Demand Forecasting']
  },
  { 
    id: 'template6', 
    name: 'Sales Pipeline Analysis',
    description: 'Track and optimize sales funnel, identify bottlenecks, and forecast revenue.',
    category: 'sales',
    complexity: 'medium',
    estimatedDuration: '2-4 weeks',
    popularity: 'high',
    components: ['Pipeline Visualization', 'Conversion Metrics', 'Sales Forecasting', 'Rep Performance']
  }
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrera templates baserat på kategori och sökfråga
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const getComplexityColor = (complexity) => {
    switch(complexity) {
      case 'low': return 'bg-green-500/20 text-green-600';
      case 'medium': return 'bg-yellow-500/20 text-yellow-600';
      case 'high': return 'bg-red-500/20 text-red-600';
      default: return 'bg-blue-500/20 text-blue-600';
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Mission Templates</h1>
        <p className="text-text-secondary">Start your analysis with a pre-configured mission template or create your own.</p>
      </div>
      
      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-md bg-background border border-secondary/40 focus:border-accent focus:outline-none"
          />
          <div className="absolute left-3 top-2.5 text-text-secondary">🔍</div>
        </div>
        
        <div className="inline-flex overflow-x-auto pb-2 md:pb-0 space-x-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
              selectedCategory === 'all' 
                ? 'bg-primary text-text-primary' 
                : 'bg-secondary/10 text-text-secondary hover:bg-secondary/20'
            }`}
          >
            All Categories
          </button>
          
          {templateCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'bg-primary text-text-primary' 
                  : 'bg-secondary/10 text-text-secondary hover:bg-secondary/20'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="h-full flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-lg">{template.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${getComplexityColor(template.complexity)}`}>
                  {template.complexity.charAt(0).toUpperCase() + template.complexity.slice(1)} Complexity
                </span>
              </div>
              
              <p className="text-text-secondary mb-4">{template.description}</p>
              
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Includes:</div>
                <div className="flex flex-wrap gap-2">
                  {template.components.map((component, idx) => (
                    <span key={idx} className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                      {component}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <div className="text-text-secondary">Est. Duration:</div>
                  <div>{template.estimatedDuration}</div>
                </div>
                <div>
                  <div className="text-text-secondary">Popularity:</div>
                  <div className="capitalize">{template.popularity}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-secondary/10">
              <Button variant="secondary">Preview</Button>
              <Link href={`/templates/create?template=${template.id}`}>
                <Button>Use Template</Button>
              </Link>
            </div>
          </Card>
        ))}
        
        {/* Create Custom Template */}
        <Card className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-secondary/20">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="font-medium text-lg mb-2">Create Custom Template</h3>
          <p className="text-text-secondary mb-6 max-w-md">
            Build your own mission template with customized objectives, components, and data sources.
          </p>
          <Link href="/templates/create">
            <Button>Create Template</Button>
          </Link>
        </Card>
      </div>
      
      {/* Tips Section */}
      <Card title="Template Tips" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-3">
            <div className="text-xl mb-2">🚀</div>
            <div className="font-medium mb-1">Start Quickly</div>
            <div className="text-sm text-text-secondary">
              Templates provide a head start with predefined objectives, data sources, and analysis plans.
            </div>
          </div>
          
          <div className="p-3">
            <div className="text-xl mb-2">🧩</div>
            <div className="font-medium mb-1">Customize as Needed</div>
            <div className="text-sm text-text-secondary">
              All templates are fully customizable - add, remove, or modify components to suit your needs.
            </div>
          </div>
          
          <div className="p-3">
            <div className="text-xl mb-2">📊</div>
            <div className="font-medium mb-1">Share with Team</div>
            <div className="text-sm text-text-secondary">
              Save your custom templates to reuse and share with your team for consistent analysis.
            </div>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
} 