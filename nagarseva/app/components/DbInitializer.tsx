'use client'

import { useEffect } from 'react'

export default function DbInitializer() {
  useEffect(() => {
    // Try to initialize database on app startup
    const initDb = async () => {
      try {
        const response = await fetch('/api/init-db', {
          method: 'POST',
        })

        const data = await response.json()

        if (!response.ok) {
          console.warn('Database initialization warning:', data.message)
          if (data.instructions) {
            console.warn('Instructions:', data.instructions)
          }
        } else {
          console.log('✅ Database initialized:', data.message)
        }
      } catch (error) {
        console.warn('Database initialization check failed (this is OK if running locally):', error)
      }
    }

    // Run once on mount
    initDb()
  }, [])

  return null // This component renders nothing
}
