import { NextRequest, NextResponse } from 'next/server'
import { runLogicRules, testRule, LogicEngineResult } from '../../../lib/logicEngine'
import { db } from '../../../lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      testData, 
      context = {}, 
      ruleId = null,
      entityType = null,
      entityId = null 
    } = body

    if (!testData) {
      return NextResponse.json(
        { error: 'testData is required' },
        { status: 400 }
      )
    }

    let result: any

    if (ruleId) {
      // Test specific rule
      const rule = await db.logicRule.findUnique({
        where: { id: ruleId }
      })

      if (!rule) {
        return NextResponse.json(
          { error: 'Rule not found' },
          { status: 404 }
        )
      }

      result = await testRule(rule, testData, context)
    } else {
      // Run all relevant rules
      const executionContext = {
        ...context,
        entityType,
        entityId
      }

      result = await runLogicRules(testData, executionContext)
    }

    return NextResponse.json({
      success: true,
      result,
      testData,
      context: {
        ...context,
        entityType,
        entityId
      }
    })

  } catch (error) {
    console.error('Logic engine test error:', error)
    return NextResponse.json(
      { error: 'Failed to test logic engine', details: String(error) },
      { status: 500 }
    )
  }
}

// GET endpoint for getting sample test data
export async function GET() {
  const sampleTestData = {
    // Customer data example
    customer: {
      riskScore: 0.85,
      churnProbability: 0.7,
      segment: 'enterprise',
      lastLoginDays: 45,
      totalSpent: 125000,
      email: 'customer@example.com',
      status: 'active'
    },

    // Incident data example
    incident: {
      severity: 'critical',
      status: 'open',
      title: 'System outage detected',
      sourceType: 'monitoring',
      createdAt: new Date().toISOString(),
      affectedUsers: 1500,
      estimatedDowntime: 30
    },

    // Mission data example
    mission: {
      status: 'active',
      name: 'Q1 Security Audit',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      progress: 75,
      budget: 50000,
      teamSize: 8
    },

    // Pipeline data example
    pipeline: {
      status: 'failed',
      executionTime: 3600,
      errorRate: 0.15,
      dataQualityScore: 0.65,
      recordsProcessed: 10000,
      lastRun: new Date().toISOString()
    },

    // Anomaly data example
    anomaly: {
      severity: 'high',
      resolved: false,
      title: 'Unusual traffic pattern detected',
      resourceType: 'network',
      detectedAt: new Date().toISOString(),
      confidence: 0.92,
      impact: 'medium'
    }
  }

  const sampleContexts = {
    customer: {
      entityType: 'customer',
      entityId: 'cust_123',
      userId: 'agent_001'
    },
    incident: {
      entityType: 'incident',
      entityId: 'inc_456',
      missionId: 'mission_789',
      userId: 'agent_002'
    },
    mission: {
      entityType: 'mission',
      entityId: 'mission_789',
      userId: 'manager_001'
    },
    pipeline: {
      entityType: 'pipeline',
      entityId: 'pipe_321',
      userId: 'system'
    },
    anomaly: {
      entityType: 'anomaly',
      entityId: 'anom_654',
      userId: 'detector_ai'
    }
  }

  return NextResponse.json({
    sampleTestData,
    sampleContexts,
    usage: {
      testSpecificRule: 'POST with { testData, context, ruleId }',
      testAllRules: 'POST with { testData, context, entityType?, entityId? }',
      getSamples: 'GET this endpoint'
    }
  })
} 