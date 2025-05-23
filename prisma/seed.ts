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

  console.log('✅ Seed completed successfully!');
  console.log(`Created:`);
  console.log(`- ${2} anomalies`);
  console.log(`- ${2} missions`);
  console.log(`- ${4} incident reports`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 