'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Define types for our context
interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  lastUpdated?: Date;
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  presets: DashboardPreset[];
  activePreset?: string;
}

interface DashboardPreset {
  name: string;
  activeDataSources: string[]; // IDs of active data sources
  filters: Record<string, any>;
  createdAt: Date;
}

interface Mission {
  id: string;
  name: string;
  description?: string;
  category?: string;
  dashboards: Dashboard[];
  dataSources: DataSource[];
  defaultDashboardId?: string;
  templateId?: string;
  tags: string[];
}

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  roleFocus: string[];
  thumbnail?: string;
}

interface MissionContextType {
  // Current mission state
  currentMission: Mission | null;
  setCurrentMission: (mission: Mission | null) => void;
  
  // All missions for the current user
  missions: Mission[];
  setMissions: (missions: Mission[]) => void;
  
  // Templates
  templates: Template[];
  
  // Dashboard management
  currentDashboard: Dashboard | null;
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  
  // Data source management
  activeDataSources: string[]; // IDs of currently active data sources
  toggleDataSource: (dataSourceId: string) => void;
  
  // Dashboard preset management
  applyPreset: (presetName: string) => void;
  saveCurrentAsPreset: (presetName: string) => void;
  
  // Template management
  availableTemplates: Template[];
  applyTemplate: (templateId: string) => void;
  
  // Loading state
  isLoading: boolean;
}

// Create the context
const MissionContext = createContext<MissionContextType | undefined>(undefined)

// Custom hook for using the mission context
export function useMission() {
  const context = useContext(MissionContext)
  if (context === undefined) {
    throw new Error('useMission must be used within a MissionProvider')
  }
  return context
}

// Sample data for development/demo purposes
const SAMPLE_MISSIONS: Mission[] = [
  {
    id: "mission-1",
    name: "Business Analytics",
    description: "Track key metrics for my company",
    category: "business",
    tags: ["finance", "operations"],
    dashboards: [
      {
        id: "dashboard-1",
        name: "Executive Overview",
        description: "High-level business metrics",
        presets: [
          {
            name: "Revenue Focus",
            activeDataSources: ["datasource-1", "datasource-3"],
            filters: { timeRange: "quarterly" },
            createdAt: new Date()
          },
          {
            name: "Growth Metrics",
            activeDataSources: ["datasource-2", "datasource-3"],
            filters: { timeRange: "yearly" },
            createdAt: new Date()
          }
        ],
        activePreset: "Revenue Focus"
      },
      {
        id: "dashboard-2",
        name: "Financial Details",
        description: "Detailed financial metrics",
        presets: [],
      }
    ],
    dataSources: [
      {
        id: "datasource-1",
        name: "Revenue Data",
        type: "database",
        status: "active",
        lastUpdated: new Date()
      },
      {
        id: "datasource-2",
        name: "User Metrics",
        type: "api",
        status: "active",
        lastUpdated: new Date()
      },
      {
        id: "datasource-3",
        name: "Market Analysis",
        type: "live_feed",
        status: "active",
        lastUpdated: new Date()
      }
    ],
    defaultDashboardId: "dashboard-1"
  },
  {
    id: "mission-2",
    name: "HR Dashboard",
    description: "Employee performance and engagement",
    category: "hr",
    tags: ["employees", "performance"],
    dashboards: [
      {
        id: "dashboard-3",
        name: "Employee Overview",
        presets: [],
      }
    ],
    dataSources: [
      {
        id: "datasource-4",
        name: "Employee Data",
        type: "database",
        status: "active",
        lastUpdated: new Date()
      }
    ],
    defaultDashboardId: "dashboard-3"
  }
];

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: "template-1",
    name: "Business Owner Dashboard",
    description: "Complete overview for small to medium business owners",
    category: "business",
    roleFocus: ["CEO", "Owner", "Executive"],
    thumbnail: "/templates/business-owner.jpg"
  },
  {
    id: "template-2",
    name: "HR Management",
    description: "Employee management and performance tracking",
    category: "hr",
    roleFocus: ["HR Manager", "Team Lead"],
    thumbnail: "/templates/hr-management.jpg"
  },
  {
    id: "template-3",
    name: "Investor Analytics",
    description: "Financial performance and investment tracking",
    category: "finance",
    roleFocus: ["Investor", "Financial Advisor"],
    thumbnail: "/templates/investor.jpg"
  },
  {
    id: "template-4",
    name: "Marketing Dashboard",
    description: "Campaign performance and audience insights",
    category: "marketing",
    roleFocus: ["Marketing Manager", "Growth Lead"],
    thumbnail: "/templates/marketing.jpg"
  },
  {
    id: "template-5",
    name: "Operations Overview",
    description: "Supply chain, logistics, and operational efficiency",
    category: "operations",
    roleFocus: ["Operations Manager", "Logistics"],
    thumbnail: "/templates/operations.jpg"
  }
];

