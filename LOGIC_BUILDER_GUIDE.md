# Logic Builder Guide

## Översikt

Logic Builder är ett visuellt no-code verktyg för att skapa automatiska regler i Gotham Analytics. Systemet låter användare definiera If-Then logik utan att skriva kod, vilket möjliggör kraftfull automatisering över hela plattformen.

## Funktioner

### 🎯 Visuell Regelbyggare
- **If-Then Struktur**: Intuitivt gränssnitt för att skapa villkor och åtgärder
- **Drag & Drop**: Enkelt att lägga till, ta bort och ordna regler
- **Real-time Validering**: Omedelbar feedback på regelkonfiguration
- **Förhandsvisning**: Se hur regeln kommer att fungera innan aktivering

### 🔧 Flexibel Logik
- **AND/OR Operatorer**: Kombinera flera villkor med flexibel logik
- **Rik Operatoruppsättning**: 13 olika operatorer för alla datatyper
- **Entitetsspecifik**: Regler för missions, incidents, anomalier, kunder, pipelines
- **Prioritering**: Kontrollera exekveringsordning med prioritetsnivåer

### ⚡ Kraftfulla Åtgärder
- **10+ Åtgärdstyper**: Från notifieringar till incident-skapande
- **Parametriserade Åtgärder**: Anpassningsbara åtgärder med specifika parametrar
- **Kedjade Åtgärder**: Utför flera åtgärder från en regel
- **Webhook Support**: Integration med externa system

## Arkitektur

### Databasmodell

