# Explainability & Lineage System Guide

## Översikt

Gotham Analytics har nu ett komplett system för att förklara AI-beslut och spåra data-transformationer genom hela systemet. Detta ger full transparens och förklarbarhet för alla automatiska beslut och processer.

## Arkitektur

### 1. Database Models

#### DecisionExplanation
Spårar alla AI-beslut med förklaringar:
- **title**: Kort beskrivning av beslutet
- **decisionType**: prediction, classification, anomaly_detection, recommendation
- **outcome**: Resultatet av beslutet
- **confidence**: Säkerhet (0.0 - 1.0)
- **reasoning**: Förklaring av beslutsprocessen
- **alternatives**: Alternativa beslut som övervägdes
- **lineageId**: Koppling till LineageLog för spårbarhet

#### LineageLog (Utökad)
Spårar data-transformationer:
- **missionId**: Koppling till mission för kontext
- **input/output**: Vad som transformerades
- **step**: Typ av transformation
- **agentId**: AI-agent som utförde steget

#### IncidentReport (Utökad)
- **lineageId**: Koppling till LineageLog för spårbarhet

### 2. API Endpoints

#### `/api/decisions`
- **GET**: Hämta beslut med filtrering (missionId, agentId, decisionType, status)
- **POST**: Skapa nytt beslut med förklaring

#### `/api/lineage` (Befintlig)
- Hämta lineage-data med koppling till beslut

### 3. UI Components

#### DecisionExplanationViewer
- Visar alla AI-beslut med förklaringar
- Filtrering på typ, status, påverkansnivå
- "Förklara beslut" knapp öppnar LineageModal
- Visa alternativa beslut och resonemang

#### LineageModal (Utökad)
- Visar fullständig lineage-kedja för ett beslut
- Koppling mellan beslut och data-transformationer

## Användning

### 1. Logga Beslut med Lineage

```typescript
import { logDecisionWithLineage } from '@/app/lib/logLineage'

// Exempel: AI-agent fattar beslut om anomali
await logDecisionWithLineage({
  title: 'Anomali Detekterad i Kunddata',
  description: 'AI-modell identifierade ovanligt mönster i kundbeteende',
  decisionType: 'anomaly_detection',
  outcome: 'High-risk anomaly detected affecting 1,247 customers',
  confidence: 0.92,
  agentId: 'anomaly_detector_v2',
  missionId: 'customer_retention_q1',
  entityType: 'customer_data',
  entityId: 'customer_dataset_001',
  inputData: {
    features: ['login_frequency', 'purchase_behavior', 'support_tickets'],
    timeframe: '30 days',
    threshold: 0.85
  },
  reasoning: 'Modellen identifierade en 35% minskning i aktivitet kombinerat med ökade supportärenden',
  alternatives: [
    {
      decision: 'Medium risk classification',
      confidence: 0.67,
      reasoning: 'Baserat på mindre strikta tröskelvärden'
    }
  ],
  impactLevel: 'high',
  status: 'pending',
  step: 'anomaly_detection',
  source: 'ML Pipeline'
})
```

### 2. Mission Integration

I Mission-vyn finns nu en "Explainability"-flik som visar:
- Alla beslut kopplade till missionen
- Möjlighet att förklara varje beslut
- Fullständig lineage-spårning

```typescript
// I MissionDetailPage
<DecisionExplanationViewer 
  missionId={mission.id}
  limit={20}
/>
```

### 3. Incident Reports med Lineage

När incidents skapas kan de kopplas till lineage:

```typescript
// Skapa incident med lineage-koppling
await prisma.incidentReport.create({
  data: {
    title: 'APAC Customer Churn Spike',
    description: 'Automated detection of unusual churn pattern',
    sourceType: 'anomaly',
    missionId: 'customer_retention_q1',
    lineageId: 'lineage_log_id', // Koppling till beslut
    // ... andra fält
  }
})
```

## Funktioner

### 1. Beslut & Förklaringar
- **Filtrera beslut**: Efter typ, status, påverkansnivå
- **Visa detaljer**: Input-data, resonemang, alternativ
- **Spåra lineage**: Klicka "Förklara beslut" för fullständig kedja
- **Mission-kontext**: Se alla beslut för en specifik mission

### 2. Lineage Visualization
- **Visuell representation**: Av hela transformationskedjan
- **Steg-för-steg**: Input och output för varje transformation
- **Agent-spårning**: Vilka AI-agenter som använts
- **Export**: Lineage-data för analys

