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

  console.log('✅ Seed completed successfully!');
  console.log(`Created:`);
  console.log(`- ${2} anomalies`);
  console.log(`- ${2} missions`);
  console.log(`- ${4} incident reports`);
  console.log(`- ${5} comment threads`);
  console.log(`- ${8} comments`);
  console.log(`- ${6} activity log entries`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 