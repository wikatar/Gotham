import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create sample anomalies
  const anomaly1 = await prisma.anomaly.create({
    data: {
      title: 'Unusual Customer Churn Pattern',
      description: 'Detected 35% increase in customer churn in APAC region',
      severity: 'high',
      resourceId: 'customers-apac',
      resourceType: 'dataset',
      metadata: JSON.stringify({
        region: 'APAC',
        increase: '35%',
        timeframe: 'last_30_days'
      }),
      detectedAt: new Date('2024-01-15T08:30:00Z'),
    },
  });

  const anomaly2 = await prisma.anomaly.create({
    data: {
      title: 'Payment Processing Anomaly',
      description: 'Failed payment rate increased by 200%',
      severity: 'critical',
      resourceId: 'payment-processor',
      resourceType: 'service',
      metadata: JSON.stringify({
        service: 'stripe',
        failure_rate: '15%',
        normal_rate: '5%'
      }),
      resolved: true,
      resolvedAt: new Date('2024-01-14T16:45:00Z'),
      detectedAt: new Date('2024-01-14T10:15:00Z'),
    },
  });

  // Create sample missions
  const mission1 = await prisma.mission.create({
    data: {
      name: 'Customer Retention Initiative Q1',
      description: 'Focus on reducing churn in high-value customer segments',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      status: 'active',
    },
  });

  const mission2 = await prisma.mission.create({
    data: {
      name: 'Payment Infrastructure Upgrade',
      description: 'Modernize payment processing systems',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2024-02-29'),
      status: 'active',
    },
  });

  // Create sample incident reports
  const incident1 = await prisma.incidentReport.create({
    data: {
      title: 'APAC Customer Churn Spike Investigation',
      description: 'Investigating unusual customer churn patterns detected in the APAC region. Initial analysis shows 35% increase in churn rate compared to previous month.',
      sourceType: 'anomaly',
      sourceId: anomaly1.id,
      missionId: mission1.id,
      status: 'investigating',
      severity: 'high',
      tags: 'churn,APAC,customer-retention,Q1',
      createdBy: 'system-auto-detection',
      readToken: 'pub_apac_churn_2024',
    },
  });

  const incident2 = await prisma.incidentReport.create({
    data: {
      title: 'Payment Gateway Critical Failure',
      description: 'Critical failure in payment processing system causing significant revenue impact. Immediate action required.',
      sourceType: 'anomaly',
      sourceId: anomaly2.id,
      missionId: mission2.id,
      status: 'resolved',
      severity: 'critical',
      tags: 'payment,critical,revenue-impact,resolved',
      createdBy: 'ops-team@gotham.se',
      readToken: 'pub_payment_failure_resolved',
    },
  });

  const incident3 = await prisma.incidentReport.create({
    data: {
      title: 'Manual Report: Data Quality Concerns',
      description: 'Manual incident report regarding data quality issues found during routine audit. Several data sources showing inconsistencies.',
      sourceType: 'manual',
      sourceId: null,
      missionId: null,
      status: 'open',
      severity: 'medium',
      tags: 'data-quality,audit,manual-review',
      createdBy: 'audit-team@gotham.se',
      readToken: 'pub_data_quality_audit',
    },
  });

  const incident4 = await prisma.incidentReport.create({
    data: {
      title: 'Agent Automation Failure',
      description: 'Customer notification agent failed to send alerts for 3 hours. Investigating root cause.',
      sourceType: 'agent',
      sourceId: null,
      missionId: mission1.id,
      status: 'investigating',
      severity: 'medium',
      tags: 'automation,notification,agent-failure',
      createdBy: 'devops@gotham.se',
      readToken: 'pub_agent_notification_failure',
    },
  });

  // === COLLABORATION LAYER SEED DATA ===

  // Create comment threads for missions
  const missionThread1 = await prisma.commentThread.create({
    data: {
      entityType: 'mission',
      entityId: mission1.id,
    },
  });

  const missionThread2 = await prisma.commentThread.create({
    data: {
      entityType: 'mission',
      entityId: mission2.id,
    },
  });

  // Create comment threads for incidents
  const incidentThread1 = await prisma.commentThread.create({
    data: {
      entityType: 'incident',
      entityId: incident1.id,
    },
  });

  const incidentThread2 = await prisma.commentThread.create({
    data: {
      entityType: 'incident',
      entityId: incident2.id,
    },
  });

  // Create comment threads for anomalies
  const anomalyThread1 = await prisma.commentThread.create({
    data: {
      entityType: 'anomaly',
      entityId: anomaly1.id,
    },
  });

  // Create sample comments for mission 1
  await prisma.comment.create({
    data: {
      threadId: missionThread1.id,
      author: 'alice@gotham.se',
      authorName: 'Alice Johnson',
      content: 'Vi behöver fokusera på APAC-regionen. Ser ut som att churn-problemet är allvarligare än förväntat.',
      createdAt: new Date('2024-01-02T09:15:00Z'),
    },
  });

  await prisma.comment.create({
    data: {
      threadId: missionThread1.id,
      author: 'bob@gotham.se',
      authorName: 'Bob Wilson',
      content: 'Håller med Alice. Jag kan köra en djupare analys av kundsegmenten i APAC. Ger er rapport senast imorgon.',
      createdAt: new Date('2024-01-02T14:30:00Z'),
    },
  });

  await prisma.comment.create({
    data: {
      threadId: missionThread1.id,
      author: 'carol@gotham.se',
      authorName: 'Carol Davis',
      content: 'Bra Bob! Jag tar och kontaktar våra team leads i Singapore och Tokyo för att höra om de märkt något lokalt.',
      createdAt: new Date('2024-01-03T08:45:00Z'),
    },
  });

  // Create comments for incident 1
  await prisma.comment.create({
    data: {
      threadId: incidentThread1.id,
      author: 'alice@gotham.se',
      authorName: 'Alice Johnson',
      content: 'Anomalin är kopplad till vår Q1-mission. Vi borde prioritera denna undersökning.',
      createdAt: new Date('2024-01-15T09:00:00Z'),
    },
  });

  await prisma.comment.create({
    data: {
      threadId: incidentThread1.id,
      author: 'devops@gotham.se',
      authorName: 'DevOps Team',
      content: 'Satt status till "investigating". Tilldelat till Alice och Bob för djupare analys.',
      createdAt: new Date('2024-01-15T09:30:00Z'),
    },
  });

  // Create comments for resolved incident
  await prisma.comment.create({
    data: {
      threadId: incidentThread2.id,
      author: 'ops-team@gotham.se',
      authorName: 'Ops Team',
      content: 'Problemet identifierat! Det var en konfigurationsfel i Stripe-integrationen. Fixar nu.',
      createdAt: new Date('2024-01-14T11:20:00Z'),
    },
  });

  await prisma.comment.create({
    data: {
      threadId: incidentThread2.id,
      author: 'ops-team@gotham.se',
      authorName: 'Ops Team',
      content: 'Fix deployd och testad. Payment rate tillbaka till normala nivåer. Incident resolved.',
      createdAt: new Date('2024-01-14T16:45:00Z'),
    },
  });

  // Create comments for anomaly
  await prisma.comment.create({
    data: {
      threadId: anomalyThread1.id,
      author: 'data-analyst@gotham.se',
      authorName: 'Data Analysis Team',
      content: 'Intressant pattern. Ser ut som att churn-ökningen bara drabbar premium-kunder i APAC. Kan vara relaterat till prisförändringar?',
      createdAt: new Date('2024-01-15T10:15:00Z'),
    },
  });

  // Create activity logs for audit trail
  const activities = [
    {
      entityType: 'mission',
      entityId: mission1.id,
      action: 'created',
      actor: 'admin@gotham.se',
      actorName: 'System Admin',
      description: 'Skapade mission "Customer Retention Initiative Q1"',
      createdAt: new Date('2024-01-01T08:00:00Z'),
    },
    {
      entityType: 'mission',
      entityId: mission1.id,
      action: 'commented',
      actor: 'alice@gotham.se',
      actorName: 'Alice Johnson',
      description: 'Lade till kommentar om APAC-fokus',
      createdAt: new Date('2024-01-02T09:15:00Z'),
    },
    {
      entityType: 'incident',
      entityId: incident1.id,
      action: 'created',
      actor: 'system-auto-detection',
      actorName: 'System',
      description: 'Incident skapad automatiskt från anomaly detection',
      createdAt: new Date('2024-01-15T08:30:00Z'),
    },
    {
      entityType: 'incident',
      entityId: incident1.id,
      action: 'updated',
      actor: 'devops@gotham.se',
      actorName: 'DevOps Team',
      description: 'Status ändrad till "investigating"',
      createdAt: new Date('2024-01-15T09:30:00Z'),
    },
    {
      entityType: 'incident',
      entityId: incident2.id,
      action: 'resolved',
      actor: 'ops-team@gotham.se',
      actorName: 'Ops Team',
      description: 'Incident löst - Stripe-konfiguration fixad',
      createdAt: new Date('2024-01-14T16:45:00Z'),
    },
    {
      entityType: 'anomaly',
      entityId: anomaly1.id,
      action: 'commented',
      actor: 'data-analyst@gotham.se',
      actorName: 'Data Analysis Team',
      description: 'Lade till analys om premium-kunders churn pattern',
      createdAt: new Date('2024-01-15T10:15:00Z'),
    },
  ];

  for (const activity of activities) {
    await prisma.activityLog.create({ data: activity });
  }

  // === DATA LINEAGE SEEDING ===
  
  // Create sample entities for lineage tracking
  const salesforceEntity = await prisma.entity.create({
    data: {
      type: 'datasource',
      externalId: 'sf_prod_001',
      name: 'Salesforce Production',
      metadata: JSON.stringify({
        endpoint: 'https://gotham.salesforce.com',
        version: 'v54.0',
        lastSync: '2024-01-15T08:00:00Z'
      }),
    },
  });

  const dataWarehouseEntity = await prisma.entity.create({
    data: {
      type: 'datasource',
      externalId: 'dw_analytics_001',
      name: 'Analytics Data Warehouse',
      metadata: JSON.stringify({
        database: 'analytics_prod',
        schema: 'customer_data',
        table: 'customer_metrics'
      }),
    },
  });

  const mlPipelineEntity = await prisma.entity.create({
    data: {
      type: 'pipeline',
      externalId: 'ml_churn_pred_v2',
      name: 'Customer Churn Prediction Pipeline v2',
      metadata: JSON.stringify({
        framework: 'scikit-learn',
        version: '2.1.3',
        accuracy: 0.847,
        lastTrained: '2024-01-10T12:00:00Z'
      }),
    },
  });

  // Create sample lineage logs
  const lineageLogs = [
    {
      entityId: salesforceEntity.id,
      pipelineId: 'etl_salesforce_daily',
      agentId: 'data_ingestion_agent_v1',
      input: JSON.stringify({
        source: 'Salesforce API',
        endpoint: '/services/data/v54.0/query/',
        query: 'SELECT Id, Email, CreatedDate, LastLoginDate FROM User WHERE IsActive = true',
        recordCount: 12547
      }),
      output: JSON.stringify({
        destination: 'data_warehouse.customer_data.users',
        recordsProcessed: 12547,
        recordsInserted: 234,
        recordsUpdated: 12313,
        executionTime: '45.2s'
      }),
      step: 'extraction',
      source: 'Salesforce',
      createdAt: new Date('2024-01-15T08:15:00Z'),
    },
    {
      entityId: dataWarehouseEntity.id,
      pipelineId: 'etl_salesforce_daily',
      agentId: 'data_transformation_agent',
      input: JSON.stringify({
        source: 'data_warehouse.raw.salesforce_users',
        recordCount: 12547,
        schema: ['id', 'email', 'created_date', 'last_login_date', 'is_active']
      }),
      output: JSON.stringify({
        destination: 'data_warehouse.customer_data.customer_profiles',
        transformations: [
          'email normalization',
          'date format standardization',
          'activity score calculation'
        ],
        recordsProcessed: 12547,
        recordsOutput: 12547
      }),
      step: 'transformation',
      source: 'ETL Pipeline',
      createdAt: new Date('2024-01-15T08:30:00Z'),
    },
    {
      entityId: mlPipelineEntity.id,
      pipelineId: 'ml_churn_prediction_daily',
      agentId: 'churn_prediction_agent_v2',
      input: JSON.stringify({
        features: [
          'login_frequency_30d',
          'feature_usage_score',
          'support_tickets_count',
          'payment_history_score',
          'engagement_trend'
        ],
        customerCount: 12547,
        dataTimeRange: '2023-12-15 to 2024-01-15'
      }),
      output: JSON.stringify({
        predictions: {
          high_risk: 1247,
          medium_risk: 2341,
          low_risk: 8959
        },
        modelPerformance: {
          accuracy: 0.847,
          precision: 0.823,
          recall: 0.891,
          f1Score: 0.856
        },
        anomaliesDetected: [
          {
            anomalyId: anomaly1.id,
            type: 'churn_spike_apac',
            confidence: 0.92
          }
        ]
      }),
      step: 'prediction',
      source: 'ML Pipeline',
      createdAt: new Date('2024-01-15T09:00:00Z'),
    },
    {
      entityId: null, // No specific entity, general system operation
      pipelineId: 'incident_auto_creation',
      agentId: 'anomaly_detector_agent',
      input: JSON.stringify({
        anomalyId: anomaly1.id,
        anomalyType: 'churn_rate_increase',
        severity: 'high',
        confidence: 0.92,
        affectedRegion: 'APAC',
        affectedCustomerSegment: 'premium'
      }),
      output: JSON.stringify({
        incidentId: incident1.id,
        incidentTitle: 'APAC Premium Customer Churn Spike Detected',
        status: 'open',
        assignedTo: ['alice@gotham.se', 'bob@gotham.se'],
        priority: 'high',
        automatedActions: [
          'stakeholder_notification_sent',
          'escalation_rule_triggered',
          'investigation_template_created'
        ]
      }),
      step: 'incident_creation',
      source: 'Anomaly Detection System',
      createdAt: new Date('2024-01-15T09:05:00Z'),
    },
    {
      entityId: dataWarehouseEntity.id,
      pipelineId: 'data_quality_check_daily',
      agentId: 'data_quality_agent_v1',
      input: JSON.stringify({
        tables: [
          'customer_data.customer_profiles',
          'customer_data.subscription_events',
          'customer_data.usage_metrics'
        ],
        checkTypes: ['completeness', 'accuracy', 'consistency', 'timeliness']
      }),
      output: JSON.stringify({
        qualityScore: 0.956,
        issues: [
          {
            table: 'customer_profiles',
            issue: 'missing_email_domain',
            affectedRows: 23,
            severity: 'low'
          }
        ],
        recommendations: [
          'Implement email validation at ingestion',
          'Add data quality alerts for missing domains'
        ]
      }),
      step: 'quality_check',
      source: 'Data Quality Framework',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    },
  ];

  for (const log of lineageLogs) {
    await prisma.lineageLog.create({ data: log });
  }

  // === DECISION EXPLANATIONS SEEDING ===
  
  // Get the lineage logs we just created for referencing
  const createdLineageLogs = await prisma.lineageLog.findMany({
    orderBy: { createdAt: 'asc' }
  });

  // Create sample decision explanations
  const decisionExplanations = [
    {
      title: 'APAC Churn Risk Prediction',
      description: 'AI-modell identifierade hög churn-risk för premium-kunder i APAC-regionen baserat på användarmönster och engagemang.',
      decisionType: 'prediction',
      outcome: 'High churn risk detected for 1,247 premium customers in APAC',
      confidence: 0.92,
      agentId: 'churn_prediction_agent_v2',
      missionId: mission1.id,
      lineageId: createdLineageLogs[2]?.id, // ML prediction lineage
      entityType: 'anomaly',
      entityId: anomaly1.id,
      inputData: JSON.stringify({
        customerSegment: 'premium',
        region: 'APAC',
        features: {
          loginFrequency30d: 2.3,
          featureUsageScore: 0.34,
          supportTicketsCount: 8,
          paymentHistoryScore: 0.89,
          engagementTrend: -0.45
        },
        historicalData: '90 days',
        modelVersion: 'v2.1.3'
      }),
      reasoning: 'Modellen identifierade en signifikant minskning i engagemang (-45%) kombinerat med ökad supportaktivitet (8 tickets vs genomsnitt 2.1) och låg feature-användning (0.34 vs genomsnitt 0.78). Historiska mönster visar att denna kombination leder till churn inom 30 dagar med 92% sannolikhet.',
      alternatives: JSON.stringify([
        {
          decision: 'Medium risk classification',
          confidence: 0.67,
          reasoning: 'Baserat endast på engagemang-trend utan support-data'
        },
        {
          decision: 'Low risk classification', 
          confidence: 0.23,
          reasoning: 'Om endast payment history beaktas'
        }
      ]),
      impactLevel: 'high',
      status: 'approved',
      reviewedBy: 'alice@gotham.se',
      reviewedAt: new Date('2024-01-15T09:30:00Z'),
      createdAt: new Date('2024-01-15T09:00:00Z'),
    },
    {
      title: 'Automatisk Incident-skapande',
      description: 'System beslutade att automatiskt skapa incident baserat på anomali-detektion och fördefinierade regler.',
      decisionType: 'anomaly_detection',
      outcome: 'Incident created automatically for APAC churn anomaly',
      confidence: 0.95,
      agentId: 'anomaly_detector_agent',
      missionId: mission1.id,
      lineageId: createdLineageLogs[3]?.id, // Incident creation lineage
      entityType: 'incident',
      entityId: incident1.id,
      inputData: JSON.stringify({
        anomalyId: anomaly1.id,
        anomalyType: 'churn_rate_increase',
        severity: 'high',
        confidence: 0.92,
        thresholds: {
          churnRateIncrease: 0.35,
          minimumConfidence: 0.85,
          affectedCustomers: 1000
        },
        businessRules: [
          'auto_create_incident_for_high_severity',
          'notify_stakeholders_for_churn_anomalies',
          'assign_to_retention_team'
        ]
      }),
      reasoning: 'Anomalin överskrider alla kritiska tröskelvärden: churn-ökning på 35% (tröskelvärde 20%), påverkar 1,247 kunder (tröskelvärde 1,000), och har hög konfidensgrad (92% vs minimum 85%). Automatiska regler kräver incident-skapande för denna typ av anomali.',
      alternatives: JSON.stringify([
        {
          decision: 'Send alert only',
          confidence: 0.45,
          reasoning: 'Mindre drastisk åtgärd, men kan missa kritisk situation'
        },
        {
          decision: 'Wait for manual review',
          confidence: 0.12,
          reasoning: 'Risk för försenad respons på kritisk situation'
        }
      ]),
      impactLevel: 'critical',
      status: 'implemented',
      reviewedBy: 'system',
      reviewedAt: new Date('2024-01-15T09:05:00Z'),
      createdAt: new Date('2024-01-15T09:05:00Z'),
    }
  ];

  for (const decision of decisionExplanations) {
    await prisma.decisionExplanation.create({ data: decision });
  }

  // === LOGIC RULES SEEDING ===
  
  // Create sample logic rules
  const logicRules = [
    {
      name: 'Hög Kundrisk Alert',
      description: 'Skapa incident och notifiera agent när kundens riskpoäng överstiger 0.8',
      entityType: 'customer',
      conditions: JSON.stringify([
        { field: 'riskScore', operator: 'greater_than', value: 0.8 }
      ]),
      actions: JSON.stringify([
        { 
          type: 'create_incident', 
          parameters: { 
            title: 'Hög kundrisk detekterad', 
            severity: 'high',
            description: 'Automatiskt skapad incident för hög kundrisk'
          } 
        },
        { 
          type: 'notify_agent', 
          parameters: { 
            agentId: 'risk_management_agent',
            message: 'Kund med hög riskpoäng kräver uppmärksamhet'
          } 
        }
      ]),
      logicType: 'AND',
      isActive: true,
      priority: 80,
      createdBy: 'system-admin@gotham.se',
    },
    {
      name: 'Pipeline Fel Eskalering',
      description: 'Eskalera till DevOps när pipeline misslyckas med hög felfrekvens',
      entityType: 'pipeline',
      conditions: JSON.stringify([
        { field: 'status', operator: 'equals', value: 'failed' },
        { field: 'errorRate', operator: 'greater_than', value: 0.1 }
      ]),
      actions: JSON.stringify([
        { 
          type: 'escalate', 
          parameters: { 
            escalationLevel: 'critical', 
            assignedTo: 'devops-team@gotham.se',
            reason: 'Pipeline failure with high error rate'
          } 
        },
        { 
          type: 'send_email', 
          parameters: { 
            recipient: 'alerts@gotham.se', 
            subject: 'Pipeline Critical Failure Alert',
            template: 'pipeline_failure_alert'
          } 
        }
      ]),
      logicType: 'AND',
      isActive: true,
      priority: 90,
      createdBy: 'devops@gotham.se',
    },
    {
      name: 'Mission Auto-Complete',
      description: 'Automatiskt markera mission som slutförd när slutdatum passerat',
      entityType: 'mission',
      conditions: JSON.stringify([
        { field: 'status', operator: 'equals', value: 'active' },
        { field: 'endDate', operator: 'less_than', value: new Date().toISOString().split('T')[0] }
      ]),
      actions: JSON.stringify([
        { 
          type: 'update_field', 
          parameters: { 
            field: 'status', 
            value: 'completed',
            reason: 'Automatically completed due to end date'
          } 
        },
        { 
          type: 'log_event', 
          parameters: { 
            eventType: 'mission_auto_completed',
            details: 'Mission automatically marked as completed',
            severity: 'info'
          } 
        }
      ]),
      logicType: 'AND',
      isActive: true,
      priority: 50,
      createdBy: 'mission-manager@gotham.se',
    },
    {
      name: 'Kritisk Anomali Respons',
      description: 'Omedelbar eskalering för kritiska anomalier',
      entityType: 'anomaly',
      conditions: JSON.stringify([
        { field: 'severity', operator: 'equals', value: 'critical' },
        { field: 'resolved', operator: 'equals', value: false }
      ]),
      actions: JSON.stringify([
        { 
          type: 'create_incident', 
          parameters: { 
            title: 'Kritisk anomali kräver omedelbar uppmärksamhet', 
            severity: 'critical',
            assignedTo: 'incident-response-team@gotham.se'
          } 
        },
        { 
          type: 'escalate', 
          parameters: { 
            escalationLevel: 'immediate', 
            assignedTo: 'on-call-engineer@gotham.se'
          } 
        },
        { 
          type: 'send_email', 
          parameters: { 
            recipient: 'emergency@gotham.se', 
            subject: 'CRITICAL: Anomaly Requires Immediate Attention'
          } 
        }
      ]),
      logicType: 'AND',
      isActive: true,
      priority: 100,
      createdBy: 'security-team@gotham.se',
    },
    {
      name: 'Datakvalitet Varning',
      description: 'Flagga när datakvalitetspoäng sjunker under acceptabel nivå',
      entityType: 'pipeline',
      conditions: JSON.stringify([
        { field: 'dataQualityScore', operator: 'less_than', value: 0.8 }
      ]),
      actions: JSON.stringify([
        { 
          type: 'flag_entity', 
          parameters: { 
            flagType: 'data_quality_warning',
            reason: 'Data quality score below acceptable threshold',
            priority: 'medium'
          } 
        },
        { 
          type: 'notify_agent', 
          parameters: { 
            agentId: 'data_quality_agent',
            message: 'Data quality degradation detected'
          } 
        }
      ]),
      logicType: 'AND',
      isActive: true,
      priority: 60,
      createdBy: 'data-team@gotham.se',
    }
  ];

  for (const rule of logicRules) {
    await prisma.logicRule.create({ data: rule });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`Created:`);
  console.log(`- ${2} anomalies`);
  console.log(`- ${2} missions`);
  console.log(`- ${4} incident reports`);
  console.log(`- ${5} comment threads`);
  console.log(`- ${8} comments`);
  console.log(`- ${6} activity log entries`);
  console.log(`- ${3} entities`);
  console.log(`- ${5} lineage logs`);
  console.log(`- ${2} decision explanations`);
  console.log(`- ${5} logic rules`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 