# NagarSeva - Component Code Snippets (Copy & Paste Ready)

## 🎯 How to Use This File

Each section below is a complete, ready-to-copy component. 
Find the component you need and paste it into the corresponding file path shown in the comment.

---

## 1️⃣ TicketTimer Component
**File:** `app/components/TicketTimer.tsx`

```typescript
'use client'

import { useCountdownTimer } from '@/app/hooks/useCountdownTimer'
import { Clock, AlertCircle } from 'lucide-react'

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
    <div className={`${getTimeBg()} border rounded-lg px-4 py-3 flex items-center gap-3 flex-1`}>
      <Clock className={`w-5 h-5 ${getTimeColor()} flex-shrink-0`} />
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

---

## 2️⃣ Navbar Component
**File:** `app/components/Navbar.tsx`

```typescript
'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, User, Home } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-10 bg-slate-700/50 rounded animate-pulse"></div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">NS</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">NagarSeva</h1>
              <p className="text-xs text-slate-400">AI Citizen Advocate</p>
            </div>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-slate-200 truncate max-w-xs">{user.email}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm font-medium group"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition" />
                  <span className="hidden sm:inline">Logout</span>
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

---

## 3️⃣ Card Component (Reusable)
**File:** `app/components/ui/card.tsx`

```typescript
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className = '', onClick, hover = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6
        ${hover ? 'hover:border-slate-600/50 hover:bg-slate-800/70 transition cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-lg font-semibold text-white">{children}</h3>
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="flex gap-2 pt-4 border-t border-slate-700/50 mt-4">{children}</div>
}
```

---

## 4️⃣ Badge Component (Reusable)
**File:** `app/components/ui/badge.tsx`

```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-700 text-slate-200 border border-slate-600',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    error: 'bg-red-500/20 text-red-300 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`inline-block rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}
```

---

## 5️⃣ Stat Card Component
**File:** `app/components/StatCard.tsx`

```typescript
'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'emerald' | 'red' | 'amber'
}

export default function StatCard({
  title,
  value,
  icon,
  trend = 'neutral',
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    red: 'bg-red-500/10 border-red-500/30 text-red-500',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        {icon && <div className={`${colorClasses[color]}`}>{icon}</div>}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend !== 'neutral' && (
          <p className={`text-xs ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {trend === 'up' ? 'Improved' : 'Declined'} vs last month
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## 6️⃣ Loading Skeleton
**File:** `app/components/SkeletonLoader.tsx`

```typescript
export function SkeletonLoader({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6"></div>
          </div>
          <div className="h-10 bg-slate-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  )
}
```

---

## 7️⃣ Error Boundary
**File:** `app/components/ErrorBoundary.tsx`

```typescript
'use client'

import { ReactNode, useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-200 mb-1">Error</h3>
          <p className="text-sm text-red-100 mb-4">{error.message}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded transition text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

---

## 8️⃣ Empty State Component
**File:** `app/components/EmptyState.tsx`

```typescript
import { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({
  title,
  description,
  icon = <AlertCircle className="w-12 h-12 text-slate-600" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 mb-6 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
```

---

## 9️⃣ Filter/Search Bar
**File:** `app/components/SearchBar.tsx`

```typescript
'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onSearch(e.target.value)
        }}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
      />
      {query && (
        <button
          onClick={() => {
            setQuery('')
            onSearch('')
          }}
          className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
```

---

## 🔟 Modal/Dialog (Simple)
**File:** `app/components/Modal.tsx`

```typescript
'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex gap-2 px-6 pb-6 border-t border-slate-700 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## ✨ Tips for Using These Components

1. **Import Pattern:**
   ```typescript
   import TicketTimer from '@/app/components/TicketTimer'
   import { Card, CardHeader, CardTitle } from '@/app/components/ui/card'
   import { Badge } from '@/app/components/ui/badge'
   ```

2. **Styling Consistency:**
   - All use Tailwind utilities
   - Dark theme: slate-900/800 background
   - Borders: slate-700 color
   - Text: slate-200 for white text
   - Accents: emerald (green), amber (yellow), red

3. **Customization:**
   - Update color values in className if needed
   - Extend with additional variants
   - Combine components for complex layouts

4. **Responsiveness:**
   - All components use responsive Tailwind classes
   - Mobile-first approach
   - Test on various screen sizes

---

**Need more components?** Extend these as templates for:
- Pagination
- Breadcrumbs
- Tooltips
- Dropdowns
- Alerts
- Forms
- Tables
- Carousels

---

**Happy coding!** 🎨🚀
