'use client'

import Sidebar from './Sidebar'
import Header from './Header'
import TARSController from '../analytics/TARSController'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <TARSController />
    </div>
  )
} 