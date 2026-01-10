'use client'

import { Header } from './header'
import { useAuth } from '@/lib/auth/auth-context'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user } = useAuth()
  const isAuthenticated = !!user

  return (
    <>
      <Header isAuthenticated={isAuthenticated} userName={user?.email || 'User'} />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}
