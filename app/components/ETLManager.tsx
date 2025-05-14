'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { PlusIcon, PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

// Sample account ID - in a real app, this would come from authentication context
const DEFAULT_ACCOUNT_ID = '1'

export default function ETLManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [dataSources, setDataSources] = useState<any[]>([])
  const [pipelines, setPipelines] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataSourceId: '',
    accountId: DEFAULT_ACCOUNT_ID,
    interval: 60, // Default to 60 minutes
    cleaningPipelineId: '',
    config: {
      api: {
        url: 'mock://data',
        method: 'GET',
        queryParams: { type: 'generic' }
      }
    }
  })
  
  // Initialize with sample data
  useEffect(() => {
    // This would come from actual API calls in a real application
    setDataSources([
      { id: 'ds1', name: 'Sample User Data', type: 'api' },
      { id: 'ds2', name: 'Sample Transaction Data', type: 'api' },
      { id: 'ds3', name: 'Sample Location Data', type: 'api' }
    ])
    
    setPipelines([
      { id: 'pl1', name: 'Basic User Data Cleaning' },
      { id: 'pl2', name: 'Transaction Data Formatting' },
      { id: 'pl3', name: 'Location Data Normalization' }
    ])
    
    // Load tasks
    fetchTasks()
  }, [])
  
  // Fetch ETL tasks
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/etl/list?accountId=${DEFAULT_ACCOUNT_ID}`)
      setTasks(response.data.tasks || [])
    } catch (err: any) {
      console.error('Error fetching tasks:', err)
      setError(err.response?.data?.message || 'Failed to load ETL tasks')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'dataSourceId') {
      // Update config.api.queryParams.type based on data source
      const dataSource = dataSources.find(ds => ds.id === value)
      if (dataSource) {
        let queryType = 'generic'
        if (dataSource.name.toLowerCase().includes('user')) queryType = 'users'
        if (dataSource.name.toLowerCase().includes('transaction')) queryType = 'transactions'
        if (dataSource.name.toLowerCase().includes('location')) queryType = 'locations'
        
        setFormData({
          ...formData,
          dataSourceId: value,
          config: {
            ...formData.config,
            api: {
              ...formData.config.api,
              queryParams: { type: queryType }
            }
          }
        })
      } else {
        setFormData({
          ...formData,
          [name]: value
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }
  
  // Create ETL task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await axios.post('/api/etl/create', formData)
      setSuccess('ETL task created successfully')
      
      // Reset form
      setFormData({
        ...formData,
        name: '',
        description: '',
        dataSourceId: '',
        cleaningPipelineId: '',
      })
      
      // Refresh task list
      fetchTasks()
    } catch (err: any) {
      console.error('Error creating ETL task:', err)
      setError(err.response?.data?.message || 'Failed to create ETL task')
    } finally {
      setLoading(false)
    }
  }
  
  // Toggle task active state
  const handleToggleTask = async (taskId: string, isActive: boolean) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await axios.post('/api/etl/toggle', { id: taskId, isActive })
      setSuccess(`ETL task ${isActive ? 'started' : 'stopped'} successfully`)
      
      // Refresh task list
      fetchTasks()
    } catch (err: any) {
      console.error('Error toggling ETL task:', err)
      setError(err.response?.data?.message || 'Failed to update ETL task')
    } finally {
      setLoading(false)
    }
  }
  
  // Manually run a task
  const handleRunTask = async (taskId: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await axios.post('/api/etl/run', { taskId })
      
      const result = response.data.result
      if (result.success) {
        setSuccess(`ETL task executed successfully. Processed ${result.recordCount} records.${
          result.cleanedCount ? ` Cleaned ${result.cleanedCount} records.` : ''
        }`)
      } else {
        setError(`Failed to run ETL task: ${result.error}`)
      }
      
      // Refresh task list
      fetchTasks()
    } catch (err: any) {
      console.error('Error running ETL task:', err)
      setError(err.response?.data?.message || 'Failed to run ETL task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Task List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">ETL Tasks</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage and monitor your data extraction, transformation, and loading tasks.
          </p>
        </div>
        
        {loading && tasks.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-500">No ETL tasks found. Create your first task below.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interval
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Run
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.name}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{task.dataSourceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.interval ? `${task.interval} minutes` : task.cron || 'Manual'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.lastRunAt ? new Date(task.lastRunAt).toLocaleString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.nextRunAt ? new Date(task.nextRunAt).toLocaleString() : 'Not scheduled'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleToggleTask(task.id, !task.isActive)}
                          title={task.isActive ? 'Stop Task' : 'Start Task'}
                        >
                          {task.isActive ? (
                            <PauseIcon className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <PlayIcon className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleRunTask(task.id)}
                          title="Run Task Now"
                        >
                          <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Create Task Form */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Create ETL Task</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Set up a new scheduled data sync task.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleCreateTask} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Task Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div className="sm:col-span-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Data Source */}
              <div className="sm:col-span-3">
                <label htmlFor="dataSourceId" className="block text-sm font-medium text-gray-700">
                  Data Source
                </label>
                <div className="mt-1">
                  <select
                    id="dataSourceId"
                    name="dataSourceId"
                    value={formData.dataSourceId}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a data source</option>
                    {dataSources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Cleaning Pipeline */}
              <div className="sm:col-span-3">
                <label htmlFor="cleaningPipelineId" className="block text-sm font-medium text-gray-700">
                  Cleaning Pipeline (Optional)
                </label>
                <div className="mt-1">
                  <select
                    id="cleaningPipelineId"
                    name="cleaningPipelineId"
                    value={formData.cleaningPipelineId}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">None</option>
                    {pipelines.map((pipeline) => (
                      <option key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Interval */}
              <div className="sm:col-span-3">
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                  Sync Interval (minutes)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="interval"
                    id="interval"
                    min="1"
                    value={formData.interval}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create ETL Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 