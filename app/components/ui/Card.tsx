'use client'

type CardProps = {
  title: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  minimizable?: boolean
}

export default function Card({ title, children, className = '', actions, minimizable = false }: CardProps) {
  return (
    <div className={`bg-background-paper rounded-lg border border-secondary/20 overflow-hidden animate-fade-in ${className}`}>
      <div className="px-4 py-3 border-b border-secondary/20 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center space-x-2">
          {actions}
          {minimizable && (
            <button className="text-text-secondary hover:text-text-primary">
              <span className="text-sm">⌄</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
} 