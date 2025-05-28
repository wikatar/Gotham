'use client'

import React from 'react'
import Card from '@/app/components/ui/Card'
import AgentCard from '@/app/components/agent/AgentCard'
import PipelineResultCard from '@/app/components/pipelines/PipelineResultCard'
import EntityHeader from '@/app/components/entities/EntityHeader'

// Mock data
const mockAgent = {
  id: 'agent-001',
  name: 'Data Cleaning Agent',
  type: 'data-processor',
  description: 'Automatisk datarensning och validering för inkommande data',
  status: 'active' as const,
  lastActive: new Date('2024-01-15T10:30:00'),
  createdAt: new Date('2024-01-01T00:00:00'),
  capabilities: ['data-cleaning', 'validation', 'transformation'],
  permissionLevel: 'standard',
  assignedMissions: ['mission-1', 'mission-2'],
  performance: {
    accuracy: 95,
    efficiency: 88,
    responseTime: 250
  }
}

const mockPipelineExecution = {
  id: 'exec-001',
  pipelineId: 'pipeline-001',
  pipelineName: 'Customer Data ETL',
  status: 'success' as const,
  startedAt: new Date('2024-01-15T09:00:00'),
  endedAt: new Date('2024-01-15T09:05:30'),
  executionTime: 330000,
  input: { source: 'salesforce', records: 1500 },
  output: { processed: 1450, errors: 50 },
  user: {
    id: 'user-001',
    name: 'Anna Andersson',
    email: 'anna@gotham.se'
  }
}

const mockEntity = {
  id: 'entity-001',
  name: 'Acme Corporation',
  type: 'customer',
  externalId: 'SF-001234',
  metadata: {
    industry: 'Technology',
    employees: 500,
    revenue: 50000000,
    region: 'Stockholm'
  },
  createdAt: new Date('2024-01-01T00:00:00'),
  updatedAt: new Date('2024-01-15T10:00:00')
}

export default function LineageDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lineage Demo</h1>
        <p className="text-gray-600">
          Demonstration av "Visa kedja"-funktionalitet i nyckelkomponenter
        </p>
      </div>

      {/* Agent Card Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. AgentCard med Lineage</h2>
        <p className="text-gray-600 mb-4">
          Varje AI-agent har nu en "Visa kedja"-knapp som visar dess senaste eller valda output's lineage.
        </p>
        <div className="max-w-md">
          <AgentCard
            agent={mockAgent}
            onViewDetails={(id) => console.log('View details:', id)}
            onConfigureAgent={(id) => console.log('Configure agent:', id)}
          />
        </div>
      </section>

      {/* Pipeline Result Card Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">2. PipelineResultCard med Lineage</h2>
        <p className="text-gray-600 mb-4">
          Efter körd pipeline visas lineage över transformationen med detaljerad information.
        </p>
        <div className="max-w-2xl">
          <PipelineResultCard
            execution={mockPipelineExecution}
            onViewDetails={(id) => console.log('View execution details:', id)}
            onRunAgain={(pipelineId, input) => console.log('Run again:', pipelineId, input)}
          />
        </div>
      </section>

      {/* Entity Header Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">3. EntityHeader med Lineage</h2>
        <p className="text-gray-600 mb-4">
          I entitetsvy visas lineage som gäller just den entiteten med full metadata.
        </p>
        <div className="max-w-4xl">
          <EntityHeader
            entity={mockEntity}
            onEdit={(id) => console.log('Edit entity:', id)}
            onViewExternal={(externalId) => console.log('View external:', externalId)}
          />
        </div>
      </section>

      {/* Features Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Funktioner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="🔍 Filtrering">
            <ul className="text-sm space-y-1">
              <li>• Datumintervall (1d, 7d, 30d, alla)</li>
              <li>• Steg (cleaning, enrichment, AI, etc.)</li>
              <li>• Pipeline eller agent</li>
              <li>• Källa (Salesforce, API, etc.)</li>
            </ul>
          </Card>

          <Card title="📊 Visualisering">
            <ul className="text-sm space-y-1">
              <li>• Timeline-vy med steg</li>
              <li>• Graf-vy för relationer</li>
              <li>• Detaljerad input/output</li>
              <li>• Metadata och tidsstämplar</li>
            </ul>
          </Card>

          <Card title="🔄 Realtid">
            <ul className="text-sm space-y-1">
              <li>• Auto-uppdatering</li>
              <li>• Live pipeline-körningar</li>
              <li>• Notifikationer</li>
              <li>• Audit trail</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Empty State Demo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Tomvy</h2>
        <p className="text-gray-600 mb-4">
          När det inte finns någon lineage än visas en informativ tomvy:
        </p>
        <Card title="Exempel på tomvy" className="max-w-md">
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🫥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Inga transformationssteg hittades
            </h3>
            <p className="text-gray-600 mb-4">
              Inga transformationssteg har loggats än för denna entitet/agent.
            </p>
            <p className="text-sm text-gray-500">
              Kör en pipeline eller agent för att generera lineage-data.
            </p>
          </div>
        </Card>
      </section>
    </div>
  )
} 