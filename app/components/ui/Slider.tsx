'use client'

import React from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  className?: string
}

export const Slider: React.FC<SliderProps> = ({ 
  min, 
  max, 
  step = 1,
  value, 
  onChange, 
  className = '' 
}) => {
  // Handle slider change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }
  
  // Calculate percentage for styling
  const percentage = ((value - min) / (max - min)) * 100
  
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-background-paper rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, var(--color-background-paper) ${percentage}%, var(--color-background-paper) 100%)`
        }}
      />
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          border: 2px solid var(--color-background);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-primary);
          border: 2px solid var(--color-background);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover,
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
} 