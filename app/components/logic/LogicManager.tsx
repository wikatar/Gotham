'use client'

import { useState } from 'react'
import LogicBuilder from './LogicBuilder'
import LogicRulesList from './LogicRulesList'
import { LogicRule } from '../../types/logic'

interface LogicManagerProps {
  entityType?: string
  entityId?: string
  title?: string
  description?: string
}

export default function LogicManager({
  entityType,
  entityId,
  title = 'Logic Builder',
  description = 'Skapa och hantera automatiska regler utan kod'
}: LogicManagerProps) {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingRule, setEditingRule] = useState<LogicRule | null>(null)

  const handleCreateNew = () => {
    setEditingRule(null)
    setView('create')
  }

  const handleEdit = (rule: LogicRule) => {
    setEditingRule(rule)
    setView('edit')
  }

  const handleSave = (rule: LogicRule) => {
    // Rule saved successfully, go back to list
    setView('list')
    setEditingRule(null)
  }

  const handleCancel = () => {
    setView('list')
    setEditingRule(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-text-secondary">{description}</p>
      </div>

      {/* View Switcher */}
      {view === 'list' && (
        <LogicRulesList
          entityType={entityType}
          entityId={entityId}
          onEdit={handleEdit}
          onCreateNew={handleCreateNew}
        />
      )}

      {(view === 'create' || view === 'edit') && (
        <LogicBuilder
          entityType={entityType}
          entityId={entityId}
          mode={view}
          initialRule={editingRule || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
} 