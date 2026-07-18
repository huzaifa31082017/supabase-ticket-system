# NagarSeva AI Citizen Advocate - Complete Implementation Guide

## Quick Start (5 Minutes)

### 1. Clone & Setup
```bash
git clone <your-repo>
cd nagarseva
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

### 3. Setup Database
- Go to Supabase Dashboard
- Create new project
- Run all SQL from `SUPABASE_SCHEMA.sql` in SQL editor
- Verify tables exist: `wards`, `tickets`, `escalation_logs`, `users`

### 4. Start Dev Server
```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Login
Use demo credentials:
- Email: `demo@nagarseva.com`
- Password: `demo1234`

---

## Complete Component Implementation

### File: `app/components/TicketTimer.tsx`

```typescript
'use client'

import { useCountdownTimer } from '@/app/hooks/useCountdownTimer'
import { Clock } from 'lucide-react'

interface TicketTimerProps {
  slaDeadline: string
}

export default function TicketTimer({ slaDeadline }: TicketTimerProps) {
  const timer = useCountdownTimer(slaDeadline, 0)

  const getTimeColor = () => {
    if (timer.isOverdue) return 'text-red-500'
    if (timer.hours <= 24) return 'text-amber-500'
    return 'text-emerald-500'
  }

  const getTimeBg = () => {
    if (timer.isOverdue) return 'bg-red-500/10 border-red-500/30'
    if (timer.hours <= 24) return 'bg-amber-500/10 border-amber-500/30'
    return 'bg-emerald-500/10 border-emerald-500/30'
  }

  const timeDisplay =
    timer.hours < 0
      ? `- ${Math.abs(timer.hours)}h ${timer.minutes}m overdue`
      : `${timer.hours}h ${timer.minutes}m remaining`

  return (
    <div className={`${getTimeBg()} border rounded-lg px-4 py-3 flex items-center gap-2`}>
      <Clock className={`w-5 h-5 ${getTimeColor()}`} />
      <div>
        <p className={`${getTimeColor()} text-sm font-semibold`}>{timeDisplay}</p>
        {timer.hours <= 24 && !timer.isOverdue && (
          <div className="flex items-center gap-1 mt-1">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full font-semibold">
              🔔 Nudge Sent
            </span>
          </div>
        )}
        {timer.isOverdue && (
          <div className="flex items-center gap-1 mt-1">
            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full font-semibold">
              🚨 Escalated to Commissioner
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
```

### File: `app/components/Navbar.tsx`

```typescript
'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">NS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">NagarSeva</h1>
              <p className="text-xs text-slate-400">AI Citizen Advocate</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-right">
                  <p className="text-sm text-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### File: `app/components/AccountabilityBoard.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getWards, getDashboardStats } from '@/app/actions/sla-actions'
import { Ward, DashboardStats } from '@/app/types'
import { Award, TrendingUp } from 'lucide-react'

export default function AccountabilityBoard() {
  const [wards, setWards] = useState<Ward[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [w, s] = await Promise.all([getWards(), getDashboardStats()])
        setWards(w)
        setStats(s)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Total Active Issues</p>
          <p className="text-3xl font-bold text-white">{stats?.total_active_issues}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">Escalated Today</p>
          <p className="text-3xl font-bold text-red-500">{stats?.issues_escalated_today}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-400 text-sm mb-2">City Average Score</p>
          <p className="text-3xl font-bold text-emerald-500">{stats?.city_wide_average_score}</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Ward Rankings
        </h2>
        <div className="space-y-3">
          {wards.map((ward, idx) => (
            <div key={ward.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">#{idx + 1} {ward.name}</p>
                <p className="text-xs text-slate-500">Population: {ward.total_population.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  ward.responsiveness_score > 80 ? 'text-emerald-500' :
                  ward.responsiveness_score >= 50 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {ward.responsiveness_score}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### File: `app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NagarSeva - AI Citizen Advocate',
  description: 'Service Level Agreement Tracker for Civic Complaints',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900`}>
        {children}
      </body>
    </html>
  )
}
```

### File: `app/dashboard/layout.tsx`

```typescript
import Navbar from '@/app/components/Navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
```

---

## Building Your Own Components

### Template: Card Component
```typescript
// app/components/ui/card.tsx
export function Card({ children, className = '' }: any) {
  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  )
}
```

### Template: Badge Component
```typescript
// app/components/ui/badge.tsx
export function Badge({ children, variant = 'default' }: any) {
  const variants = {
    default: 'bg-slate-700 text-slate-200',
    success: 'bg-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/20 text-amber-300',
    error: 'bg-red-500/20 text-red-300',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
```

---

## Key Architecture Decisions

### 1. Server-Side vs Client-Side
- **Server Actions** (`sla-actions.ts`): Database queries, escalation logic, stat calculations
- **Client Components**: UI rendering, user interactions, real-time timers

### 2. State Management
- Uses React hooks (useState, useEffect)
- Supabase client for real-time subscriptions (optional)
- No Redux/Zustand needed for this scope

### 3. Styling Approach
- Tailwind CSS utility classes
- Custom component wrapper for consistency
- Dark theme (slate-900) with accent colors

### 4. Performance Optimization
- Component-level memoization (React.memo where needed)
- Debounced refresh intervals (30-60 seconds)
- Optimistic updates for user interactions

---

## Testing Escalations

### Scenario 1: Test Automatic Escalation
```sql
-- Create a ticket with past deadline
INSERT INTO tickets (
  title, description, category, status,
  sla_deadline, ward_id, is_escalated
) VALUES (
  'Test Escalation',
  'This ticket should auto-escalate',
  'Infrastructure',
  'Open',
  NOW() - INTERVAL '2 hours',
  (SELECT id FROM wards LIMIT 1),
  false
);

-- Run escalation evaluation
-- Navigate to dashboard or call: evaluateEscalations()

-- Check results
SELECT * FROM tickets WHERE title = 'Test Escalation';
SELECT responsiveness_score FROM wards LIMIT 1;
```

### Scenario 2: Manual Escalation
- Open Ticket Tracker
- Click "Escalate" button on any ticket
- Verify ward score decreases by 5 points
- Check escalation_logs table

---

## Deployment Checklist

- [ ] Database: All tables created with RLS enabled
- [ ] Environment: `.env.local` configured with Supabase keys
- [ ] Components: All files in place (see structure above)
- [ ] Dependencies: `npm install` completed
- [ ] Auth: Supabase Auth users created
- [ ] Testing: Escalation logic verified
- [ ] UI: All pages display correctly
- [ ] Mobile: Responsive design tested
- [ ] Performance: Load times acceptable
- [ ] Security: No secrets in code/git

---

## Production Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables on Vercel
Settings → Environment Variables → Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Other Platforms
Works with Netlify, Railway, Render, AWS Amplify, etc.
Just set same environment variables.

---

## Support & Resources

- **Issue:** Check `.env.local` variables
- **Database:** Verify Supabase project is active
- **Components:** Ensure all imports are correct
- **Styling:** Use Tailwind Classes from examples
- **Docs:** https://supabase.com/docs, https://nextjs.org/docs

---

**You're all set! Happy building.** 🚀
