'use client'

import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'warning' | 'danger' | 'info' | 'success'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none'
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#FF3333] hover:bg-[#CC0000] border border-[#FF3333] text-white';
      case 'secondary':
        return 'bg-background-paper hover:bg-background-elevated border border-secondary/30 text-text-primary';
      case 'text':
        return 'bg-transparent hover:bg-secondary/20 border-transparent text-text-secondary hover:text-text-primary';
      case 'warning':
        return 'bg-warning/10 hover:bg-warning/20 border border-warning text-warning';
      case 'danger':
        return 'bg-error/10 hover:bg-error/20 border border-error text-error';
      case 'info':
        return 'bg-info/10 hover:bg-info/20 border border-info text-info';
      case 'success':
        return 'bg-success/10 hover:bg-success/20 border border-success text-success';
      default:
        return 'bg-background-paper hover:bg-background-elevated border border-secondary/30 text-text-primary';
    }
  };
  
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  }
  
  return (
    <button
      className={`${baseClasses} ${getVariantClasses()} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
} 