'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard')
  }, [router])
  
  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold mb-2">Monolith Analytics</div>
        <div className="text-text-secondary">Loading...</div>
      </div>
    </div>
  )
} 