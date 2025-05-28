# Lineage Components Usage Guide

## Översikt

Detta dokument beskriver hur man använder de nya komponenterna med "Visa kedja"-funktionalitet i Gotham Analytics systemet.

## Komponenter

### 1. LineageModal

En modal/drawer komponent som visar lineage-data med filtrering och visualisering.

```tsx
import { LineageModal } from '@/app/components/lineage/LineageModal'

<LineageModal
  trigger={
    <Button variant="outline" size="sm">
      <GitBranch className="h-3 w-3" />
      Visa kedja
    </Button>
  }
  entityId="entity-123"
  pipelineId="pipeline-456"
  agentId="agent-789"
  title="Data Lineage - Customer ETL"
  description="Visa transformationssteg för kunddata"
/>
```

**Props:**
- `trigger`: React element som öppnar modalen
- `entityId?`: ID för specifik entitet
- `pipelineId?`: ID för specifik pipeline
- `agentId?`: ID för specifik agent
- `title?`: Titel för modalen
- `description?`: Beskrivning som visas under titeln

### 2. AgentCard (uppdaterad)

AI-agent kort med "Visa kedja"-knapp för att visa agentens lineage.

```tsx
import AgentCard from '@/app/components/agent/AgentCard'

<AgentCard
  agent={agent}
  onViewDetails={(id) => console.log('View details:', id)}
  onConfigureAgent={(id) => console.log('Configure:', id)}
/>
```

**Nya funktioner:**
- Automatisk "Visa kedja"-knapp som visar lineage för agentens outputs
- Filtrering på agent-specifika transformationssteg
- Svensk lokalisering

### 3. PipelineResultCard (ny)

Komponent för att visa pipeline-exekveringsresultat med lineage-funktionalitet.

```tsx
import PipelineResultCard from '@/app/components/pipelines/PipelineResultCard'

const execution = {
  id: 'exec-001',
  pipelineId: 'pipeline-001',
  pipelineName: 'Customer Data ETL',
  status: 'success',
  startedAt: new Date(),
  endedAt: new Date(),
  user: { id: '1', name: 'Anna', email: 'anna@gotham.se' }
}

<PipelineResultCard
  execution={execution}
  onViewDetails={(id) => console.log('View details:', id)}
  onRunAgain={(pipelineId, input) => console.log('Run again:', pipelineId)}
/>
```

**Funktioner:**
- Status-ikoner och färgkodning
- Varaktighet och tidsstämplar
- Fel-meddelanden och framgångssammanfattning
- "Visa kedja"-knapp för pipeline-specifik lineage
- "Kör igen"-funktionalitet

### 4. EntityHeader (ny)

Header-komponent för entitetsvyer med metadata och lineage-åtkomst.

```tsx
import EntityHeader from '@/app/components/entities/EntityHeader'

const entity = {
  id: 'entity-001',
  name: 'Acme Corporation',
  type: 'customer',
  externalId: 'SF-001234',
  metadata: { industry: 'Technology', employees: 500 },
  createdAt: new Date(),
  updatedAt: new Date()
}

<EntityHeader
  entity={entity}
  onEdit={(id) => console.log('Edit:', id)}
  onViewExternal={(externalId) => console.log('External:', externalId)}
/>
```

**Funktioner:**
- Entitetstyp-ikoner och färgkodning
- Metadata-visning (max 3 fält, expanderbar)
- Externa ID-länkar
- "Visa kedja"-knapp för entitet-specifik lineage
- Redigerings- och externa käll-knappar

## Filtrering

Alla lineage-modaler stödjer avancerad filtrering:

### Datumintervall
- Senaste dagen (1d)
- Senaste veckan (7d)
- Senaste månaden (30d)
- Alla

### Steg-typer
- Rensning (cleaning)
- Anrikning (enrichment)
- AI-bearbetning (ai)
- Validering (validation)
- Transformation (transformation)

### Källor
- Dynamisk lista baserad på tillgängliga källor
- Salesforce, API, Data Warehouse, etc.

## Tomvy

När ingen lineage-data finns visas en informativ tomvy:

```
🫥 Inga transformationssteg hittades
Inga transformationssteg har loggats än för denna entitet/agent.
Kör en pipeline eller agent för att generera lineage-data.
```

## Integration

### Befintliga komponenter

Uppdatera befintliga komponenter för att använda de nya lineage-funktionerna:

```tsx
// I PipelineHistory.tsx
import PipelineResultCard from '@/app/components/pipelines/PipelineResultCard'

// Ersätt gamla Card-komponenter med PipelineResultCard
<PipelineResultCard
  execution={transformedExecution}
  onViewDetails={setSelectedExecution}
  onRunAgain={handleRunAgain}
/>
```

### API-integration

Lineage-data hämtas automatiskt via befintliga API:er:

```typescript
// GET /api/lineage?entityId=123&agentId=456&pipelineId=789
// Stödjer filtrering och paginering
```

## Exempel

Se `/lineage-demo` för en komplett demonstration av alla komponenter och funktioner.

## Best Practices

1. **Använd rätt ID-typ**: Skicka `entityId`, `pipelineId`, eller `agentId` beroende på kontext
2. **Beskrivande titlar**: Ge tydliga titlar och beskrivningar för bättre användarupplevelse
3. **Felhantering**: Komponenter hanterar automatiskt fel och tomma tillstånd
4. **Prestanda**: Lineage-data laddas endast när modalen öppnas (`enabled` prop)
5. **Lokalisering**: Alla texter är på svenska för konsistens

## Tekniska detaljer

### Hooks

```typescript
import { useLineage } from '@/app/hooks/useLineage'

const { steps, loading, error, refresh } = useLineage({
  entityId: 'entity-123',
  agentId: 'agent-456',
  enabled: modalOpen,
  autoRefresh: false
})
```

### TypeScript-typer

Alla komponenter är fullt typade med TypeScript för bättre utvecklarupplevelse och typsäkerhet.

### Styling

Komponenter använder Tailwind CSS och shadcn/ui för konsistent design som matchar resten av systemet. 