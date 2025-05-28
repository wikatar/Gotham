import { db } from "./db";

export interface LogLineageStepParams {
  entityId?: string;
  pipelineId?: string;
  agentId?: string;
  missionId?: string;
  input: any;
  output: any;
  step: string;
  source?: string;
}

export interface LineageLogResult {
  id: string;
  entityId: string | null;
  pipelineId: string | null;
  agentId: string | null;
  missionId: string | null;
  input: string;
  output: string;
  step: string;
  source: string | null;
  createdAt: Date;
}

/**
 * Logs a lineage step for data transformation tracking
 * 
 * @param params - The lineage step parameters
 * @returns Promise<LineageLogResult> - The created lineage log entry
 * 
 * @example
 * ```ts
 * await logLineageStep({
 *   entityId: customer.id,
 *   pipelineId: "cleaning-pipeline",
 *   input: rawData,
 *   output: cleanedData,
 *   step: "data-cleaning",
 *   source: "uploaded-file"
 * });
 * ```
 */
export async function logLineageStep({
  entityId,
  pipelineId,
  agentId,
  missionId,
  input,
  output,
  step,
  source = "internal"
}: LogLineageStepParams): Promise<LineageLogResult> {
  try {
    // Serialize input and output to JSON strings for SQLite compatibility
    const inputJson = typeof input === 'string' ? input : JSON.stringify(input);
    const outputJson = typeof output === 'string' ? output : JSON.stringify(output);

    const lineageLog = await db.lineageLog.create({
      data: {
        entityId,
        pipelineId,
        agentId,
        missionId,
        input: inputJson,
        output: outputJson,
        step,
        source,
      },
    });

    console.log(`📊 Lineage logged: ${step} (${source}) - Pipeline: ${pipelineId || 'N/A'}, Agent: ${agentId || 'N/A'}, Mission: ${missionId || 'N/A'}`);
    
    return lineageLog;
  } catch (error) {
    console.error('❌ Failed to log lineage step:', error);
    console.error('Step details:', { entityId, pipelineId, agentId, missionId, step, source });
    
    // Re-throw the error so calling code can handle it appropriately
    throw new Error(`Failed to log lineage step "${step}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Logs multiple lineage steps in a batch operation
 * 
 * @param steps - Array of lineage step parameters
 * @returns Promise<LineageLogResult[]> - Array of created lineage log entries
 */
export async function logLineageSteps(steps: LogLineageStepParams[]): Promise<LineageLogResult[]> {
  const results: LineageLogResult[] = [];
  
  for (const step of steps) {
    try {
      const result = await logLineageStep(step);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to log lineage step "${step.step}":`, error);
      // Continue with other steps even if one fails
    }
  }
  
  return results;
}

/**
 * Creates a lineage context for a pipeline run
 * Useful for tracking related steps in a single pipeline execution
 */
export class LineageContext {
  private pipelineId: string;
  private entityId?: string;
  private agentId?: string;
  private missionId?: string;
  private source: string;
  private stepCounter: number = 0;

  constructor({
    pipelineId,
    entityId,
    agentId,
    missionId,
    source = "internal"
  }: {
    pipelineId: string;
    entityId?: string;
    agentId?: string;
    missionId?: string;
    source?: string;
  }) {
    this.pipelineId = pipelineId;
    this.entityId = entityId;
    this.agentId = agentId;
    this.missionId = missionId;
    this.source = source;
  }

  /**
   * Log a step within this pipeline context
   */
  async logStep({
    input,
    output,
    step,
    entityId,
    agentId,
    missionId,
    source
  }: {
    input: any;
    output: any;
    step: string;
    entityId?: string;
    agentId?: string;
    missionId?: string;
    source?: string;
  }): Promise<LineageLogResult> {
    this.stepCounter++;
    
    return await logLineageStep({
      entityId: entityId || this.entityId,
      pipelineId: this.pipelineId,
      agentId: agentId || this.agentId,
      missionId: missionId || this.missionId,
      input,
      output,
      step: `${this.stepCounter}_${step}`,
      source: source || this.source
    });
  }

  /**
   * Get the current step count for this pipeline run
   */
  getStepCount(): number {
    return this.stepCounter;
  }
}

/**
 * Utility function to create a standardized pipeline execution ID
 */
export function createPipelineExecutionId(pipelineName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${pipelineName}_${timestamp}_${randomSuffix}`;
}

/**
 * Helper to extract metadata from lineage logs for analysis
 */
export async function getLineageForEntity(entityId: string): Promise<LineageLogResult[]> {
  try {
    return await db.lineageLog.findMany({
      where: { entityId },
      orderBy: { createdAt: 'asc' },
      include: {
        entity: true
      }
    });
  } catch (error) {
    console.error('❌ Failed to get lineage for entity:', error);
    return [];
  }
}

/**
 * Helper to get lineage for a specific pipeline execution
 */
export async function getLineageForPipeline(pipelineId: string): Promise<LineageLogResult[]> {
  try {
    return await db.lineageLog.findMany({
      where: { pipelineId },
      orderBy: { createdAt: 'asc' },
      include: {
        entity: true
      }
    });
  } catch (error) {
    console.error('❌ Failed to get lineage for pipeline:', error);
    return [];
  }
}

/**
 * Helper to get lineage for a specific mission
 */
export async function getLineageForMission(missionId: string): Promise<LineageLogResult[]> {
  try {
    return await db.lineageLog.findMany({
      where: { missionId },
      orderBy: { createdAt: 'asc' },
      include: {
        entity: true,
        mission: true
      }
    });
  } catch (error) {
    console.error('❌ Failed to get lineage for mission:', error);
    return [];
  }
}

/**
 * Log a decision with automatic lineage tracking
 * This creates both a lineage log and a decision explanation
 */
export async function logDecisionWithLineage({
  title,
  description,
  decisionType,
  outcome,
  confidence,
  agentId,
  missionId,
  entityType,
  entityId,
  inputData,
  reasoning,
  alternatives,
  impactLevel = 'medium',
  status = 'pending',
  pipelineId,
  step,
  source = 'AI Decision'
}: {
  title: string;
  description?: string;
  decisionType: string;
  outcome: string;
  confidence: number;
  agentId?: string;
  missionId?: string;
  entityType?: string;
  entityId?: string;
  inputData: any;
  reasoning?: string;
  alternatives?: any;
  impactLevel?: string;
  status?: string;
  pipelineId?: string;
  step: string;
  source?: string;
}) {
  try {
    // First, log the lineage step
    const lineageLog = await logLineageStep({
      entityId,
      pipelineId,
      agentId,
      missionId,
      input: inputData,
      output: { decision: outcome, confidence, reasoning },
      step,
      source
    });

    // Then, create the decision explanation linked to the lineage
    const decision = await db.decisionExplanation.create({
      data: {
        title,
        description,
        decisionType,
        outcome,
        confidence,
        agentId,
        missionId,
        lineageId: lineageLog.id,
        entityType,
        entityId,
        inputData: typeof inputData === 'string' ? inputData : JSON.stringify(inputData),
        reasoning,
        alternatives: typeof alternatives === 'string' ? alternatives : JSON.stringify(alternatives),
        impactLevel,
        status,
      },
      include: {
        mission: true,
        lineage: true,
      },
    });

    console.log(`🧠 Decision logged with lineage: ${title} (${decisionType}) - Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    return {
      decision,
      lineage: lineageLog
    };
  } catch (error) {
    console.error('❌ Failed to log decision with lineage:', error);
    throw new Error(`Failed to log decision "${title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 