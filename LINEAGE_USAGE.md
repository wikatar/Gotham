# Data Lineage Tracking - Usage Guide

## Overview
The `logLineageStep` utility provides comprehensive data lineage tracking for all pipelines and transformations in Gotham Analytics. This guide shows how to integrate lineage logging into your data processing workflows.

## Quick Start

### Basic Usage

```typescript
import { logLineageStep } from '@/app/lib/logLineage';

// Log a simple transformation step
await logLineageStep({
  entityId: customer.id,
  pipelineId: "data-cleaning-pipeline",
  input: rawData,
  output: cleanedData,
  step: "data-cleaning",
  source: "uploaded-file"
});
```

### Using LineageContext for Pipeline Runs

```typescript
import { LineageContext, createPipelineExecutionId } from '@/app/lib/logLineage';

// Create a context for related steps
const executionId = createPipelineExecutionId('customer_processing');
const context = new LineageContext({
  pipelineId: executionId,
  entityId: customer.id,
  agentId: 'customer_processor_v2',
  source: 'salesforce'
});

// Log multiple related steps
await context.logStep({
  input: rawCustomerData,
  output: validatedData,
  step: 'validation'
});

await context.logStep({
  input: validatedData,
  output: enrichedData,
  step: 'enrichment'
});
```

## Integration Examples

### 1. ETL Pipeline Integration

```typescript
// In your ETL service
import { logLineageStep, createPipelineExecutionId } from '@/app/lib/logLineage';

async function processCustomerData(sourceId: string) {
  const executionId = createPipelineExecutionId('customer_etl');
  
  try {
    // Step 1: Extract
    const rawData = await extractFromSource(sourceId);
    await logLineageStep({
      entityId: sourceId,
      pipelineId: executionId,
      agentId: 'extractor_v1',
      input: { sourceId, extractionQuery: 'SELECT * FROM customers' },
      output: { recordCount: rawData.length, extractedAt: new Date() },
      step: 'extraction',
      source: 'Database'
    });

    // Step 2: Transform
    const transformedData = await transformData(rawData);
    await logLineageStep({
      entityId: sourceId,
      pipelineId: executionId,
      agentId: 'transformer_v1',
      input: { rawRecords: rawData.length },
      output: { 
        transformedRecords: transformedData.length,
        transformations: ['email_normalization', 'phone_formatting']
      },
      step: 'transformation',
      source: 'ETL Pipeline'
    });

    // Step 3: Load
    const loadResult = await loadToWarehouse(transformedData);
    await logLineageStep({
      entityId: sourceId,
      pipelineId: executionId,
      agentId: 'loader_v1',
      input: { recordsToLoad: transformedData.length },
      output: { 
        loadedRecords: loadResult.count,
        targetTable: 'customer_warehouse',
        loadedAt: new Date()
      },
      step: 'loading',
      source: 'Data Warehouse'
    });

  } catch (error) {
    // Log failures too
    await logLineageStep({
      entityId: sourceId,
      pipelineId: executionId,
      agentId: 'etl_service',
      input: { sourceId },
      output: { error: error.message, failedAt: new Date() },
      step: 'etl_failed',
      source: 'ETL Pipeline'
    });
    throw error;
  }
}
```

### 2. ML Pipeline Integration

```typescript
// In your ML training pipeline
import { logLineageStep, LineageContext } from '@/app/lib/logLineage';

async function trainChurnModel(datasetId: string) {
  const context = new LineageContext({
    pipelineId: createPipelineExecutionId('churn_model_training'),
    entityId: datasetId,
    agentId: 'ml_trainer_v3',
    source: 'ML Pipeline'
  });

  // Data preparation
  const features = await prepareFeatures(datasetId);
  await context.logStep({
    input: { datasetId, featureCount: 0 },
    output: { 
      features: features.columns,
      recordCount: features.length,
      featureEngineering: ['rolling_averages', 'categorical_encoding']
    },
    step: 'feature_preparation'
  });

  // Model training
  const model = await trainModel(features);
  await context.logStep({
    input: { 
      features: features.columns,
      algorithm: 'RandomForest',
      hyperparameters: { n_estimators: 100, max_depth: 10 }
    },
    output: {
      modelId: model.id,
      accuracy: model.metrics.accuracy,
      precision: model.metrics.precision,
      recall: model.metrics.recall
    },
    step: 'model_training'
  });

  // Model validation
  const validation = await validateModel(model);
  await context.logStep({
    input: { modelId: model.id, validationSet: 'test_2024' },
    output: {
      validationAccuracy: validation.accuracy,
      confusionMatrix: validation.confusionMatrix,
      featureImportance: validation.featureImportance
    },
    step: 'model_validation'
  });
}
```

### 3. Data Quality Pipeline

