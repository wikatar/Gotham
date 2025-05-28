import { NextRequest, NextResponse } from 'next/server'
import { logLineageStep, createPipelineExecutionId, LineageContext } from '@/app/lib/logLineage'

// Example data processing functions
function cleanData(rawData: any[]): any[] {
  return rawData.map(item => ({
    ...item,
    email: item.email?.toLowerCase().trim(),
    name: item.name?.trim(),
    createdAt: new Date(item.createdAt || Date.now()).toISOString()
  }));
}

function enrichData(cleanedData: any[]): any[] {
  return cleanedData.map(item => ({
    ...item,
    domain: item.email?.split('@')[1] || 'unknown',
    isValidEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email || ''),
    nameLength: item.name?.length || 0
  }));
}

function aggregateData(enrichedData: any[]): any {
  const domains = enrichedData.reduce((acc, item) => {
    acc[item.domain] = (acc[item.domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRecords: enrichedData.length,
    validEmails: enrichedData.filter(item => item.isValidEmail).length,
    domainDistribution: domains,
    averageNameLength: enrichedData.reduce((sum, item) => sum + item.nameLength, 0) / enrichedData.length
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data: rawData, source = 'api_upload' } = body;

    if (!Array.isArray(rawData)) {
      return NextResponse.json({ error: 'Data must be an array' }, { status: 400 });
    }

    // Create a lineage context for this processing pipeline
    const executionId = createPipelineExecutionId('data_processing');
    const lineageContext = new LineageContext({
      pipelineId: executionId,
      agentId: 'data_processor_api',
      source
    });

    // Step 1: Data Cleaning
    const cleanedData = cleanData(rawData);
    await lineageContext.logStep({
      input: {
        rawRecords: rawData.length,
        sampleRecord: rawData[0],
        processingRules: ['lowercase_email', 'trim_whitespace', 'standardize_dates']
      },
      output: {
        cleanedRecords: cleanedData.length,
        sampleCleanedRecord: cleanedData[0],
        transformationsApplied: ['email_normalization', 'name_trimming', 'date_standardization']
      },
      step: 'data_cleaning'
    });

    // Step 2: Data Enrichment
    const enrichedData = enrichData(cleanedData);
    await lineageContext.logStep({
      input: {
        cleanedRecords: cleanedData.length,
        fieldsToEnrich: ['email', 'name']
      },
      output: {
        enrichedRecords: enrichedData.length,
        newFields: ['domain', 'isValidEmail', 'nameLength'],
        sampleEnrichedRecord: enrichedData[0]
      },
      step: 'data_enrichment'
    });

    // Step 3: Data Aggregation
    const aggregatedResults = aggregateData(enrichedData);
    await lineageContext.logStep({
      input: {
        enrichedRecords: enrichedData.length,
        aggregationTypes: ['count', 'domain_distribution', 'validation_stats']
      },
      output: aggregatedResults,
      step: 'data_aggregation'
    });

    // Log final pipeline completion
    await logLineageStep({
      pipelineId: executionId,
      agentId: 'data_processor_api',
      input: {
        originalRecords: rawData.length,
        totalSteps: lineageContext.getStepCount()
      },
      output: {
        success: true,
        finalResults: aggregatedResults,
        processingTime: new Date().toISOString(),
        stepsCompleted: lineageContext.getStepCount()
      },
      step: 'pipeline_complete',
      source
    });

    return NextResponse.json({
      success: true,
      executionId,
      results: {
        cleaned: cleanedData,
        enriched: enrichedData,
        aggregated: aggregatedResults
      },
      lineage: {
        pipelineId: executionId,
        stepsCompleted: lineageContext.getStepCount(),
        source
      }
    });

  } catch (error) {
    console.error('Error processing data:', error);
    return NextResponse.json({
      error: 'Failed to process data',
      message: (error as Error).message
    }, { status: 500 });
  }
} 