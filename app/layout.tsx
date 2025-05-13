import type { Metadata } from 'next'
import './globals.css'
import { TARSProvider } from './lib/tarsContext'
import { MissionProvider } from './lib/missionContext'

export const metadata: Metadata = {
  title: 'Monolith Analytics',
  description: 'Advanced data analytics platform for businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary">
        <MissionProvider>
          <TARSProvider>
            {children}
          </TARSProvider>
        </MissionProvider>
      </body>
    </html>
  )
} 