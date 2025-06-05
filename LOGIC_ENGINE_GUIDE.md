# Logic Engine Guide - Gotham Analytics

## Översikt

Logic Engine är hjärtat i Gotham Analytics automatiseringssystem som exekverar No-Code regler skapade i Logic Builder. Systemet utvärderar villkor och utför åtgärder baserat på inkommande data från pipelines, missions och andra entiteter.

## Arkitektur

### Kärnkomponenter

1. **Logic Engine (`app/lib/logicEngine.ts`)**
   - Huvudmotor för regelexekvering
   - Villkorsutvärdering med 13 operatorer
   - Åtgärdsexekvering med 10 åtgärdstyper
   - Felhantering och loggning

2. **Test API (`app/api/logic-engine/test/route.ts`)**
   - Endpoint för testning av regler
   - Exempeldata för olika entitetstyper
   - Validering av regellogik

3. **Demo Interface (`app/logic-engine-demo/page.tsx`)**
   - Interaktivt gränssnitt för testning
   - Realtidsresultat och felsökning
   - Visualisering av åtgärdsresultat

## Huvudfunktioner

### `runLogicRules(data, context, customRules?)`

Huvudfunktionen som kör regler mot data.

```typescript
const result = await runLogicRules(
  { riskScore: 0.9, status: 'active' },
  {
    entityType: 'customer',
    entityId: 'cust_123',
    userId: 'agent_001'
  }
)
```

**Parametrar:**
- `data`: Objektet som ska utvärderas
- `context`: Exekveringskontext med metadata
- `customRules`: Valfria specifika regler att köra

**Returnerar:**
```typescript
interface LogicEngineResult {
  totalRulesEvaluated: number
  rulesTriggered: number
  actionsExecuted: number
  actionResults: ActionResult[]
  executionTime: number
  errors: string[]
}
```

### Hjälpfunktioner

#### `runRulesForEntity(entityType, entityId, entityData, userId?)`
Kör regler för en specifik entitet.

#### `runRulesForMission(missionId, missionData, userId?)`
Kör regler för en mission.

#### `testRule(rule, testData, context?)`
Testar en enskild regel med testdata.

## Operatorer

Logic Engine stöder 13 operatorer för villkorsutvärdering:

| Operator | Beskrivning | Exempel |
|----------|-------------|---------|
| `equals` | Exakt likhet | `status === 'active'` |
| `not_equals` | Inte lika med | `status !== 'inactive'` |
| `greater_than` | Större än | `riskScore > 0.8` |
| `greater_than_or_equal` | Större än eller lika | `score >= 100` |
| `less_than` | Mindre än | `age < 65` |
| `less_than_or_equal` | Mindre än eller lika | `attempts <= 3` |
| `contains` | Innehåller text | `title.contains('error')` |
| `not_contains` | Innehåller inte | `!description.contains('test')` |
| `starts_with` | Börjar med | `email.startsWith('admin')` |
| `ends_with` | Slutar med | `filename.endsWith('.pdf')` |
| `is_empty` | Är tom | `field === null \|\| field === ''` |
| `is_not_empty` | Är inte tom | `field !== null && field !== ''` |
| `in` | Finns i lista | `status in ['active', 'pending']` |
| `not_in` | Finns inte i lista | `role not in ['guest', 'temp']` |

## Åtgärdstyper

Logic Engine kan utföra 10 olika typer av åtgärder:

### 1. `notify_agent`
Skickar notifikation till agent.

**Parametrar:**
- `agentId` (required): Agent att notifiera
- `message`: Meddelande
- `priority`: Prioritetsnivå

### 2. `create_incident`
Skapar ny incident automatiskt.

**Parametrar:**
- `title` (required): Incident titel
- `severity` (required): Allvarlighetsgrad
- `description`: Beskrivning
- `assignedTo`: Tilldelad agent

### 3. `flag_entity`
Flaggar entitet för uppmärksamhet.

**Parametrar:**
- `flagType` (required): Typ av flagga
- `reason`: Anledning
- `priority`: Prioritet

### 4. `update_field`
Uppdaterar fält på entitet.

**Parametrar:**
- `field` (required): Fält att uppdatera
- `value` (required): Nytt värde
- `reason`: Anledning till ändring

### 5. `trigger_mission`
Triggar mission-relaterad åtgärd.

**Parametrar:**
- `missionId` (required): Mission ID
- `actionType`: Typ av åtgärd
- `parameters`: Ytterligare parametrar

### 6. `send_email`
Skickar e-postnotifikation.

**Parametrar:**
- `recipient` (required): Mottagare
- `subject` (required): Ämne
- `template`: E-postmall
- `attachments`: Bilagor

### 7. `webhook`
Anropar extern webhook.

**Parametrar:**
- `url` (required): Webhook URL
- `method`: HTTP-metod (default: POST)
- `headers`: HTTP-headers
- `payload`: Data att skicka

### 8. `log_event`
Loggar händelse i systemet.

**Parametrar:**
- `eventType` (required): Typ av händelse
- `details`: Detaljer
- `severity`: Allvarlighetsgrad

### 9. `escalate`
Eskalerar ärende.

**Parametrar:**
- `escalationLevel` (required): Eskaleringsnivå
- `reason`: Anledning
- `assignedTo`: Tilldelad person/team

### 10. `assign_task`
Tilldelar uppgift.

**Parametrar:**
- `assignedTo` (required): Tilldelad person
- `taskTitle` (required): Uppgiftstitel
- `description`: Beskrivning
- `dueDate`: Förfallodatum
- `priority`: Prioritet

