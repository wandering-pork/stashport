'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { useAuth } from '@/lib/auth/auth-context'

interface HeaderProps {
  isAuthenticated?: boolean
  userName?: string
}

export function Header({ isAuthenticated = false, userName = 'User' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-blue-600">✈️</div>
          <span className="text-xl font-bold hidden sm:inline">Stashport</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/itinerary/new" className="text-gray-700 hover:text-blue-600 transition-colors">
                Create Trip
              </Link>
              <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-700">{userName.split('@')[0]}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Button onClick={() => router.push('/auth/signup')}>
                Sign up
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <nav className="flex flex-col gap-2 p-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Dashboard
                </Link>
                <Link href="/itinerary/new" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Create Trip
                </Link>
                <Button
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Login
                </Link>
                <Button className="w-full" onClick={() => router.push('/auth/signup')}>
                  Sign up
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
