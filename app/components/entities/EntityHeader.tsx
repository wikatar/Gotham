'use client'

import React from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { LineageModal } from '../lineage/LineageModal'
import { 
  GitBranch, 
  Database, 
  Calendar, 
  Tag,
  ExternalLink,
  Edit,
  MoreHorizontal
} from 'lucide-react'

interface Entity {
  id: string
  name: string | null
  type: string
  externalId: string | null
  metadata: any
  createdAt: Date
  updatedAt: Date
}

interface EntityHeaderProps {
  entity: Entity
  onEdit?: (entityId: string) => void
  onViewExternal?: (externalId: string) => void
  className?: string
  showActions?: boolean
}

export default function EntityHeader({
  entity,
  onEdit,
  onViewExternal,
  className = '',
  showActions = true
}: EntityHeaderProps) {
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'customer':
      case 'kund':
        return '👤'
      case 'product':
      case 'produkt':
        return '📦'
      case 'order':
      case 'beställning':
        return '🛒'
      case 'incident':
        return '🚨'
      case 'agent':
        return '🤖'
      case 'pipeline':
        return '⚙️'
      case 'data_source':
      case 'datakälla':
        return '💾'
      default:
        return '📄'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'customer':
      case 'kund':
        return 'bg-blue-100 text-blue-800'
      case 'product':
      case 'produkt':
        return 'bg-green-100 text-green-800'
      case 'order':
      case 'beställning':
        return 'bg-purple-100 text-purple-800'
      case 'incident':
        return 'bg-red-100 text-red-800'
      case 'agent':
        return 'bg-orange-100 text-orange-800'
      case 'pipeline':
        return 'bg-indigo-100 text-indigo-800'
      case 'data_source':
      case 'datakälla':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMetadataKeys = () => {
    if (!entity.metadata || typeof entity.metadata !== 'object') return []
    return Object.keys(entity.metadata).slice(0, 3) // Show max 3 metadata keys
  }

  const cardActions = showActions ? (
    <div className="flex items-center gap-2">
      <LineageModal
        trigger={
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
          >
            <GitBranch className="h-3 w-3" />
            Visa kedja
          </Button>
        }
        entityId={entity.id}
        title={`Entity Lineage - ${entity.name || entity.type}`}
        description={`Visa transformationssteg för entitet ${entity.name || entity.id}`}
      />

      {onEdit && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(entity.id)}
          className="flex items-center gap-1"
        >
          <Edit className="h-3 w-3" />
          Redigera
        </Button>
      )}

      {onViewExternal && entity.externalId && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewExternal(entity.externalId!)}
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Extern källa
        </Button>
      )}
    </div>
  ) : undefined

  return (
    <Card 
      title={entity.name || `${entity.type} ${entity.id.substring(0, 8)}...`}
      actions={cardActions}
      className={className}
    >
      <div className="space-y-4">
        {/* Entity Info */}
        <div className="flex items-start gap-4">
          <div className="text-4xl">{getEntityIcon(entity.type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={getTypeColor(entity.type)}>
                {entity.type}
              </Badge>
              {entity.externalId && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {entity.externalId}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Skapad: {formatDate(entity.createdAt)}
                </div>
                {entity.updatedAt.getTime() !== entity.createdAt.getTime() && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Uppdaterad: {formatDate(entity.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        {entity.metadata && getMetadataKeys().length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Metadata
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getMetadataKeys().map(key => (
                <div key={key} className="text-sm">
                  <span className="text-gray-600 font-medium">{key}:</span>
                  <div className="mt-1 text-gray-900">
                    {typeof entity.metadata[key] === 'object' 
                      ? JSON.stringify(entity.metadata[key])
                      : String(entity.metadata[key])
                    }
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(entity.metadata).length > 3 && (
              <div className="mt-3">
                <Button variant="ghost" size="sm" className="text-xs">
                  Visa alla metadata ({Object.keys(entity.metadata).length} fält)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
} 