## Integration med System

### Pipeline Integration

Logic Engine är integrerat i pipeline-exekvering:

```typescript
// I pipeline execution
const logicResult = await runLogicRules(result, {
  entityType: 'pipeline',
  entityId: pipeline.id,
  userId: accountId,
  metadata: {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type
  }
});
```

### Mission Integration

Regler körs automatiskt när missions uppdateras:

```typescript
// I mission update API
const logicResult = await runRulesForMission(
  id,
  updatedMission,
  updateData.ownerId || existingMission.ownerId || 'system'
);
```

### Logic Node Integration

Pipeline logic nodes kan använda specifika regler:

```typescript
// Pipeline node config
{
  "type": "logic",
  "config": {
    "logicRuleIds": ["rule_id_1", "rule_id_2"]
  }
}
```

## Användningsexempel

### Exempel 1: Kundrisk Automation

```typescript
// Regel: Om kundens riskpoäng > 0.8, skapa incident
const customerData = {
  riskScore: 0.85,
  segment: 'enterprise',
  lastLoginDays: 45
};

const result = await runLogicRules(customerData, {
  entityType: 'customer',
  entityId: 'cust_123'
});

// Resultat: Incident skapas automatiskt
```

### Exempel 2: Pipeline Fel Hantering

```typescript
// Regel: Om pipeline misslyckas med hög felfrekvens, eskalera
const pipelineData = {
  status: 'failed',
  errorRate: 0.15,
  executionTime: 3600
};

const result = await runLogicRules(pipelineData, {
  entityType: 'pipeline',
  entityId: 'pipe_321'
});

// Resultat: Eskalering och e-post skickas
```

### Exempel 3: Mission Auto-Complete

```typescript
// Regel: Om mission är aktiv efter slutdatum, uppdatera status
const missionData = {
  status: 'active',
  endDate: '2024-03-31',
  progress: 100
};

const result = await runRulesForMission('mission_789', missionData);

// Resultat: Status uppdateras till 'completed'
```

## Testning och Debugging

### Demo Interface

Använd Logic Engine Demo (`/logic-engine-demo`) för:
- Testa regler med exempeldata
- Validera regellogik
- Debugga åtgärdsexekvering
- Visa realtidsresultat

### API Testing

```bash
# Testa alla regler för customer data
curl -X POST /api/logic-engine/test \
  -H "Content-Type: application/json" \
  -d '{
    "testData": {"riskScore": 0.9, "status": "active"},
    "entityType": "customer"
  }'

# Testa specifik regel
curl -X POST /api/logic-engine/test \
  -H "Content-Type: application/json" \
  -d '{
    "testData": {"severity": "critical"},
    "ruleId": "rule_123"
  }'
```

### Loggning

Logic Engine loggar automatiskt:
- Regelexekveringar i `activityLog`
- Triggade åtgärder i `log` tabellen
- Fel och varningar i konsolen

## Prestanda och Optimering

### Regelprioritet

Regler exekveras i prioritetsordning (högst först):
```sql
ORDER BY priority DESC, createdAt DESC
```

### Filtrering

Regler filtreras automatiskt baserat på:
- `entityType` - Endast relevanta regler
- `isActive` - Endast aktiva regler
- `entityId` - Specifika entiteter (om angivet)

### Felhantering

- Regelfel stoppar inte pipeline-exekvering
- Åtgärdsfel loggas men fortsätter med nästa åtgärd
- Timeout-skydd för långsamma operationer

## Säkerhet

### Validering

- Alla indata valideras innan exekvering
- JSON-parsing med felhantering
- Parametrar valideras för varje åtgärdstyp

### Behörigheter

- Åtgärder exekveras med systemrättigheter
- Användar-ID loggas för spårbarhet
- Känsliga operationer kräver validering

## Framtida Utveckling

### Planerade Funktioner

1. **Regelschemaläggning**
   - Tidbaserade triggers
   - Återkommande exekveringar

2. **Avancerade Operatorer**
   - Regex-matchning
   - Datum/tid-jämförelser
   - Matematiska funktioner

3. **Åtgärdskedjor**
   - Villkorliga åtgärdssekvenser
   - Parallell exekvering
   - Rollback-funktionalitet

4. **Prestanda-optimering**
   - Regelcaching
   - Parallell utvärdering
   - Inkrementell uppdatering

5. **Monitoring Dashboard**
   - Regelstatistik
   - Prestanda-mätningar
   - Felanalys

## Felsökning

### Vanliga Problem

**Problem:** Regel triggas inte
- Kontrollera att regeln är aktiv (`isActive: true`)
- Verifiera villkorslogik med testfunktionen
- Kontrollera datatyper och fältvärden

**Problem:** Åtgärd misslyckas
- Kontrollera att alla required parametrar finns
- Validera parametervärden
- Kontrollera systemloggar för detaljer

**Problem:** Långsam exekvering
- Kontrollera antal aktiva regler
- Optimera villkorslogik
- Överväg regelprioritet

### Debug Tips

1. Använd `testRule()` för att isolera problem
2. Kontrollera `LogicEngineResult.errors` för felmeddelanden
3. Aktivera detaljerad loggning i utvecklingsmiljö
4. Använd demo-gränssnittet för visuell debugging

## Support

För teknisk support och frågor:
- Kontrollera denna dokumentation först
- Använd demo-gränssnittet för testning
- Kontrollera systemloggar för felmeddelanden
- Rapportera buggar med detaljerade reproduktionssteg 