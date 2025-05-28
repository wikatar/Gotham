'use client'

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

export default function Badge({ 
  children, 
  variant = 'default', 
  className = '' 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    outline: 'border border-secondary/40 text-text-secondary',
    secondary: 'bg-secondary/10 text-text-secondary'
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
} 