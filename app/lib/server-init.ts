import { etlRunner } from './etl/runner'

// Check if we're on the server and in a production environment
// Node.js specific check - only runs on server, not during build or on client
const isServer = typeof window === 'undefined'

if (isServer) {
  console.log('Initializing server components...')
  
  // In development, we start the ETL runner automatically
  // In production, you might want to control this differently
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting ETL Runner in development mode')
    etlRunner.start()
  }
}

export {} 