```sql
CREATE TABLE logic_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT,
  entity_id TEXT,
  conditions TEXT, -- JSON array
  actions TEXT,    -- JSON array
  logic_type TEXT, -- 'AND' | 'OR'
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### `GET /api/logic-rules`
Hämta regler med filtrering och paginering.

**Query Parameters:**
- `entityType`: Filtrera på entitetstyp
- `entityId`: Filtrera på specifik entitet
- `isActive`: Filtrera på aktiva/inaktiva regler
- `page`: Sidnummer för paginering
- `limit`: Antal regler per sida

**Response:**
```json
{
  "rules": [
    {
      "id": "rule_123",
      "name": "Hög Riskpoäng Alert",
      "conditions": [
        {
          "field": "riskScore",
          "operator": "greater_than",
          "value": 0.8
        }
      ],
      "actions": [
        {
          "type": "create_incident",
          "parameters": {
            "title": "Hög kundrisk detekterad",
            "severity": "high"
          }
        }
      ],
      "logicType": "AND",
      "isActive": true,
      "priority": 80
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

#### `POST /api/logic-rules`
Skapa ny regel.

**Request Body:**
```json
{
  "name": "Pipeline Fel Eskalering",
  "description": "Eskalera vid kritiska pipeline-fel",
  "entityType": "pipeline",
  "conditions": [
    {
      "field": "status",
      "operator": "equals",
      "value": "failed"
    },
    {
      "field": "errorRate",
      "operator": "greater_than",
      "value": 0.1
    }
  ],
  "actions": [
    {
      "type": "escalate",
      "parameters": {
        "escalationLevel": "critical",
        "assignedTo": "devops-team"
      }
    }
  ],
  "logicType": "AND",
  "priority": 90
}
```

#### `PUT /api/logic-rules/[id]`
Uppdatera befintlig regel.

#### `DELETE /api/logic-rules/[id]`
Ta bort regel.

## Användning

### 1. Skapa En Regel

```typescript
// Navigera till Logic Builder
// /logic-builder-demo

// 1. Klicka "Skapa Ny Regel"
// 2. Fyll i grundläggande information
const rule = {
  name: "Automatisk Incident för Hög Risk",
  description: "Skapa incident när kundrisk överstiger tröskelvärde",
  entityType: "customer"
}

// 3. Lägg till villkor
const conditions = [
  {
    field: "riskScore",
    operator: "greater_than",
    value: 0.8
  }
]

// 4. Lägg till åtgärder
const actions = [
  {
    type: "create_incident",
    parameters: {
      title: "Hög kundrisk detekterad",
      severity: "high"
    }
  },
  {
    type: "notify_agent",
    parameters: {
      agentId: "risk_management_agent"
    }
  }
]
```

### 2. Entitetstyper och Fält

#### Mission
- `status`: active, completed, cancelled
- `name`: Missionens namn
- `startDate`: Startdatum
- `endDate`: Slutdatum

#### Incident
- `severity`: low, medium, high, critical
- `status`: open, investigating, resolved
- `title`: Incident-titel
- `sourceType`: Källtyp
- `createdAt`: Skapandedatum

#### Anomaly
- `severity`: low, medium, high, critical
- `resolved`: boolean
- `title`: Anomali-titel
- `resourceType`: Resurstyp
- `detectedAt`: Upptäcktsdatum

#### Customer
- `riskScore`: Riskpoäng (0-1)
- `churnProbability`: Churn-sannolikhet (0-1)
- `segment`: high_value, regular, at_risk
- `lastLoginDays`: Dagar sedan senaste inloggning
- `totalSpent`: Total spenderad summa

#### Pipeline
- `status`: running, completed, failed
- `executionTime`: Exekveringstid (sekunder)
- `errorRate`: Felfrekvens (0-1)
- `dataQualityScore`: Datakvalitetspoäng (0-1)

### 3. Operatorer

| Operator | Beskrivning | Datatyper |
|----------|-------------|-----------|
| `equals` | Är lika med | string, number, boolean, date |
| `not_equals` | Är inte lika med | string, number, boolean, date |
| `greater_than` | Är större än | number, date |
| `greater_than_or_equal` | Är större än eller lika med | number, date |
| `less_than` | Är mindre än | number, date |
| `less_than_or_equal` | Är mindre än eller lika med | number, date |
| `contains` | Innehåller | string |
| `not_contains` | Innehåller inte | string |
| `starts_with` | Börjar med | string |
| `ends_with` | Slutar med | string |
| `is_empty` | Är tom | string |
| `is_not_empty` | Är inte tom | string |
| `in` | Är en av | string, number |
| `not_in` | Är inte en av | string, number |

### 4. Åtgärder

#### `notify_agent`
Skicka notifiering till AI-agent.
- **Obligatoriska parametrar**: `agentId`
- **Valfria parametrar**: `message`, `priority`

#### `create_incident`
Skapa ny incident automatiskt.
- **Obligatoriska parametrar**: `title`, `severity`
- **Valfria parametrar**: `description`, `assignedTo`

#### `flag_entity`
Markera entitet för uppmärksamhet.
- **Obligatoriska parametrar**: `flagType`
- **Valfria parametrar**: `reason`, `priority`

#### `update_field`
Uppdatera fält på entitet.
- **Obligatoriska parametrar**: `field`, `value`
- **Valfria parametrar**: `reason`

#### `trigger_mission`
Starta eller uppdatera mission.
- **Obligatoriska parametrar**: `missionId`
- **Valfria parametrar**: `action`, `parameters`

#### `send_email`
Skicka e-postnotifiering.
- **Obligatoriska parametrar**: `recipient`, `subject`
- **Valfria parametrar**: `template`, `attachments`

#### `webhook`
Anropa extern webhook.
- **Obligatoriska parametrar**: `url`
- **Valfria parametrar**: `method`, `headers`, `payload`

#### `log_event`
Skapa loggpost.
- **Obligatoriska parametrar**: `eventType`
- **Valfria parametrar**: `details`, `severity`

#### `escalate`
Eskalera till högre nivå.
- **Obligatoriska parametrar**: `escalationLevel`
- **Valfria parametrar**: `reason`, `assignedTo`

#### `assign_task`
Skapa och tilldela uppgift.
- **Obligatoriska parametrar**: `assignedTo`, `taskTitle`
- **Valfria parametrar**: `description`, `dueDate`, `priority`

## Exempel på Regler

### 1. Automatisk Incident för Hög Kundrisk

```json
{
  "name": "Hög Kundrisk Alert",
  "entityType": "customer",
  "conditions": [
    {
      "field": "riskScore",
      "operator": "greater_than",
      "value": 0.8
    }
  ],
  "actions": [
    {
      "type": "create_incident",
      "parameters": {
        "title": "Hög kundrisk detekterad",
        "severity": "high"
      }
    },
    {
      "type": "notify_agent",
      "parameters": {
        "agentId": "risk_management_agent"
      }
    }
  ],
  "logicType": "AND",
  "priority": 80
}
```

### 2. Pipeline Fel Eskalering

```json
{
  "name": "Pipeline Fel Eskalering",
  "entityType": "pipeline",
  "conditions": [
    {
      "field": "status",
      "operator": "equals",
      "value": "failed"
    },
    {
      "field": "errorRate",
      "operator": "greater_than",
      "value": 0.1
    }
  ],
  "actions": [
    {
      "type": "escalate",
      "parameters": {
        "escalationLevel": "critical",
        "assignedTo": "devops-team"
      }
    },
    {
      "type": "send_email",
      "parameters": {
        "recipient": "alerts@gotham.se",
        "subject": "Pipeline Critical Failure"
      }
    }
  ],
  "logicType": "AND",
  "priority": 90
}
```

### 3. Mission Auto-Complete

```json
{
  "name": "Mission Auto-Complete",
  "entityType": "mission",
  "conditions": [
    {
      "field": "status",
      "operator": "equals",
      "value": "active"
    },
    {
      "field": "endDate",
      "operator": "less_than",
      "value": "2024-01-20"
    }
  ],
  "actions": [
    {
      "type": "update_field",
      "parameters": {
        "field": "status",
        "value": "completed"
      }
    },
    {
      "type": "log_event",
      "parameters": {
        "eventType": "mission_auto_completed"
      }
    }
  ],
  "logicType": "AND",
  "priority": 50
}
```

## Integration

### Mission Integration

Logic Builder kan integreras direkt i mission-vyn:

```typescript
// I mission detail page
import LogicManager from '../components/logic/LogicManager'

<LogicManager
  entityType="mission"
  entityId={mission.id}
  title="Mission-specifika Regler"
  description="Skapa regler som bara gäller för denna mission"
/>
```

### Pipeline Integration

Använd för att övervaka pipeline-händelser:

```typescript
// I pipeline monitoring
import LogicRulesList from '../components/logic/LogicRulesList'

<LogicRulesList
  entityType="pipeline"
  onEdit={handleEditRule}
  onCreateNew={handleCreateRule}
/>
```

### Standalone Usage

Använd som fristående verktyg:

```typescript
// Fristående Logic Builder
import LogicBuilder from '../components/logic/LogicBuilder'

<LogicBuilder
  onSave={handleSaveRule}
  onCancel={handleCancel}
/>
```

## Best Practices

### 1. Regelnamn och Beskrivningar
- **Tydliga namn**: Använd beskrivande namn som förklarar vad regeln gör
- **Detaljerade beskrivningar**: Förklara varför regeln behövs och vad den åstadkommer
- **Konsistent namngivning**: Använd samma namnkonventioner för liknande regler

### 2. Villkor Design
- **Specifika villkor**: Undvik för breda villkor som kan trigga för ofta
- **Testbara värden**: Använd värden som är lätta att testa och validera
- **Logisk gruppering**: Gruppera relaterade villkor med AND/OR logiskt

### 3. Åtgärder
- **Proportionella åtgärder**: Matcha åtgärdens allvarlighetsgrad med villkorets kritikalitet
- **Undvik duplicering**: Se till att åtgärder inte överlappar med andra regler
- **Testbara åtgärder**: Välj åtgärder som är lätta att verifiera

### 4. Prioritering
- **Kritiska regler**: Prioritet 80-100 för kritiska system-regler
- **Viktiga regler**: Prioritet 50-79 för viktiga affärsregler
- **Standard regler**: Prioritet 20-49 för vanliga automatiseringar
- **Låg prioritet**: Prioritet 0-19 för nice-to-have funktioner

### 5. Testning
- **Stegvis aktivering**: Testa regler i utvecklingsmiljö först
- **Övervaka effekter**: Följ upp regelexekvering och justiera vid behov
- **Dokumentera ändringar**: Håll koll på regeländringar och deras effekter

## Felsökning

### Vanliga Problem

#### Regel Triggar Inte
1. **Kontrollera villkor**: Verifiera att villkoren matchar faktiska data
2. **Kontrollera datatyper**: Se till att värden har rätt datatyp
3. **Kontrollera regelstatus**: Säkerställ att regeln är aktiv
4. **Kontrollera prioritet**: Högre prioritetsregler kan blockera lägre

#### Regel Triggar För Ofta
1. **Förfina villkor**: Lägg till mer specifika villkor
2. **Justera tröskelvärden**: Höj eller sänk numeriska trösklar
3. **Lägg till tidsbegränsningar**: Undvik för frekventa exekveringar
4. **Använd AND istället för OR**: Gör villkoren mer restriktiva

#### Åtgärder Fungerar Inte
1. **Kontrollera parametrar**: Verifiera att alla obligatoriska parametrar finns
2. **Kontrollera behörigheter**: Se till att systemet har rätt behörigheter
3. **Kontrollera externa system**: Verifiera att webhooks och e-post fungerar
4. **Kontrollera loggar**: Granska systemloggar för felmeddelanden

### Debug Tips

#### Aktivera Detaljerad Loggning
```typescript
// I utvecklingsmiljö
console.log('Rule evaluation:', {
  ruleId: rule.id,
  conditions: rule.conditions,
  evaluationResult: result
})
```

#### Testa Villkor Manuellt
```typescript
// Testa specifika villkor
const testCondition = (condition, entityData) => {
  const { field, operator, value } = condition
  const fieldValue = entityData[field]
  
  switch (operator) {
    case 'greater_than':
      return fieldValue > value
    case 'equals':
      return fieldValue === value
    // ... andra operatorer
  }
}
```

## Framtida Utveckling

### Planerade Funktioner
- **Visuell Regeleditor**: Drag-and-drop gränssnitt
- **Regelmallar**: Fördefinierade mallar för vanliga användningsfall
- **A/B-testning**: Testa olika regelkonfigurationer
- **Regelanalys**: Statistik över regelexekvering och effektivitet
- **Import/Export**: Dela regler mellan miljöer
- **Versionshantering**: Spåra regeländringar över tid

### Tekniska Förbättringar
- **Regelmotor**: Dedikerad regelmotor för bättre prestanda
- **Caching**: Cache regelresultat för snabbare exekvering
- **Parallell exekvering**: Kör regler parallellt när möjligt
- **Regeloptimering**: Automatisk optimering av regellogik

## Support

### Dokumentation
- **API-dokumentation**: Swagger/OpenAPI specifikationer
- **Komponentdokumentation**: Storybook för UI-komponenter
- **Utvecklarguide**: Detaljerad implementation-guide

### Hjälp och Support
- **Demo-sida**: `/logic-builder-demo` för interaktiv demonstration
- **Exempel**: Färdiga exempel för vanliga användningsfall
- **Community**: Forum för frågor och diskussioner

### Rapportera Buggar
1. **Beskriv problemet**: Detaljerad beskrivning av vad som gick fel
2. **Steg för att återskapa**: Exakta steg för att återskapa problemet
3. **Förväntad vs faktisk**: Vad förväntade du dig vs vad som hände
4. **Miljöinformation**: Browser, version, operativsystem
5. **Skärmdumpar**: Bilder som visar problemet 