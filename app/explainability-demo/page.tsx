'use client'

import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import DecisionExplanationViewer from '../components/explainability/DecisionExplanationViewer'
import { LineageVisualization } from '../components/lineage/LineageVisualization'
import { logDecisionWithLineage } from '../lib/logLineage'

export default function ExplainabilityDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'decisions' | 'lineage' | 'integration'>('decisions')
  const [isCreatingDecision, setIsCreatingDecision] = useState(false)

  const handleCreateSampleDecision = async () => {
    setIsCreatingDecision(true)
    try {
      await logDecisionWithLineage({
        title: 'Demo: Customer Segmentation Decision',
        description: 'AI-modell segmenterade kunder baserat på köpbeteende och engagemang',
        decisionType: 'classification',
        outcome: 'Identified 3 distinct customer segments: High-Value (23%), Regular (65%), At-Risk (12%)',
        confidence: 0.89,
        agentId: 'customer_segmentation_agent_v1',
        missionId: 'clxyz123', // Sample mission ID
        entityType: 'customer_data',
        entityId: 'customer_dataset_001',
        inputData: {
          features: ['purchase_frequency', 'avg_order_value', 'last_purchase_days', 'support_interactions'],
          customerCount: 15420,
          timeframe: '12 months',
          algorithm: 'K-means clustering'
        },
        reasoning: 'Algoritmen identifierade tydliga kluster baserat på köpfrekvens och värde. High-Value kunder har >5 köp/månad och >2000kr genomsnittligt ordervärde. At-Risk kunder har inte köpt på >90 dagar.',
        alternatives: [
          {
            decision: '4-segment model',
            confidence: 0.76,
            reasoning: 'Mer granulär segmentering men lägre statistisk signifikans'
          },
          {
            decision: 'Behavioral-only segmentation',
            confidence: 0.82,
            reasoning: 'Baserat endast på beteende utan ekonomiska faktorer'
          }
        ],
        impactLevel: 'high',
        status: 'approved',
        step: 'customer_segmentation',
        source: 'ML Pipeline'
      })
      
      alert('Demo-beslut skapat! Uppdatera sidan för att se det.')
    } catch (error) {
      console.error('Failed to create demo decision:', error)
      alert('Fel vid skapande av demo-beslut')
    } finally {
      setIsCreatingDecision(false)
    }
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Explainability Demo</h1>
        <p className="text-text-secondary">
          Demonstrerar hur AI-beslut kan förklaras och spåras genom hela systemet med hjälp av lineage-kedjor.
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap border-b border-secondary/20 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeDemo === 'decisions' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveDemo('decisions')}
        >
          Beslut & Förklaringar
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeDemo === 'lineage' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveDemo('lineage')}
        >
          Lineage Visualization
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeDemo === 'integration' 
              ? 'border-b-2 border-primary text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveDemo('integration')}
        >
          Mission Integration
        </button>
      </div>

      {/* Decisions Demo */}
      {activeDemo === 'decisions' && (
        <div className="space-y-6">
          <Card title="AI-Beslut med Förklaringar">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-medium mb-2">Funktioner:</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Visa alla AI-beslut med konfidensgrad och resonemang</li>
                  <li>• Filtrera på beslutstyp, status och påverkansnivå</li>
                  <li>• Klicka "Förklara beslut" för att se fullständig lineage-kedja</li>
                  <li>• Visa alternativa beslut som övervägdes</li>
                  <li>• Spåra från input-data till slutgiltigt beslut</li>
                </ul>
              </div>
              
              <div className="flex gap-3 mb-4">
                <Button
                  variant="primary"
                  onClick={handleCreateSampleDecision}
                  disabled={isCreatingDecision}
                >
                  {isCreatingDecision ? 'Skapar...' : 'Skapa Demo-Beslut'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  Uppdatera Data
                </Button>
              </div>
            </div>
          </Card>

          <DecisionExplanationViewer limit={10} />
        </div>
      )}

      {/* Lineage Demo */}
      {activeDemo === 'lineage' && (
        <div className="space-y-6">
          <Card title="Lineage Visualization">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-medium mb-2">Funktioner:</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Visualisera hela data-transformationskedjan</li>
                  <li>• Se input och output för varje steg</li>
                  <li>• Spåra vilka agenter och pipelines som använts</li>
                  <li>• Filtrera på tidsperiod och steg-typ</li>
                  <li>• Exportera lineage-data för analys</li>
                </ul>
              </div>
            </div>
          </Card>

          <LineageVisualization />
        </div>
      )}

      {/* Integration Demo */}
      {activeDemo === 'integration' && (
        <div className="space-y-6">
          <Card title="Mission Integration">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-medium mb-2">Hur det fungerar:</h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-background-elevated p-3 rounded-md">
                    <div className="font-medium mb-1">1. AI-Agent fattar beslut</div>
                    <div className="text-text-secondary">
                      En AI-agent analyserar data och fattar ett beslut (t.ex. anomali-detektion, prediktion)
                    </div>
                  </div>
                  
                  <div className="bg-background-elevated p-3 rounded-md">
                    <div className="font-medium mb-1">2. Lineage loggas automatiskt</div>
                    <div className="text-text-secondary">
                      Systemet loggar input, transformation, output och metadata för spårbarhet
                    </div>
                  </div>
                  
                  <div className="bg-background-elevated p-3 rounded-md">
                    <div className="font-medium mb-1">3. Beslut kopplas till Mission</div>
                    <div className="text-text-secondary">
                      Beslutet länkas till relevant mission för kontext och uppföljning
                    </div>
                  </div>
                  
                  <div className="bg-background-elevated p-3 rounded-md">
                    <div className="font-medium mb-1">4. Förklaring genereras</div>
                    <div className="text-text-secondary">
                      DecisionExplanation skapas med resonemang, alternativ och konfidensgrad
                    </div>
                  </div>
                  
                  <div className="bg-background-elevated p-3 rounded-md">
                    <div className="font-medium mb-1">5. Användare kan spåra</div>
                    <div className="text-text-secondary">
                      I Mission-vyn kan användare se alla beslut och klicka för att förstå hela kedjan
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-secondary/20 pt-4">
                <h3 className="font-medium mb-2">Exempel på användning:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="font-medium text-blue-800 mb-1">Incident Reports</div>
                    <div className="text-blue-700">
                      När en anomali detekteras skapas automatiskt en incident med full lineage-spårning
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="font-medium text-green-800 mb-1">AI Recommendations</div>
                    <div className="text-green-700">
                      Rekommendationer från AI kan förklaras steg-för-steg med data-källor och logik
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-md">
                    <div className="font-medium text-purple-800 mb-1">Data Quality</div>
                    <div className="text-purple-700">
                      Kvalitetskontroller loggas med beslut om åtgärder och deras motivering
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-3 rounded-md">
                    <div className="font-medium text-orange-800 mb-1">Predictive Models</div>
                    <div className="text-orange-700">
                      ML-prediktioner kan spåras från träningsdata till slutgiltig prediktion
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Testa Mission Integration">
            <div className="p-4">
              <p className="text-sm text-text-secondary mb-4">
                Gå till en mission-sida och klicka på "Explainability"-fliken för att se alla beslut kopplade till den missionen.
              </p>
              <Button
                variant="primary"
                onClick={() => window.open('/missions', '_blank')}
              >
                Öppna Missions
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  )
} 