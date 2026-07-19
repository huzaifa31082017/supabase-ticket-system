import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DbInitializer from '@/app/components/DbInitializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NagarSeva - AI Citizen Advocate',
  description: 'Track and escalate civic complaints with real-time SLA monitoring',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90" font-weight="bold" fill="%233B82F6">N</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <DbInitializer />
        {children}
      </body>
    </html>
  )
}

    </html>
  )
}

