// /components/pipelines/PipelineBuilder.tsx
// Visuellt gränssnitt för att bygga pipelines (React + React Flow)

import React, { useCallback, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PipelineBuilderProps {
  missionId?: string;
  onPipelineSaved?: (pipelineId: string) => void;
}

export default function PipelineBuilder({ 
  missionId = 'mission-abc', // Default mission ID, should be passed in
  onPipelineSaved 
}: PipelineBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [name, setName] = useState('Untitled Pipeline')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addNode = (type: 'model' | 'logic' | 'agent' | 'data') => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 250, y: Math.random() * 250 },
      data: { label: `${type} node` },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const savePipeline = async () => {
    setError(null)
    setSaving(true)

    try {
      const pipelinePayload = {
        id: `pipeline-${Date.now()}`,
        name,
        missionId,
        description,
        nodes,
        edges,
      }

      const res = await fetch('/api/pipelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipelinePayload),
      })

      if (res.ok) {
        const data = await res.json()
        // Call the callback if provided
        if (onPipelineSaved) {
          onPipelineSaved(data.pipeline.id)
        } else {
          alert('Pipeline saved successfully: ' + data.pipeline.name)
        }
      } else {
        const err = await res.json()
        setError(err.message || err.error || 'Failed to save pipeline')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pipeline-name">Pipeline Name</Label>
          <Input 
            id="pipeline-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Pipeline Name"
          />
        </div>
        <div>
          <Label htmlFor="pipeline-description">Description (Optional)</Label>
          <Input 
            id="pipeline-description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Brief description of this pipeline"
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Button onClick={() => addNode('data')}>Add Data</Button>
        <Button onClick={() => addNode('model')}>Add Model</Button>
        <Button onClick={() => addNode('logic')}>Add Logic</Button>
        <Button onClick={() => addNode('agent')}>Add Agent</Button>
        <Button 
          variant="default" 
          onClick={savePipeline}
          disabled={saving || !name.trim() || nodes.length === 0}
          className="ml-auto"
        >
          {saving ? 'Saving...' : 'Save Pipeline'}
        </Button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="w-full h-[70vh] border rounded-md">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  )
} 