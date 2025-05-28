'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LogicManager from '../components/logic/LogicManager'
import { ENTITY_FIELDS, OPERATORS, ACTIONS } from '../types/logic'

export default function LogicBuilderDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'overview' | 'builder' | 'examples'>('overview')

  const exampleRules = [
    {
      name: 'Hög Riskpoäng Alert',
      entityType: 'customer',
      conditions: [
        { field: 'riskScore', operator: 'greater_than', value: 0.8 }
      ],
      actions: [
        { type: 'create_incident', parameters: { title: 'Hög kundrisk detekterad', severity: 'high' } },
        { type: 'notify_agent', parameters: { agentId: 'risk_management_agent' } }
      ],
      description: 'Skapa incident och notifiera agent när kundens riskpoäng överstiger 0.8'
    },
    {
      name: 'Pipeline Fel Eskalering',
      entityType: 'pipeline',
      conditions: [
        { field: 'status', operator: 'equals', value: 'failed' },
        { field: 'errorRate', operator: 'greater_than', value: 0.1 }
      ],
      actions: [
        { type: 'escalate', parameters: { escalationLevel: 'critical', assignedTo: 'devops-team' } },
        { type: 'send_email', parameters: { recipient: 'alerts@gotham.se', subject: 'Pipeline Critical Failure' } }
      ],
      description: 'Eskalera till DevOps när pipeline misslyckas med hög felfrekvens'
    },
    {
      name: 'Mission Auto-Complete',
      entityType: 'mission',
      conditions: [
        { field: 'status', operator: 'equals', value: 'active' },
        { field: 'endDate', operator: 'less_than', value: new Date().toISOString().split('T')[0] }
      ],
      actions: [
        { type: 'update_field', parameters: { field: 'status', value: 'completed' } },
        { type: 'log_event', parameters: { eventType: 'mission_auto_completed' } }
      ],
      description: 'Automatiskt markera mission som slutförd när slutdatum passerat'
    }
  ]

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Logic Builder Demo</h1>
        <p className="text-text-secondary">
          Skapa automatiska regler utan kod med visuell If-Then logik för hela systemet.
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap border-b border-secondary/20 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeDemo === 'overview' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveDemo('overview')}
        >
          Översikt
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeDemo === 'builder' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveDemo('builder')}
        >
          Logic Builder
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeDemo === 'examples' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveDemo('examples')}
        >
          Exempel & Användning
        </button>
      </div>

      {/* Overview */}
      {activeDemo === 'overview' && (
        <div className="space-y-6">
          <Card title="Vad är Logic Builder?">
            <div className="p-4">
              <p className="text-text-secondary mb-4">
                Logic Builder låter dig skapa automatiska regler utan att skriva kod. 
                Använd visuella If-Then komponenter för att definiera när systemet ska utföra specifika åtgärder.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Funktioner:</h3>
                  <ul className="text-sm text-text-secondary space-y-2">
                    <li>• <strong>If-Then Regler:</strong> Visuell regelbyggare</li>
                    <li>• <strong>Entitetsspecifik:</strong> Regler för missions, incidents, kunder</li>
                    <li>• <strong>Flexibla Villkor:</strong> Stöd för AND/OR logik</li>
                    <li>• <strong>Många Åtgärder:</strong> Notifieringar, incidents, webhooks</li>
                    <li>• <strong>Prioritering:</strong> Kontrollera exekveringsordning</li>
                    <li>• <strong>Aktivering/Inaktivering:</strong> Enkelt att stänga av regler</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Användningsområden:</h3>
                  <ul className="text-sm text-text-secondary space-y-2">
                    <li>• <strong>Automatisk Incident-skapande:</strong> Vid anomalier</li>
                    <li>• <strong>Risk Management:</strong> Flagga högrisk-kunder</li>
                    <li>• <strong>Pipeline Monitoring:</strong> Eskalera vid fel</li>
                    <li>• <strong>Mission Management:</strong> Auto-uppdatera status</li>
                    <li>• <strong>Notifieringar:</strong> Alert team vid kritiska händelser</li>
                    <li>• <strong>Data Quality:</strong> Flagga dålig datakvalitet</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Entitetstyper">
              <div className="p-4">
                <div className="space-y-3">
                  {Object.entries(ENTITY_FIELDS).map(([type, fields]) => (
                    <div key={type} className="border-b border-secondary/10 last:border-0 pb-2 last:pb-0">
                      <div className="font-medium capitalize">{type}</div>
                      <div className="text-xs text-text-secondary">
                        {fields.length} tillgängliga fält
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Operatorer">
              <div className="p-4">
                <div className="space-y-2 text-sm">
                  {Object.entries(OPERATORS).slice(0, 8).map(([op, def]) => (
                    <div key={op} className="flex justify-between">
                      <span>{def.label}</span>
                      <span className="text-text-secondary text-xs">
                        {def.supportedTypes.join(', ')}
                      </span>
                    </div>
                  ))}
                  <div className="text-xs text-text-secondary pt-2">
                    +{Object.keys(OPERATORS).length - 8} fler operatorer...
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Åtgärder">
              <div className="p-4">
                <div className="space-y-2 text-sm">
                  {Object.entries(ACTIONS).slice(0, 6).map(([action, def]) => (
                    <div key={action}>
                      <div className="font-medium">{def.label}</div>
                      <div className="text-xs text-text-secondary">{def.description}</div>
                    </div>
                  ))}
                  <div className="text-xs text-text-secondary pt-2">
                    +{Object.keys(ACTIONS).length - 6} fler åtgärder...
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Logic Builder */}
      {activeDemo === 'builder' && (
        <LogicManager
          title="Interaktiv Logic Builder"
          description="Testa att skapa dina egna regler med den visuella regelbyggaren"
        />
      )}

      {/* Examples */}
      {activeDemo === 'examples' && (
        <div className="space-y-6">
          <Card title="Exempel på Regler">
            <div className="p-4">
              <div className="space-y-6">
                {exampleRules.map((rule, index) => (
                  <div key={index} className="border border-secondary/20 rounded-lg p-4 bg-background-elevated">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-medium text-lg">{rule.name}</h3>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rule.entityType}
                      </div>
                    </div>
                    
                    <p className="text-text-secondary text-sm mb-4">{rule.description}</p>
                    
                    <div className="bg-background-paper p-3 rounded-md">
                      <div className="text-sm">
                        <div className="mb-2">
                          <span className="font-medium text-blue-600">OM:</span>
                          <span className="ml-2">
                            {rule.conditions.map((condition, i) => (
                              <span key={i}>
                                {i > 0 && ' OCH '}
                                {condition.field} {OPERATORS[condition.operator as keyof typeof OPERATORS]?.label} {condition.value}
                              </span>
                            ))}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">DÅ:</span>
                          <span className="ml-2">
                            {rule.actions.map((action, i) => (
                              <span key={i}>
                                {i > 0 && ', '}
                                {ACTIONS[action.type as keyof typeof ACTIONS]?.label}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Integration med Missions">
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-4">
                  Logic Builder kan integreras direkt i mission-vyn för att skapa mission-specifika regler.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="font-medium text-blue-800">Mission-specifika regler</div>
                    <div className="text-blue-700">Skapa regler som bara gäller för en specifik mission</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="font-medium text-green-800">Automatisk incident-skapande</div>
                    <div className="text-green-700">Skapa incidents automatiskt baserat på mission-status</div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => window.open('/missions', '_blank')}
                >
                  Öppna Missions
                </Button>
              </div>
            </Card>

            <Card title="Pipeline Integration">
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-4">
                  Använd Logic Builder för att övervaka och reagera på pipeline-händelser.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="bg-orange-50 p-3 rounded-md">
                    <div className="font-medium text-orange-800">Datakvalitetskontroll</div>
                    <div className="text-orange-700">Flagga när datakvalitetspoäng sjunker under tröskelvärde</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md">
                    <div className="font-medium text-red-800">Fel-eskalering</div>
                    <div className="text-red-700">Automatisk eskalering vid kritiska pipeline-fel</div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setActiveDemo('builder')}
                >
                  Testa Builder
                </Button>
              </div>
            </Card>
          </div>

          <Card title="Teknisk Implementation">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">API Endpoints:</h3>
                  <div className="space-y-2 text-sm font-mono bg-background-elevated p-3 rounded-md">
                    <div><span className="text-green-600">GET</span> /api/logic-rules</div>
                    <div><span className="text-blue-600">POST</span> /api/logic-rules</div>
                    <div><span className="text-yellow-600">PUT</span> /api/logic-rules/[id]</div>
                    <div><span className="text-red-600">DELETE</span> /api/logic-rules/[id]</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Databasmodell:</h3>
                  <div className="text-sm bg-background-elevated p-3 rounded-md">
                    <div className="font-mono">LogicRule {`{`}</div>
                    <div className="ml-4 text-text-secondary">
                      <div>name: string</div>
                      <div>conditions: JSON</div>
                      <div>actions: JSON</div>
                      <div>logicType: AND | OR</div>
                      <div>isActive: boolean</div>
                      <div>priority: number</div>
                    </div>
                    <div className="font-mono">{`}`}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  )
} 