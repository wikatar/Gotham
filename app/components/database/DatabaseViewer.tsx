'use client'

import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

// Sample database table with schema and sample data
const sampleTables = [
  {
    name: 'Users',
    schema: [
      { name: 'id', type: 'string', primary: true },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'created_at', type: 'date' },
      { name: 'status', type: 'string' },
    ],
    data: [
      { id: '001', name: 'John Doe', email: 'john@example.com', created_at: '2023-01-15', status: 'active' },
      { id: '002', name: 'Jane Smith', email: 'jane@example.com', created_at: '2023-02-10', status: 'active' },
      { id: '003', name: 'Mike Johnson', email: 'mike@example.com', created_at: '2023-03-05', status: 'inactive' },
    ],
  },
  {
    name: 'Products',
    schema: [
      { name: 'id', type: 'string', primary: true },
      { name: 'name', type: 'string' },
      { name: 'category', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'stock', type: 'number' },
    ],
    data: [
      { id: 'P001', name: 'Laptop Pro', category: 'Electronics', price: 1299.99, stock: 45 },
      { id: 'P002', name: 'Ergonomic Chair', category: 'Furniture', price: 249.99, stock: 23 },
      { id: 'P003', name: 'Coffee Maker', category: 'Appliances', price: 89.99, stock: 12 },
    ],
  },
]

export default function DatabaseViewer() {
  const [activeTable, setActiveTable] = useState(sampleTables[0])
  const [isFiltering, setIsFiltering] = useState(false)
  const [isSchemaVisible, setIsSchemaVisible] = useState(false)
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {sampleTables.map((table) => (
            <Button
              key={table.name}
              variant={activeTable.name === table.name ? 'primary' : 'secondary'}
              onClick={() => setActiveTable(table)}
            >
              {table.name}
            </Button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="secondary"
            onClick={() => setIsSchemaVisible(!isSchemaVisible)}
          >
            {isSchemaVisible ? 'Hide Schema' : 'View Schema'}
          </Button>
          <Button 
            variant="secondary"
            onClick={() => setIsFiltering(!isFiltering)}
          >
            {isFiltering ? 'Clear Filter' : 'Filter'}
          </Button>
        </div>
      </div>
      
      {isSchemaVisible && (
        <Card title={`${activeTable.name} Schema`} className="mb-4">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-secondary/20">
                  <th className="py-2 px-4 text-left">Column</th>
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Primary</th>
                </tr>
              </thead>
              <tbody>
                {activeTable.schema.map((column) => (
                  <tr key={column.name} className="border-b border-secondary/10">
                    <td className="py-2 px-4">{column.name}</td>
                    <td className="py-2 px-4 text-text-secondary">{column.type}</td>
                    <td className="py-2 px-4">{column.primary ? '✓' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      <Card title={`${activeTable.name} Data`} className="mb-4">
        {isFiltering && (
          <div className="mb-4 p-3 bg-background rounded-md border border-secondary/30">
            <div className="text-sm mb-2">Filter conditions:</div>
            <div className="flex items-center space-x-2">
              <select className="bg-background-elevated p-2 rounded-md border border-secondary/30">
                {activeTable.schema.map((column) => (
                  <option key={column.name} value={column.name}>{column.name}</option>
                ))}
              </select>
              <select className="bg-background-elevated p-2 rounded-md border border-secondary/30">
                <option value="equals">equals</option>
                <option value="contains">contains</option>
                <option value="greater_than">greater than</option>
                <option value="less_than">less than</option>
              </select>
              <input 
                type="text" 
                placeholder="Value" 
                className="bg-background-elevated p-2 rounded-md border border-secondary/30 flex-1"
              />
              <Button variant="secondary" size="sm">Apply</Button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary/20">
                {activeTable.schema.map((column) => (
                  <th key={column.name} className="py-2 px-4 text-left">
                    {column.name}
                    <span className="ml-1 text-text-secondary text-xs">({column.type})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTable.data.map((row, index) => (
                <tr key={index} className="border-b border-secondary/10 hover:bg-secondary/5">
                  {activeTable.schema.map((column) => (
                    <td key={column.name} className="py-2 px-4">
                      {row[column.name as keyof typeof row]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
} 