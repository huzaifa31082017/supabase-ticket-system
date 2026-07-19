'use client'

import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 DashboardLayout: Checking auth...')
        const { data, error } = await supabase.auth.getSession()
        
        if (error || !data?.session) {
          console.log('❌ DashboardLayout: User not authenticated, blocking access')
          setIsChecking(false)
          // Use window.location to force hard redirect
          window.location.replace('/auth')
          return
        }

        console.log('✅ DashboardLayout: User authenticated, allowing access')
        setIsAuthenticated(true)
        setIsChecking(false)
      } catch (err) {
        console.error('❌ DashboardLayout: Auth check failed:', err)
        setIsChecking(false)
        window.location.replace('/auth')
      }
    }

    checkAuth()
  }, [])

  // Block rendering until auth is verified
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400">Verifying access...</div>
      </div>
    )
  }

  // Block rendering if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Render protected content
  return (
    <main className="min-h-screen bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  )
}
