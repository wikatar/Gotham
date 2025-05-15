'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

// Types
interface EntityType {
  id: string
  name: string
  description?: string
  fields: EntityFieldMap[]
  relations: any[]
  createdAt: string
  updatedAt: string
}

interface EntityFieldMap {
  id: string
  entityTypeId: string
  cleanedFieldName: string
  semanticName: string
  createdAt: string
}

interface CleanedSchema {
  id: string
  name: string
  dataSource: {
    id: string
    name: string
    sourceType: string
  }
  schema: {
    name: string
    type: string
    sample: any
  }[]
  hasData: boolean
}

export default function SemanticModelEditor() {
  // State for entity types
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // State for cleaned data schemas
  const [cleanedSchemas, setCleanedSchemas] = useState<CleanedSchema[]>([])
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('')
  const [selectedSchema, setSelectedSchema] = useState<CleanedSchema | null>(null)
  
  // State for the form
  const [formState, setFormState] = useState({
    name: '',
    description: '',
  })
  
  // State for mapping fields
  const [selectedEntityTypeId, setSelectedEntityTypeId] = useState<string>('')
  const [fieldMappings, setFieldMappings] = useState<{cleanedFieldName: string, semanticName: string}[]>([])
  
  // Fetch entity types on component mount
  useEffect(() => {
    fetchEntityTypes()
    fetchCleanedSchemas()
  }, [])
  
  // Update selected schema when schema ID changes
  useEffect(() => {
    if (selectedSchemaId) {
      const schema = cleanedSchemas.find(s => s.id === selectedSchemaId) || null
      setSelectedSchema(schema)
      
      // Reset field mappings when schema changes
      if (schema) {
        setFieldMappings(
          schema.schema.map(field => ({
            cleanedFieldName: field.name,
            semanticName: toSemanticName(field.name)
          }))
        )
      } else {
        setFieldMappings([])
      }
    } else {
      setSelectedSchema(null)
      setFieldMappings([])
    }
  }, [selectedSchemaId, cleanedSchemas])
  
  // Fetch entity types from the API
  const fetchEntityTypes = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/entity-types/list')
      if (response.data.success) {
        setEntityTypes(response.data.data)
      } else {
        setError(response.data.error || 'Failed to fetch entity types')
      }
    } catch (err) {
      console.error('Error fetching entity types:', err)
      setError('Failed to fetch entity types')
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch cleaned data schemas from the API
  const fetchCleanedSchemas = async () => {
    try {
      const response = await axios.get('/api/entity-types/cleaned-schemas')
      if (response.data.success) {
        setCleanedSchemas(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching cleaned schemas:', err)
    }
  }
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle form submission
  const handleCreateEntityType = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await axios.post('/api/entity-types/create', formState)
      
      if (response.data.success) {
        setSuccess('Entity type created successfully')
        setFormState({
          name: '',
          description: ''
        })
        // Refresh the entity types list
        fetchEntityTypes()
        // Select the newly created entity type for field mapping
        setSelectedEntityTypeId(response.data.data.id)
      } else {
        setError(response.data.error || 'Failed to create entity type')
      }
    } catch (err: any) {
      console.error('Error creating entity type:', err)
      setError(err.response?.data?.message || 'Failed to create entity type')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle schema selection change
  const handleSchemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchemaId(e.target.value)
  }
  
  // Handle entity type selection change for mapping
  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEntityTypeId(e.target.value)
  }
  
  // Handle field mapping input change
  const handleFieldMappingChange = (index: number, semanticName: string) => {
    const newMappings = [...fieldMappings]
    newMappings[index].semanticName = semanticName
    setFieldMappings(newMappings)
  }
  
  // Convert field name to semantic name (camelCase)
  const toSemanticName = (fieldName: string): string => {
    // Replace special characters and spaces with underscores
    let sanitized = fieldName.replace(/[^a-zA-Z0-9_]/g, '_')
    
    // Split on underscores
    const parts = sanitized.split('_').filter(part => part.length > 0)
    
    // Convert to camelCase
    if (parts.length > 0) {
      return parts.map((part, index) => {
        if (index === 0) {
          return part.toLowerCase()
        }
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      }).join('')
    }
    
    return sanitized.toLowerCase()
  }
  
  // Add a field mapping to the selected entity type
  const addFieldMapping = async (fieldMapping: {cleanedFieldName: string, semanticName: string}) => {
    if (!selectedEntityTypeId) {
      setError('Please select an entity type first')
      return
    }
    
    try {
      const response = await axios.post('/api/entity-types/add-field', {
        entityTypeId: selectedEntityTypeId,
        cleanedFieldName: fieldMapping.cleanedFieldName,
        semanticName: fieldMapping.semanticName
      })
      
      if (response.data.success) {
        setSuccess(`Field ${fieldMapping.cleanedFieldName} mapped successfully`)
        // Refresh the entity types list
        fetchEntityTypes()
      } else {
        setError(response.data.error || 'Failed to map field')
      }
    } catch (err: any) {
      console.error('Error mapping field:', err)
      setError(err.response?.data?.message || 'Failed to map field')
    }
  }
  
  // Map all fields at once
  const mapAllFields = async () => {
    if (!selectedEntityTypeId) {
      setError('Please select an entity type first')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Filter out fields with empty semantic names
      const validMappings = fieldMappings.filter(mapping => mapping.semanticName.trim() !== '')
      
      if (validMappings.length === 0) {
        setError('No valid field mappings found')
        return
      }
      
      // Map each field sequentially
      for (const mapping of validMappings) {
        await addFieldMapping(mapping)
      }
      
      setSuccess(`${validMappings.length} fields mapped successfully`)
      // Refresh the entity types list
      fetchEntityTypes()
    } catch (err: any) {
      console.error('Error mapping fields:', err)
      setError(err.response?.data?.message || 'Failed to map fields')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Semantic Model Editor</h1>
      
      {/* Error and success messages */}
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
      
      {/* Entity Type Creation Form */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Create Entity Type</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Define a new semantic entity type for your data model
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleCreateEntityType} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Entity Name */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Entity Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Customer, Product, Order, etc."
                  />
                </div>
              </div>
              
              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    id="description"
                    value={formState.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="A brief description of this entity type and its purpose"
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
                {loading ? 'Creating...' : 'Create Entity Type'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Field Mapping Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Map Fields to Entity Type</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Select a cleaned data schema and map its fields to a semantic entity type
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Entity Type Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="entityType" className="block text-sm font-medium text-gray-700">
                Select Entity Type
              </label>
              <div className="mt-1">
                <select
                  id="entityType"
                  name="entityType"
                  value={selectedEntityTypeId}
                  onChange={handleEntityTypeChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select an entity type</option>
                  {entityTypes.map(entityType => (
                    <option key={entityType.id} value={entityType.id}>
                      {entityType.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Cleaned Schema Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="schema" className="block text-sm font-medium text-gray-700">
                Select Cleaned Data Schema
              </label>
              <div className="mt-1">
                <select
                  id="schema"
                  name="schema"
                  value={selectedSchemaId}
                  onChange={handleSchemaChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a schema</option>
                  {cleanedSchemas.map(schema => (
                    <option key={schema.id} value={schema.id}>
                      {schema.name} ({schema.dataSource.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Field Mapping Table */}
          {selectedSchema && selectedEntityTypeId && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Map Fields</h3>
              <div className="mt-4 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Cleaned Field
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Type
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Semantic Name
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Sample Value
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Map</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {fieldMappings.map((mapping, index) => {
                            const schemaField = selectedSchema.schema.find(f => f.name === mapping.cleanedFieldName)
                            return (
                              <tr key={mapping.cleanedFieldName}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                  {mapping.cleanedFieldName}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {schemaField?.type || 'unknown'}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  <input
                                    type="text"
                                    value={mapping.semanticName}
                                    onChange={(e) => handleFieldMappingChange(index, e.target.value)}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {typeof schemaField?.sample === 'object' 
                                    ? JSON.stringify(schemaField?.sample).substring(0, 30) 
                                    : String(schemaField?.sample).substring(0, 30)}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                  <button
                                    type="button"
                                    onClick={() => addFieldMapping(mapping)}
                                    disabled={!mapping.semanticName.trim() || loading}
                                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                                  >
                                    Map field
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={mapAllFields}
                  disabled={loading || fieldMappings.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Mapping...' : 'Map All Fields'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Entity Types List will go here */}
    </div>
  )
} 