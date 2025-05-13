'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useMission } from '../lib/missionContext'

export default function DataModelingPage() {
  const { currentMission } = useMission()
  const [activeTab, setActiveTab] = useState('models')
  
  // Sample data models
  const dataModels = [
    {
      id: 'model1',
      name: 'Customer Segmentation',
      description: 'Logical grouping of customers based on behavior and attributes',
      entities: ['Customer', 'Segment', 'Behavior'],
      lastUpdated: '2023-09-10T14:30:00Z',
      rules: [
        'If purchase_frequency > 2/month → high_value_customer',
        'If inactive_days > 90 → churn_risk',
        'If avg_cart_value > $200 → premium_segment'
      ]
    },
    {
      id: 'model2',
      name: 'Sales Attribution',
      description: 'Track contribution of marketing channels to sales',
      entities: ['Sale', 'Channel', 'Campaign', 'Touchpoint'],
      lastUpdated: '2023-09-14T09:15:00Z',
      rules: [
        'First touch: 30% attribution weight',
        'Last touch: 40% attribution weight',
        'Intermediate: 30% distributed by time decay'
      ]
    },
    {
      id: 'model3',
      name: 'Inventory Forecasting',
      description: 'Predict inventory needs based on historical data and trends',
      entities: ['Product', 'Warehouse', 'Sales History', 'Season'],
      lastUpdated: '2023-09-15T11:45:00Z',
      rules: [
        'If seasonality_index > 1.2 → increase_forecast by 20%',
        'If stock_turnover < 3/month → reduce_order_suggestion',
        'If lead_time > 14 days → increase_safety_stock'
      ]
    }
  ]
  
  // Sample rules
  const businessRules = [
    {
      id: 'rule1',
      name: 'High-Value Customer',
      condition: 'purchase_frequency > 2/month || total_spend > $1000/quarter',
      actions: ['Apply 10% loyalty discount', 'Add to premium marketing list', 'Assign dedicated account manager'],
      priority: 'High',
      status: 'Active'
    },
    {
      id: 'rule2',
      name: 'Churn Risk Alert',
      condition: 'days_since_last_purchase > 60 && previous_frequency < 30 days',
      actions: ['Trigger re-engagement campaign', 'Offer special discount', 'Schedule follow-up call'],
      priority: 'Critical',
      status: 'Active'
    },
    {
      id: 'rule3',
      name: 'Fraud Detection',
      condition: 'transaction_amount > 3 * avg_transaction && location != usual_locations',
      actions: ['Flag for review', 'Temporarily suspend account', 'Send verification email'],
      priority: 'Critical',
      status: 'Active'
    },
    {
      id: 'rule4',
      name: 'Cross-Sell Opportunity',
      condition: 'purchased_product_category = "A" && !has_purchased_category("B") && interest_score("B") > 0.7',
      actions: ['Show category B recommendations', 'Apply bundle discount if added to cart', 'Track conversion'],
      priority: 'Medium',
      status: 'Active'
    }
  ]
  
  // Sample entities
  const entities = [
    {
      name: 'Customer',
      attributes: [
        { name: 'id', type: 'string', isPrimary: true },
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'segment', type: 'string' },
        { name: 'lifetime_value', type: 'number' },
        { name: 'acquisition_date', type: 'date' }
      ],
      relationships: [
        { entity: 'Order', type: 'one-to-many', field: 'customer_id' },
        { entity: 'Segment', type: 'many-to-one', field: 'segment_id' }
      ]
    },
    {
      name: 'Order',
      attributes: [
        { name: 'id', type: 'string', isPrimary: true },
        { name: 'customer_id', type: 'string', isForeign: true },
        { name: 'date', type: 'date' },
        { name: 'total', type: 'number' },
        { name: 'status', type: 'string' }
      ],
      relationships: [
        { entity: 'Customer', type: 'many-to-one', field: 'customer_id' },
        { entity: 'OrderItem', type: 'one-to-many', field: 'order_id' }
      ]
    },
    {
      name: 'Product',
      attributes: [
        { name: 'id', type: 'string', isPrimary: true },
        { name: 'name', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'inventory_count', type: 'number' }
      ],
      relationships: [
        { entity: 'OrderItem', type: 'one-to-many', field: 'product_id' },
        { entity: 'Category', type: 'many-to-one', field: 'category_id' }
      ]
    }
  ]

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Data Modeling</h1>
        <p className="text-text-secondary">Define logical models and business rules for your data</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-secondary/20 mb-6">
        <nav className="flex space-x-8">
          {['models', 'rules', 'entities', 'visualize'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-secondary/30'
              }`}
            >
              {tab === 'models' ? 'Data Models' : 
               tab === 'rules' ? 'Business Rules' : 
               tab === 'entities' ? 'Entity Management' : 
               'Visualize'}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Data Models Tab */}
      {activeTab === 'models' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">Logical Data Models</div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Create New Model
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {dataModels.map(model => (
              <div key={model.id} className="bg-background-paper rounded-lg p-4 border border-secondary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{model.name}</h3>
                    <div className="text-sm text-text-secondary mt-1">
                      {model.description}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      Last updated: {new Date(model.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Visualize
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-secondary/10">
                  <div className="text-xs text-text-secondary mb-2">Entities:</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {model.entities.map(entity => (
                      <span key={entity} className="bg-secondary/10 text-text-secondary px-2 py-1 rounded-md text-xs">
                        {entity}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-text-secondary mb-2">Logic Rules:</div>
                  <ul className="text-sm space-y-1 pl-5 list-disc">
                    {model.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Business Rules Tab */}
      {activeTab === 'rules' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">Business Rules</div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Create New Rule
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {businessRules.map(rule => (
              <div key={rule.id} className="bg-background-paper rounded-lg p-4 border border-secondary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        rule.priority === 'Critical' ? 'bg-red-500' :
                        rule.priority === 'High' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <h3 className="font-medium">{rule.name}</h3>
                      <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                        rule.status === 'Active' ? 'bg-green-500/20 text-green-600' : 'bg-gray-500/20 text-gray-600'
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                    <div className="text-sm font-mono bg-secondary/5 p-2 rounded mt-2 border border-secondary/10">
                      {rule.condition}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Test
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-secondary/10">
                  <div className="text-xs text-text-secondary mb-2">Actions:</div>
                  <ul className="text-sm space-y-1 pl-5 list-disc">
                    {rule.actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-secondary/5 rounded-lg p-4 border border-secondary/10">
            <h3 className="font-medium mb-2">Rules Engine</h3>
            <p className="text-sm text-text-secondary mb-4">
              Business rules are automatically evaluated against your data in real-time. 
              Rules can trigger actions, transformations, or alerts based on conditions you define.
            </p>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                View Rule History
              </button>
              <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                Test Rules
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Entity Management Tab */}
      {activeTab === 'entities' && (
        <>
          <div className="flex justify-between mb-6">
            <div className="text-lg font-medium">Entity Management</div>
            <button className="px-4 py-2 bg-primary hover:bg-primary-light text-text-primary rounded-md text-sm">
              Create New Entity
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-8">
            {entities.map(entity => (
              <div key={entity.name} className="bg-background-paper rounded-lg p-4 border border-secondary/10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-lg">{entity.name}</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
                      View Data
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Attributes</div>
                  <div className="bg-secondary/5 p-3 rounded border border-secondary/10 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-secondary/10">
                          <th className="text-left pb-2 pr-4 font-medium">Name</th>
                          <th className="text-left pb-2 pr-4 font-medium">Type</th>
                          <th className="text-left pb-2 font-medium">Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entity.attributes.map(attr => (
                          <tr key={attr.name} className="border-b border-secondary/5">
                            <td className="py-2 pr-4">{attr.name}</td>
                            <td className="py-2 pr-4">{attr.type}</td>
                            <td className="py-2">
                              {attr.isPrimary && (
                                <span className="bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded-full text-xs mr-1">
                                  Primary
                                </span>
                              )}
                              {attr.isForeign && (
                                <span className="bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                  Foreign Key
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Relationships</div>
                  <ul className="bg-secondary/5 p-3 rounded border border-secondary/10 space-y-2">
                    {entity.relationships.map((rel, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-accent mr-2">↔</span>
                        <span>
                          <span className="font-medium">{rel.entity}</span>
                          <span className="text-text-secondary"> ({rel.type}) via </span>
                          <span className="font-mono text-xs bg-secondary/20 px-1 rounded">{rel.field}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Visualize Tab */}
      {activeTab === 'visualize' && (
        <div className="bg-background-paper rounded-lg p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-30">Entity Relationship Diagram</div>
            <p className="text-text-secondary mb-4">
              The visual data modeling tool is under development. This feature will provide interactive ERD diagrams 
              and model visualizations.
            </p>
            <button className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-md text-sm">
              Preview Beta Version
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
} 