// Provider component
export function MissionProvider({ children }: { children: ReactNode }) {
  // State for missions
  const [missions, setMissions] = useState<Mission[]>(SAMPLE_MISSIONS);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard state
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [activeDataSources, setActiveDataSources] = useState<string[]>([]);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize with first mission on mount
  useEffect(() => {
    if (missions.length > 0 && !currentMission) {
      const firstMission = missions[0];
      setCurrentMission(firstMission);
      
      // Set active dashboard to default or first available
      if (firstMission.dashboards.length > 0) {
        const defaultDashboard = firstMission.defaultDashboardId 
          ? firstMission.dashboards.find(d => d.id === firstMission.defaultDashboardId)
          : firstMission.dashboards[0];
          
        if (defaultDashboard) {
          setCurrentDashboard(defaultDashboard);
          
          // If dashboard has an active preset, apply it
          if (defaultDashboard.activePreset) {
            const preset = defaultDashboard.presets.find(p => p.name === defaultDashboard.activePreset);
            if (preset) {
              setActiveDataSources(preset.activeDataSources);
            }
          }
        }
      }
      
      setIsLoading(false);
    }
  }, [missions]);
  
  // Toggle a data source active/inactive
  const toggleDataSource = (dataSourceId: string) => {
    setActiveDataSources(prev => {
      if (prev.includes(dataSourceId)) {
        return prev.filter(id => id !== dataSourceId);
      } else {
        return [...prev, dataSourceId];
      }
    });
  };
  
  // Apply a dashboard preset
  const applyPreset = (presetName: string) => {
    if (!currentDashboard) return;
    
    const preset = currentDashboard.presets.find(p => p.name === presetName);
    if (preset) {
      setActiveDataSources(preset.activeDataSources);
      
      // Update current dashboard's active preset
      setCurrentDashboard({
        ...currentDashboard,
        activePreset: presetName
      });
      
      // Update in missions array
      if (currentMission) {
        const updatedMission = {
          ...currentMission,
          dashboards: currentMission.dashboards.map(d => 
            d.id === currentDashboard.id 
              ? { ...d, activePreset: presetName }
              : d
          )
        };
        setCurrentMission(updatedMission);
        
        // Update in missions list
        setMissions(prev => prev.map(m => 
          m.id === updatedMission.id ? updatedMission : m
        ));
      }
    }
  };
  
  // Save current configuration as a preset
  const saveCurrentAsPreset = (presetName: string) => {
    if (!currentDashboard || !currentMission) return;
    
    const newPreset: DashboardPreset = {
      name: presetName,
      activeDataSources: [...activeDataSources],
      filters: {}, // Would be filled with current filters
      createdAt: new Date()
    };
    
    // Update current dashboard with new preset
    const updatedDashboard = {
      ...currentDashboard,
      presets: [...currentDashboard.presets, newPreset],
      activePreset: presetName
    };
    
    setCurrentDashboard(updatedDashboard);
    
    // Update in mission
    const updatedMission = {
      ...currentMission,
      dashboards: currentMission.dashboards.map(d => 
        d.id === currentDashboard.id ? updatedDashboard : d
      )
    };
    
    setCurrentMission(updatedMission);
    
    // Update in missions list
    setMissions(prev => prev.map(m => 
      m.id === updatedMission.id ? updatedMission : m
    ));
  };
  
  // Apply a template to create a new mission
  const applyTemplate = (templateId: string) => {
    // This would normally fetch template data and create a new mission
    // For demo purposes, we'll simulate this
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      const newMissionId = `mission-${Date.now()}`;
      const newDashboardId = `dashboard-${Date.now()}`;
      
      const newMission: Mission = {
        id: newMissionId,
        name: `${template.name} Mission`,
        description: `Created from ${template.name} template`,
        category: template.category,
        tags: [template.category],
        dashboards: [
          {
            id: newDashboardId,
            name: "Main Dashboard",
            description: "Created from template",
            presets: [
              {
                name: "Default View",
                activeDataSources: [], 
                filters: {},
                createdAt: new Date()
              }
            ],
            activePreset: "Default View"
          }
        ],
        dataSources: [],
        defaultDashboardId: newDashboardId,
        templateId: templateId
      };
      
      // Add to missions
      setMissions(prev => [...prev, newMission]);
      
      // Set as current mission
      setCurrentMission(newMission);
      
      // Set dashboard
      setCurrentDashboard(newMission.dashboards[0]);
      
      // Reset active data sources
      setActiveDataSources([]);
      
      // Navigate to dashboard page
      router.push('/');
    }
  };
  
  const value = {
    currentMission,
    setCurrentMission,
    missions,
    setMissions,
    templates,
    currentDashboard,
    setCurrentDashboard,
    activeDataSources,
    toggleDataSource,
    applyPreset,
    saveCurrentAsPreset,
    availableTemplates: templates,
    applyTemplate,
    isLoading
  };
  
  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
} 