```typescript
// In your data quality service
async function runDataQualityChecks(tableId: string) {
  const executionId = createPipelineExecutionId('data_quality');
  
  // Completeness check
  const completeness = await checkCompleteness(tableId);
  await logLineageStep({
    entityId: tableId,
    pipelineId: executionId,
    agentId: 'quality_checker_v1',
    input: { tableId, checkType: 'completeness' },
    output: {
      completenessScore: completeness.score,
      missingFields: completeness.missingFields,
      totalRecords: completeness.totalRecords
    },
    step: 'completeness_check',
    source: 'Data Quality Framework'
  });

  // Accuracy validation
  const accuracy = await validateAccuracy(tableId);
  await logLineageStep({
    entityId: tableId,
    pipelineId: executionId,
    agentId: 'accuracy_validator_v1',
    input: { tableId, validationRules: accuracy.rules },
    output: {
      accuracyScore: accuracy.score,
      failedValidations: accuracy.failures,
      validatedRecords: accuracy.validatedCount
    },
    step: 'accuracy_validation',
    source: 'Data Quality Framework'
  });
}
```

### 4. API Endpoint Integration

```typescript
// In your API routes
import { logLineageStep } from '@/app/lib/logLineage';

export async function POST(req: NextRequest) {
  const { customerId, updateData } = await req.json();
  
  try {
    // Log the API request
    await logLineageStep({
      entityId: customerId,
      pipelineId: `api_update_${Date.now()}`,
      agentId: 'customer_api_v1',
      input: { customerId, updateFields: Object.keys(updateData) },
      output: { status: 'processing_started' },
      step: 'api_request_received',
      source: 'Customer API'
    });

    // Process the update
    const result = await updateCustomer(customerId, updateData);
    
    // Log the successful update
    await logLineageStep({
      entityId: customerId,
      pipelineId: `api_update_${Date.now()}`,
      agentId: 'customer_api_v1',
      input: { customerId, updateData },
      output: { 
        updatedFields: result.updatedFields,
        version: result.version,
        updatedAt: result.updatedAt
      },
      step: 'customer_updated',
      source: 'Customer API'
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    // Log the failure
    await logLineageStep({
      entityId: customerId,
      pipelineId: `api_update_${Date.now()}`,
      agentId: 'customer_api_v1',
      input: { customerId, updateData },
      output: { error: error.message, failedAt: new Date() },
      step: 'update_failed',
      source: 'Customer API'
    });
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Best Practices

### 1. Consistent Step Naming
Use descriptive, consistent step names:
```typescript
// Good
step: 'data_extraction'
step: 'email_validation'
step: 'model_training'

// Avoid
step: 'step1'
step: 'process'
step: 'done'
```

### 2. Meaningful Input/Output Logging
Include relevant metadata:
```typescript
// Good
input: {
  sourceTable: 'customers',
  recordCount: 1000,
  filters: { active: true, region: 'EMEA' }
}
output: {
  processedRecords: 950,
  validRecords: 920,
  errorRecords: 30,
  processingTime: '2.3s'
}

// Avoid
input: rawData
output: processedData
```

### 3. Error Handling
Always log failures:
```typescript
try {
  const result = await processData(input);
  await logLineageStep({
    // ... success logging
    step: 'processing_complete'
  });
} catch (error) {
  await logLineageStep({
    // ... error logging
    step: 'processing_failed',
    output: { error: error.message, timestamp: new Date() }
  });
  throw error;
}
```

### 4. Use LineageContext for Related Steps
For multi-step pipelines:
```typescript
const context = new LineageContext({
  pipelineId: createPipelineExecutionId('data_pipeline'),
  entityId: sourceId,
  agentId: 'pipeline_processor',
  source: 'Data Pipeline'
});

// All steps will be automatically numbered and linked
await context.logStep({ /* step 1 */ });
await context.logStep({ /* step 2 */ });
await context.logStep({ /* step 3 */ });
```

## Querying Lineage Data

### Get Lineage for an Entity
```typescript
import { getLineageForEntity } from '@/app/lib/logLineage';

const lineage = await getLineageForEntity(customerId);
console.log('Customer data lineage:', lineage);
```

### Get Lineage for a Pipeline
```typescript
import { getLineageForPipeline } from '@/app/lib/logLineage';

const pipelineLineage = await getLineageForPipeline(executionId);
console.log('Pipeline execution steps:', pipelineLineage);
```

## Integration Checklist

- [ ] Import `logLineageStep` in your pipeline files
- [ ] Add lineage logging after each major transformation
- [ ] Use `LineageContext` for multi-step pipelines
- [ ] Log both successes and failures
- [ ] Include meaningful input/output metadata
- [ ] Use consistent step naming conventions
- [ ] Test lineage logging in development
- [ ] Monitor lineage logs in production

## Performance Considerations

- Lineage logging is asynchronous and won't block your pipeline
- Failed lineage logs won't crash your pipeline (errors are caught)
- Consider batching lineage logs for high-frequency operations
- Use sampling for very high-volume data streams

## Troubleshooting

### Common Issues

1. **Missing lineage logs**: Check that `logLineageStep` is awaited
2. **JSON serialization errors**: Ensure input/output can be JSON.stringify'd
3. **Database connection issues**: Lineage logging uses the same Prisma client

### Debug Mode
Enable debug logging:
```typescript
// The utility automatically logs to console in development
console.log('📊 Lineage logged: step_name (source) - Pipeline: pipeline_id');
```

## Next Steps

After implementing lineage logging:
1. **Build UI components** to visualize lineage data
2. **Create lineage dashboards** for monitoring data flows
3. **Set up alerts** for pipeline failures
4. **Implement lineage-based impact analysis**
5. **Add compliance reporting** using lineage data 