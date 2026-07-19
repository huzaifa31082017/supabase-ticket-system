'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import PublicDashboard from '@/app/components/PublicDashboard'
import TicketTracker from '@/app/components/TicketTracker'
import { BarChart3, Ticket } from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('public')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 Dashboard: Checking authentication...')
        
        const { data, error } = await supabase.auth.getSession()
        const session = data?.session

        console.log('🔐 Dashboard: Session check result:', {
          hasSession: !!session,
          userEmail: session?.user.email,
          error: error?.message,
        })

        if (error) {
          console.error('❌ Dashboard: Session error:', error)
          setIsLoading(false)
          window.location.href = '/auth'
          return
        }

        if (!session) {
          console.log('⚠️ Dashboard: No session found, user not authenticated')
          setIsLoading(false)
          // IMPORTANT: Use window.location to force actual navigation
          window.location.href = '/auth'
          return
        }

        console.log('✅ Dashboard: User authenticated:', session.user.email)
        setIsAuthenticated(true)
        setIsLoading(false)
      } catch (error) {
        console.error('❌ Dashboard: Error checking session:', error)
        setIsLoading(false)
        window.location.href = '/auth'
      }
    }

    checkAuth()
  }, [])

  // Don't render dashboard content until authenticated
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Verifying access...</div>
      </div>
    )
  }

  // If not authenticated, don't render anything (the redirect should have happened)
  if (!isAuthenticated) {
    return null
  }

  // Only render dashboard if authenticated
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Monitor SLA compliance and ticket escalations</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700 p-1">
          <TabsTrigger
            value="public"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Public Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Ticket Tracker</span>
            <span className="sm:hidden">Tickets</span>
          </TabsTrigger>
        </TabsList>

        {/* Public Dashboard Tab */}
        <TabsContent value="public" className="mt-6">
          <PublicDashboard />
        </TabsContent>

        {/* Ticket Tracker Tab */}
        <TabsContent value="tickets" className="mt-6">
          <TicketTracker />
        </TabsContent>
      </Tabs>
    </div>
  )
}