### 3. Mission Integration
- **Explainability-flik**: I varje mission
- **Kontextuell förklaring**: Beslut i relation till mission-mål
- **Audit trail**: Fullständig historik av beslut och åtgärder

## Exempel på Användningsfall

### 1. Anomali-detektion
```
1. AI-agent detekterar anomali i kunddata
2. Lineage loggas: input → analys → beslut
3. DecisionExplanation skapas med resonemang
4. Incident skapas automatiskt med lineage-koppling
5. Användare kan spåra från rådata till incident
```

### 2. Prediktiv Modell
```
1. ML-pipeline tränar modell på historisk data
2. Varje steg loggas: data prep → training → validation
3. Prediktioner görs med konfidensgrad
4. Beslut förklaras med feature importance
5. Användare kan förstå varför prediktion gjordes
```

### 3. Rekommendationssystem
```
1. AI analyserar användarbeteende
2. Rekommendationer genereras med alternativ
3. Beslut förklaras med användardata och logik
4. A/B-test resultat kopplas till beslut
5. Effektivitet kan spåras tillbaka till ursprungsdata
```

## Best Practices

### 1. Beslut-loggning
- **Alltid logga**: Viktiga AI-beslut med lineage
- **Tydligt resonemang**: Förklara varför beslutet fattades
- **Alternativ**: Visa andra möjliga beslut
- **Konfidensgrad**: Ärlig bedömning av säkerhet

### 2. Lineage-spårning
- **Granularitet**: Logga viktiga transformationssteg
- **Metadata**: Inkludera relevant kontext
- **Mission-koppling**: Koppla till relevant mission
- **Prestanda**: Logga asynkront för att inte påverka prestanda

### 3. UI/UX
- **Progressiv disclosure**: Visa översikt först, detaljer på begäran
- **Visuell hierarki**: Tydlig struktur för komplex information
- **Sökbarhet**: Filtrera och söka i beslut
- **Export**: Möjlighet att exportera för analys

## Teknisk Implementation

### 1. Database Schema
```sql
-- DecisionExplanation tabell
CREATE TABLE decision_explanations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  decision_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  confidence REAL NOT NULL,
  lineage_id TEXT REFERENCES lineage_logs(id),
  mission_id TEXT REFERENCES missions(id),
  -- ... andra fält
);

-- Utökad LineageLog
ALTER TABLE lineage_logs ADD COLUMN mission_id TEXT REFERENCES missions(id);

-- Utökad IncidentReport  
ALTER TABLE incident_reports ADD COLUMN lineage_id TEXT REFERENCES lineage_logs(id);
```

### 2. API Design
```typescript
// GET /api/decisions
interface DecisionQuery {
  missionId?: string
  agentId?: string
  decisionType?: string
  status?: string
  page?: number
  limit?: number
}

// POST /api/decisions
interface CreateDecisionRequest {
  title: string
  decisionType: string
  outcome: string
  confidence: number
  reasoning?: string
  alternatives?: any
  // ... andra fält
}
```

### 3. React Components
```typescript
// DecisionExplanationViewer
interface Props {
  missionId?: string
  agentId?: string
  entityId?: string
  entityType?: string
  limit?: number
}

// LineageModal med beslut-integration
interface Props {
  lineageId?: string
  decisionId?: string
  missionId?: string
  // ... andra props
}
```

## Framtida Utveckling

### 1. AI-assisterad Förklaring
- **Automatisk generering**: Av förklaringar baserat på modell-output
- **Natural language**: Förklaringar på svenska
- **Kontextuell anpassning**: Baserat på användare och situation

### 2. Avancerad Visualisering
- **Interaktiva grafer**: För komplex lineage
- **3D-visualisering**: För djupa transformationskedjor
- **Real-time updates**: Live-spårning av pågående processer

### 3. Compliance & Audit
- **GDPR-stöd**: Rätt att förklara automatiska beslut
- **Audit trails**: Fullständig historik för compliance
- **Export formats**: För externa audit-verktyg

## Demo & Test

Besök `/explainability-demo` för att se systemet i aktion:
- **Beslut & Förklaringar**: Interaktiv demo av beslut-spårning
- **Lineage Visualization**: Visuell representation av data-flöden
- **Mission Integration**: Hur allt hänger ihop i mission-kontext

## Support & Dokumentation

- **API-dokumentation**: Swagger/OpenAPI specs
- **Komponent-dokumentation**: Storybook för UI-komponenter
- **Utvecklar-guide**: Detaljerad implementation-guide
- **Användar-manual**: Guide för slutanvändare 