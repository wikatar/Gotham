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

export default function PipelineBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

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

  const savePipeline = () => {
    const pipeline = {
      id: `pipeline-${Date.now()}`,
      name: 'Untitled Pipeline',
      nodes,
      edges,
    }
    console.log('Saving pipeline:', pipeline)
    // Replace with POST to /api/pipelines
  }

  return (
    <div className="w-full h-[90vh]">
      <div className="mb-4 flex gap-2">
        <Button onClick={() => addNode('data')}>Add Data</Button>
        <Button onClick={() => addNode('model')}>Add Model</Button>
        <Button onClick={() => addNode('logic')}>Add Logic</Button>
        <Button onClick={() => addNode('agent')}>Add Agent</Button>
        <Button variant="success" onClick={savePipeline}>
          Save Pipeline
        </Button>
      </div>

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
  )
} 