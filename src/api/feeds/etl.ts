// ETL (Extract, Transform, Load) module for feed data processing
// Handles data normalization, indexing, and tagging

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define standard field names for normalization
const standardFieldNames: Record<string, string[]> = {
  // Person identifiers
  'person_id': ['personid', 'person_identifier', 'person_key', 'person-id', 'userid', 'user_id', 'user-id'],
  'name': ['full_name', 'fullname', 'full-name', 'person_name', 'username', 'user_name'],
  'first_name': ['firstname', 'first-name', 'given_name', 'givenname'],
  'last_name': ['lastname', 'last-name', 'surname', 'family_name', 'familyname'],
  
  // Date and time fields
  'timestamp': ['time', 'datetime', 'date_time', 'date-time', 'event_time', 'event_date', 'created_at', 'updated_at'],
  'date': ['event_date', 'created_date', 'updated_date', 'entry_date'],
  
  // Location fields
  'location': ['place', 'geo', 'position', 'loc', 'coordinates'],
  'latitude': ['lat', 'y'],
  'longitude': ['lng', 'lon', 'long', 'x'],
  
  // Organization fields
  'organization': ['org', 'company', 'institution', 'business'],
  'department': ['dept', 'team', 'unit', 'division'],
  
  // Event fields
  'event_type': ['type', 'action', 'category', 'event_category', 'event_action'],
  'event_source': ['source', 'origin', 'provider', 'channel'],
  
  // Value fields
  'value': ['amount', 'quantity', 'count', 'score', 'metric'],
  'currency': ['currency_code', 'currency-code', 'currency_type'],
};

// Define potentially sensitive field patterns
const sensitiveFieldPatterns = [
  // PII
  /social.*security/i, /ssn/i, /passport/i, /national.*id/i, 
  /birth.*date/i, /dob/i, /age/i, /gender/i, /sex/i, /ethnicity/i, /race/i,
  
  // Contact
  /email/i, /phone/i, /address/i, /postal/i, /zip/i, /city/i, /state/i, /country/i,
  
  // Financial
  /salary/i, /income/i, /payment/i, /card/i, /credit/i, /debit/i, /account.*number/i,
  /bank/i, /routing/i, /swift/i, /iban/i, /tax/i, /invoice/i,
  
  // Health
  /health/i, /medical/i, /diagnosis/i, /condition/i, /treatment/i, /medication/i,
  /prescription/i, /blood/i, /test.*result/i, /height/i, /weight/i,
  
  // Authentication
  /password/i, /secret/i, /token/i, /api.*key/i, /credential/i, /auth/i,
];

interface ProcessOptions {
  normalize: boolean;
  index: boolean;
  tagSensitiveData: boolean;
}

interface ProcessedData {
  data: Record<string, any>[];
  summary: {
    normalizedFields: Record<string, string>;
    sensitiveFields: string[];
    inferredTypes: Record<string, string>;
    uniqueValues: Record<string, number>;
  };
  length: number;
}

/**
 * Process and normalize data from feeds
 */
export async function processAndNormalizeData(
  accountId: string,
  feedId: string,
  data: Record<string, any>[],
  options: ProcessOptions
): Promise<ProcessedData> {
  console.log('stub: processAndNormalizeData');
  
  const { normalize = true, index = true, tagSensitiveData = false } = options;
  
  // Initialize result
  const processedData: Record<string, any>[] = [];
  const normalizedFields: Record<string, string> = {};
  const sensitiveFields: string[] = [];
  const inferredTypes: Record<string, string> = {};
  const uniqueValues: Record<string, number> = {};
  
  // Process the data
  for (const item of data) {
    const processedItem: Record<string, any> = { ...item };
    
    // Add metadata
    processedItem._feed_id = feedId;
    processedItem._account_id = accountId;
    processedItem._processed_at = new Date().toISOString();
    
    // Normalize field names if requested
    if (normalize) {
      Object.keys(processedItem).forEach(key => {
        // Skip metadata fields
        if (key.startsWith('_')) return;
        
        // Check if this field name matches any standard field patterns
        for (const [standardField, alternatives] of Object.entries(standardFieldNames)) {
          if (alternatives.includes(key.toLowerCase())) {
            // If the standard field doesn't already exist in the data
            if (!processedItem[standardField]) {
              processedItem[standardField] = processedItem[key];
              normalizedFields[key] = standardField;
            }
          }
        }
      });
    }
    
    // Tag sensitive data if requested
    if (tagSensitiveData) {
      Object.keys(processedItem).forEach(key => {
        // Skip metadata fields
        if (key.startsWith('_')) return;
        
        // Check if this field name matches any sensitive field patterns
        for (const pattern of sensitiveFieldPatterns) {
          if (pattern.test(key)) {
            processedItem[`_sensitive_${key}`] = true;
            if (!sensitiveFields.includes(key)) {
              sensitiveFields.push(key);
            }
            break;
          }
        }
      });
    }
    
    // Infer data types and collect unique value counts for indexing
    if (index) {
      Object.entries(processedItem).forEach(([key, value]) => {
        // Skip metadata fields
        if (key.startsWith('_')) return;
        
        // Infer data type
        const type = inferDataType(value);
        if (!inferredTypes[key]) {
          inferredTypes[key] = type;
        } else if (inferredTypes[key] !== type) {
          // If we see inconsistent types, mark as mixed
          inferredTypes[key] = 'mixed';
        }
        
        // Count unique values (for categorical fields)
        if (
          (type === 'string' || type === 'boolean') && 
          value !== null && 
          value !== undefined
        ) {
          const stringValue = String(value);
          uniqueValues[key] = uniqueValues[key] || {};
          uniqueValues[key][stringValue] = (uniqueValues[key][stringValue] || 0) + 1;
        }
      });
    }
    
    processedData.push(processedItem);
  }
  
  // TODO: In a real implementation, we would store the processed data in a database or data lake
  
  // Return the result
  return {
    data: processedData,
    summary: {
      normalizedFields,
      sensitiveFields,
      inferredTypes,
      uniqueValues,
    },
    length: processedData.length,
  };
}

/**
 * Infer the data type of a value
 */
function inferDataType(value: any): string {
  if (value === null || value === undefined) {
    return 'null';
  }
  
  if (Array.isArray(value)) {
    return 'array';
  }
  
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return 'date';
    }
    return 'object';
  }
  
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'float';
  }
  
  return typeof value;
} 