import type { Metadata } from 'next'
import './globals.css'
import { TARSProvider } from './lib/tarsContext'

export const metadata: Metadata = {
  title: 'Gotham Analytics',
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
        <TARSProvider>
          {children}
        </TARSProvider>
      </body>
    </html>
  )
} 