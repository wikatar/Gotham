'use client'

import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { LogicRule } from '@prisma/client'
import { ActionResult, LogicEngineResult } from '../lib/logicEngine'

interface TestResult {
  success: boolean
  result: LogicEngineResult | any
  testData: any
  context: any
  error?: string
}

export default function LogicEngineDemo() {
  const [rules, setRules] = useState<LogicRule[]>([])
  const [sampleData, setSampleData] = useState<any>({})
  const [selectedEntityType, setSelectedEntityType] = useState<string>('customer')
  const [selectedRuleId, setSelectedRuleId] = useState<string>('')
  const [customTestData, setCustomTestData] = useState<string>('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('test')

  // Load rules and sample data on component mount
  useEffect(() => {
    loadRules()
    loadSampleData()
  }, [])

  const loadRules = async () => {
    try {
      const response = await fetch('/api/logic-rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data.rules || [])
      }
    } catch (error) {
      console.error('Error loading rules:', error)
    }
  }

  const loadSampleData = async () => {
    try {
      const response = await fetch('/api/logic-engine/test')
      if (response.ok) {
        const data = await response.json()
        setSampleData(data.sampleTestData || {})
      }
    } catch (error) {
      console.error('Error loading sample data:', error)
    }
  }

  const runTest = async (testType: 'all' | 'specific') => {
    setLoading(true)
    setTestResult(null)

    try {
      let testData: any
      
      if (customTestData.trim()) {
        try {
          testData = JSON.parse(customTestData)
        } catch (error) {
          setTestResult({
            success: false,
            result: null,
            testData: null,
            context: null,
            error: 'Invalid JSON in custom test data'
          })
          setLoading(false)
          return
        }
      } else {
        testData = sampleData[selectedEntityType] || {}
      }

      const requestBody: any = {
        testData,
        context: {
          entityType: selectedEntityType,
          entityId: `test_${selectedEntityType}_${Date.now()}`,
          userId: 'demo_user'
        }
      }

      if (testType === 'specific' && selectedRuleId) {
        requestBody.ruleId = selectedRuleId
      } else {
        requestBody.entityType = selectedEntityType
      }

      const response = await fetch('/api/logic-engine/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        result: null,
        testData: null,
        context: null,
        error: String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const formatActionResult = (actionResult: ActionResult) => {
    return (
      <div className="border rounded p-3 mb-2 bg-white">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={actionResult.success ? "default" : "outline"}>
            {actionResult.action.type}
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date(actionResult.executedAt).toLocaleTimeString()}
          </span>
        </div>
        
        {actionResult.success ? (
          <div className="text-sm">
            <p className="font-medium text-green-600">✓ Framgångsrikt exekverad</p>
            {actionResult.result && (
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(actionResult.result, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="text-sm">
            <p className="font-medium text-red-600">✗ Misslyckades</p>
            <p className="text-red-500 mt-1">{actionResult.error}</p>
          </div>
        )}
      </div>
    )
  }

  const entityTypes = [
    { value: 'customer', label: 'Kund' },
    { value: 'incident', label: 'Incident' },
    { value: 'mission', label: 'Mission' },
    { value: 'pipeline', label: 'Pipeline' },
    { value: 'anomaly', label: 'Anomali' }
  ]

  const TabButton = ({ id, label, active }: { id: string; label: string; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white border-b-2 border-blue-500'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logic Engine Demo</h1>
          <p className="text-gray-600 mt-2">
            Testa och validera Logic Engine med olika datatyper och regler
          </p>
        </div>
        <Button onClick={loadRules} variant="secondary">
          🔄 Uppdatera Regler
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200">
        <TabButton id="test" label="Testa Engine" active={activeTab === 'test'} />
        <TabButton id="rules" label="Aktiva Regler" active={activeTab === 'rules'} />
        <TabButton id="samples" label="Exempeldata" active={activeTab === 'samples'} />
      </div>

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <Card title="Test Konfiguration">
            <p className="text-gray-600 mb-4">
              Konfigurera testdata och kör Logic Engine
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Entitetstyp
                  </label>
                  <select
                    value={selectedEntityType}
                    onChange={(e) => setSelectedEntityType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {entityTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Specifik Regel (valfritt)
                  </label>
                  <select
                    value={selectedRuleId}
                    onChange={(e) => setSelectedRuleId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Alla regler</option>
                    {rules
                      .filter(rule => !rule.entityType || rule.entityType === selectedEntityType)
                      .map(rule => (
                        <option key={rule.id} value={rule.id}>
                          {rule.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Anpassad Testdata (JSON) - Lämna tom för att använda exempeldata
                </label>
                <textarea
                  value={customTestData}
                  onChange={(e) => setCustomTestData(e.target.value)}
                  placeholder='{"riskScore": 0.9, "status": "active"}'
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => runTest('all')} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? '⏳ Kör...' : '�� Kör Alla Regler'}
                </Button>
                <Button 
                  onClick={() => runTest('specific')} 
                  disabled={loading || !selectedRuleId}
                  variant="secondary"
                  className="flex-1"
                >
                  {loading ? '⏳ Kör...' : '🎯 Kör Specifik Regel'}
                </Button>
              </div>
            </div>
          </Card>

          {testResult && (
            <Card title="Testresultat" actions={
              <Badge variant={testResult.success ? "default" : "outline"}>
                {testResult.success ? 'Framgång' : 'Fel'}
              </Badge>
            }>
              {testResult.success ? (
                <div className="space-y-4">
                  {testResult.result.totalRulesEvaluated !== undefined ? (
                    // Full engine result
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {testResult.result.totalRulesEvaluated}
                        </div>
                        <div className="text-sm text-blue-600">Regler Utvärderade</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {testResult.result.rulesTriggered}
                        </div>
                        <div className="text-sm text-green-600">Regler Triggade</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">
                          {testResult.result.actionsExecuted}
                        </div>
                        <div className="text-sm text-purple-600">Åtgärder Utförda</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-gray-600">
                          {testResult.result.executionTime}ms
                        </div>
                        <div className="text-sm text-gray-600">Exekveringstid</div>
                      </div>
                    </div>
                  ) : (
                    // Single rule test result
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {testResult.result.triggered ? '✓' : '✗'}
                        </div>
                        <div className="text-sm text-blue-600">Regel Triggad</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {testResult.result.conditionResults?.length || 0}
                        </div>
                        <div className="text-sm text-green-600">Villkor Testade</div>
                      </div>
                    </div>
                  )}

                  {testResult.result.actionResults && testResult.result.actionResults.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Utförda Åtgärder:</h4>
                      <div className="space-y-2">
                        {testResult.result.actionResults.map((actionResult: ActionResult, index: number) => (
                          <div key={index}>
                            {formatActionResult(actionResult)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {testResult.result.errors && testResult.result.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                      <strong className="text-red-800">Fel under exekvering:</strong>
                      <ul className="mt-2 list-disc list-inside text-red-700">
                        {testResult.result.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium">Visa Fullständig Testdata</summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-4 rounded overflow-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <strong className="text-red-800">Fel:</strong> {testResult.error}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <Card title={`Aktiva Logic Rules (${rules.filter(r => r.isActive).length})`}>
          <p className="text-gray-600 mb-4">
            Regler som för närvarande är aktiva i systemet
          </p>
          
          {rules.filter(r => r.isActive).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Inga aktiva regler hittades. Skapa regler i Logic Builder först.
            </p>
          ) : (
            <div className="space-y-3">
              {rules.filter(r => r.isActive).map(rule => (
                <div key={rule.id} className="border rounded p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{rule.name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {rule.entityType || 'Global'}
                      </Badge>
                      <Badge variant="outline">
                        Prioritet {rule.priority}
                      </Badge>
                    </div>
                  </div>
                  {rule.description && (
                    <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    Skapad: {new Date(rule.createdAt).toLocaleDateString('sv-SE')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Samples Tab */}
      {activeTab === 'samples' && (
        <Card title="Exempeldata för Testning">
          <p className="text-gray-600 mb-4">
            Fördefinierad testdata för olika entitetstyper
          </p>
          
          <div className="space-y-4">
            {Object.entries(sampleData).map(([entityType, data]) => (
              <div key={entityType}>
                <h4 className="font-semibold mb-2 capitalize">
                  {entityTypes.find(t => t.value === entityType)?.label || entityType}
                </h4>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto border">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
} 