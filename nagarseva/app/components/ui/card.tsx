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
