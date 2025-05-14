// /api/pipeline/schema.ts

import { z } from 'zod'

export const PipelineNodeSchema = z.object({
  id: z.string(),                          // unik nod-ID
  type: z.enum(['data', 'model', 'logic', 'agent']),
  name: z.string(),
  config: z.any(),                         // modellkonfiguration, transformationslogik, etc.
  inputs: z.array(z.string()).optional(),  // ID på tidigare noder
})

export const PipelineSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  nodes: z.array(PipelineNodeSchema),
})

export type Pipeline = z.infer<typeof PipelineSchema>
export type PipelineNode = z.infer<typeof PipelineNodeSchema> 