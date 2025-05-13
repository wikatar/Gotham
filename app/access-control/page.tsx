'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppLayout from '../components/layout/AppLayout'
import { useMission } from '../lib/missionContext'
import Button from '../components/ui/Button'

export default function AccessControlPage() {
  const { currentMission } = useMission()
  const [activeTab, setActiveTab] = useState('users')
  
  // Sample users
  const users = [
    { 
      id: 'user1', 
      name: 'John Smith', 
      email: 'john.smith@example.com',
      role: 'Administrator',
      status: 'active',
      lastLogin: '2023-09-15T10:30:00Z',
      permissions: ['all']
    },
    { 
      id: 'user2', 
      name: 'Sarah Johnson', 
      email: 'sarah.j@example.com',
      role: 'Analyst',
      status: 'active',
      lastLogin: '2023-09-14T15:45:00Z',
      permissions: ['view_dashboards', 'edit_dashboards', 'run_queries', 'export_data']
    },
    { 
      id: 'user3', 
      name: 'Michael Chen', 
      email: 'mchen@example.com',
      role: 'Viewer',
      status: 'active',
      lastLogin: '2023-09-12T09:15:00Z',
      permissions: ['view_dashboards', 'export_data']
    },
    { 
      id: 'user4', 
      name: 'Emma Davis', 
      email: 'emma.d@example.com',
      role: 'Data Scientist',
      status: 'inactive',
      lastLogin: '2023-08-30T11:20:00Z',
      permissions: ['view_dashboards', 'edit_dashboards', 'run_queries', 'export_data', 'create_models', 'run_models']
    }
  ]
  
  // Sample roles
  const roles = [
    {
      id: 'role1',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      userCount: 2,
      permissions: ['all']
    },
    {
      id: 'role2',
      name: 'Analyst',
      description: 'Can create and edit dashboards, run queries, and export data',
      userCount: 5,
      permissions: ['view_dashboards', 'edit_dashboards', 'run_queries', 'export_data']
    },
    {
      id: 'role3',
      name: 'Viewer',
      description: 'Can view dashboards and export data',
      userCount: 12,
      permissions: ['view_dashboards', 'export_data']
    },
    {
      id: 'role4',
      name: 'Data Scientist',
      description: 'Can access all data features plus model creation and training',
      userCount: 3,
      permissions: ['view_dashboards', 'edit_dashboards', 'run_queries', 'export_data', 'create_models', 'run_models']
    }
  ]
  
  // Sample permissions
  const permissions = [
    { id: 'p1', name: 'view_dashboards', description: 'View dashboards and their contents', category: 'Dashboards' },
    { id: 'p2', name: 'edit_dashboards', description: 'Create and edit dashboards', category: 'Dashboards' },
    { id: 'p3', name: 'run_queries', description: 'Run custom queries against the data', category: 'Data' },
    { id: 'p4', name: 'export_data', description: 'Export data in various formats', category: 'Data' },
    { id: 'p5', name: 'manage_users', description: 'Add, edit, and remove users', category: 'Administration' },
    { id: 'p6', name: 'manage_roles', description: 'Create and edit roles and permissions', category: 'Administration' },
    { id: 'p7', name: 'create_models', description: 'Create and configure predictive models', category: 'AI & Models' },
    { id: 'p8', name: 'run_models', description: 'Run existing predictive models', category: 'AI & Models' },
    { id: 'p9', name: 'manage_data_sources', description: 'Add and configure data sources', category: 'Administration' },
    { id: 'p10', name: 'manage_missions', description: 'Create and edit missions/workspaces', category: 'Administration' }
  ]
  
  // Sample access logs
  const accessLogs = [
    { id: 'log1', user: 'John Smith', action: 'Edited dashboard', resource: 'Sales Overview', timestamp: '2023-09-15T14:30:00Z', status: 'success' },
    { id: 'log2', user: 'Sarah Johnson', action: 'Exported data', resource: 'Customer Database', timestamp: '2023-09-15T13:45:00Z', status: 'success' },
    { id: 'log3', user: 'Michael Chen', action: 'Viewed dashboard', resource: 'Marketing Analytics', timestamp: '2023-09-15T12:15:00Z', status: 'success' },
    { id: 'log4', user: 'Emma Davis', action: 'Created model', resource: 'Churn Prediction', timestamp: '2023-09-15T11:20:00Z', status: 'success' },
    { id: 'log5', user: 'Sarah Johnson', action: 'Accessed API', resource: '/api/data/customers', timestamp: '2023-09-15T10:05:00Z', status: 'success' },
    { id: 'log6', user: 'Unknown IP (192.168.1.54)', action: 'Login attempt', resource: 'Account: john.smith', timestamp: '2023-09-15T09:30:00Z', status: 'failed' },
    { id: 'log7', user: 'System', action: 'Backup created', resource: 'Database Backup', timestamp: '2023-09-15T03:00:00Z', status: 'success' }
  ]

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Access Control</h1>
          <p className="text-text-secondary">Manage users, roles, and permissions for your workspace</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/access-control/cell-security">
            <Button variant="secondary">Cell-Level Security</Button>
          </Link>
          <Link href="/access-control/data-lineage">
            <Button variant="secondary">Data Lineage</Button>
          </Link>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary/20 mb-6">
        <nav className="flex space-x-8">
          {['users', 'roles', 'permissions', 'audit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary/30'
              }`}
            >
              {tab === 'users' ? 'Users' : 
               tab === 'roles' ? 'Roles' :
               tab === 'permissions' ? 'Permissions' : 
               'Audit Log'}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">User Management</div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Add New User
            </button>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-secondary/20 mb-6">
            <table className="w-full text-sm">
              <thead className="bg-secondary/10">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Name</th>
                  <th className="py-3 px-4 text-left font-medium">Email</th>
                  <th className="py-3 px-4 text-left font-medium">Role</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Last Login</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t border-secondary/10 hover:bg-secondary/5">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.role}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(user.lastLogin).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="px-2 py-1 text-xs bg-secondary/10 hover:bg-secondary/20 rounded">
                          Edit
                        </button>
                        <button className="px-2 py-1 text-xs bg-secondary/10 hover:bg-secondary/20 rounded">
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
            <h3 className="font-medium mb-2">Bulk User Management</h3>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                Import Users
              </button>
              <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                Export Users
              </button>
              <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                Bulk Edit
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">Role Management</div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Create New Role
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {roles.map(role => (
              <div key={role.id} className="bg-background-paper rounded-lg p-4 border border-secondary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{role.name}</h3>
                    <div className="text-sm text-text-secondary mt-1">
                      {role.description}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {role.userCount} user{role.userCount !== 1 ? 's' : ''} assigned
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Duplicate
                    </button>
                    {role.name !== 'Administrator' && (
                      <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-secondary/10">
                  <div className="text-xs text-text-secondary mb-2">Permissions:</div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.includes('all') ? (
                      <span className="bg-accent/20 text-accent px-2 py-1 rounded-md text-xs">
                        All Permissions
                      </span>
                    ) : (
                      role.permissions.map(perm => (
                        <span key={perm} className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                          {perm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">System Permissions</div>
          </div>
          
          <div className="space-y-6 mb-6">
            {['Dashboards', 'Data', 'Administration', 'AI & Models'].map(category => (
              <div key={category} className="bg-background-paper rounded-lg border border-secondary/10">
                <div className="font-medium px-4 py-3 border-b border-secondary/10">
                  {category}
                </div>
                <div className="divide-y divide-secondary/10">
                  {permissions
                    .filter(p => p.category === category)
                    .map(permission => (
                      <div key={permission.id} className="px-4 py-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">
                            {permission.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </div>
                          <div className="text-text-secondary text-sm">
                            {permission.description}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-xs text-text-secondary">
                            Used in {roles.filter(r => r.permissions.includes(permission.name) || r.permissions.includes('all')).length} roles
                          </div>
                          <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                            Details
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
            <h3 className="font-medium mb-2">Custom Permissions</h3>
            <p className="text-sm text-text-secondary mb-4">
              You can create custom permissions for specific business requirements.
              Custom permissions can be assigned to roles just like system permissions.
            </p>
            <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
              Create Custom Permission
            </button>
          </div>
        </>
      )}
      
      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">Audit Log</div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                Export Log
              </button>
              <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-lg border border-secondary/20 mb-6">
            <table className="w-full text-sm">
              <thead className="bg-secondary/10">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Timestamp</th>
                  <th className="py-3 px-4 text-left font-medium">User</th>
                  <th className="py-3 px-4 text-left font-medium">Action</th>
                  <th className="py-3 px-4 text-left font-medium">Resource</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.map(log => (
                  <tr key={log.id} className="border-t border-secondary/10 hover:bg-secondary/5">
                    <td className="py-3 px-4">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4">{log.user}</td>
                    <td className="py-3 px-4">{log.action}</td>
                    <td className="py-3 px-4">{log.resource}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.status === 'success' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
            <h3 className="font-medium mb-2">Security Monitoring</h3>
            <p className="text-sm text-text-secondary mb-4">
              In addition to the audit log, Monolith Analytics continuously monitors for suspicious activities 
              and potential security threats. Configure alerts and notifications for critical security events.
            </p>
            <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
              Configure Security Alerts
            </button>
          </div>
        </>
      )}
    </AppLayout>
  )
} 