'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils/cn'

interface HeaderProps {
  isAuthenticated?: boolean
  userName?: string
}

/**
 * Production-grade Header/Navigation component with modern design system
 * Features: Sticky positioning, mobile-responsive, dropdown menu, smooth animations
 *
 * Design: Cream background with subtle border, bold Playfair logo, Space Grotesk nav
 * Desktop: Horizontal navigation with underline hover effects
 * Mobile: Slide-in sidebar menu with smooth animation
 * User Menu: Dropdown with fade-in animation
 */
export function Header({ isAuthenticated = false, userName = 'User' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { signOut } = useAuth()

  // Track scroll position for header background
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu when clicking outside and handle Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
    router.push('/')
  }

  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        'border-b',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-neutral-200 shadow-sm'
          : 'bg-white border-neutral-200/80'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Logo - Bold Playfair Display */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300"
        >
          <span className="text-2xl">✈️</span>
          <span className="text-2xl font-display font-bold hidden sm:inline text-primary-600">
            Stashport
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-end gap-8 h-full">
          {isAuthenticated ? (
            <>
              {/* Nav Items */}
              <Link
                href="/dashboard"
                className={cn(
                  'text-sm font-heading font-bold uppercase',
                  'text-neutral-700 hover:text-primary-600',
                  'transition-colors duration-300 h-full flex items-center',
                  'relative pb-1',
                  'hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0',
                  'hover:after:h-0.5 hover:after:bg-primary-500 hover:after:transition-all'
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/itinerary/new"
                className={cn(
                  'text-sm font-heading font-bold uppercase',
                  'text-neutral-700 hover:text-primary-600',
                  'transition-colors duration-300 h-full flex items-center',
                  'relative pb-1',
                  'hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:right-0',
                  'hover:after:h-0.5 hover:after:bg-primary-500 hover:after:transition-all'
                )}
              >
                Create Trip
              </Link>

              {/* User Menu Dropdown */}
              <div className="flex items-center gap-4 pl-6 border-l border-neutral-200 relative h-full" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    'flex items-center gap-3',
                    'hover:opacity-80 transition-opacity duration-300'
                  )}
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 hover:scale-105 transition-transform duration-300">
                    <span className="text-sm font-heading font-bold text-primary-600">
                      {userInitial}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-neutral-600',
                      'transition-transform duration-300',
                      isUserMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-12 right-0 w-72 bg-white border border-neutral-200 rounded-xl shadow-dramatic animate-fade-in overflow-hidden z-40">
                    <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
                      <p className="text-sm font-heading font-bold text-neutral-900 truncate">
                        {userName.split('@')[0]}
                      </p>
                      <p className="text-xs text-neutral-600 truncate mt-1">{userName}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={handleSignOut}
                        className={cn(
                          'w-full text-left px-5 py-3 text-sm text-neutral-700',
                          'hover:bg-neutral-100 transition-colors duration-200',
                          'font-body rounded-none',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400'
                        )}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(
                  'text-sm font-heading font-bold uppercase',
                  'text-neutral-700 hover:text-primary-600',
                  'transition-colors duration-300 h-full flex items-center'
                )}
              >
                Login
              </Link>
              <div className="h-full flex items-center">
                <Button size="md" onClick={() => router.push('/auth/signup')}>
                  Sign up
                </Button>
              </div>
            </>
          )}
        </nav>

        {/* Mobile Menu Button - Minimum 44x44px touch target */}
        <button
          className={cn(
            'md:hidden p-2.5 rounded-lg transition-all duration-300',
            'hover:bg-neutral-100 active:bg-neutral-200',
            'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            'min-h-[44px] min-w-[44px] flex items-center justify-center'
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-neutral-700" aria-hidden="true" />
          ) : (
            <Menu className="w-6 h-6 text-neutral-700" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Navigation - Slide-in Sidebar */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/20 md:hidden animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Mobile Menu */}
          <nav className="md:hidden border-t border-neutral-200 bg-white animate-slide-in-down">
            <div className="flex flex-col gap-2 p-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      'px-4 py-4 text-neutral-700 font-heading font-bold uppercase text-sm',
                      'hover:bg-neutral-100 active:bg-neutral-200 rounded-lg transition-colors duration-200',
                      'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                      'min-h-[44px] flex items-center'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/itinerary/new"
                    className={cn(
                      'px-4 py-4 text-neutral-700 font-heading font-bold uppercase text-sm',
                      'hover:bg-neutral-100 active:bg-neutral-200 rounded-lg transition-colors duration-200',
                      'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                      'min-h-[44px] flex items-center'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Trip
                  </Link>
                  <div className="px-4 py-3 border-t border-neutral-200">
                    <p className="text-xs font-heading font-bold text-neutral-600 mb-3">
                      {userName.split('@')[0]}
                    </p>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className={cn(
                      'px-4 py-4 text-neutral-700 font-heading font-bold uppercase text-sm',
                      'hover:bg-neutral-100 active:bg-neutral-200 rounded-lg transition-colors duration-200',
                      'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                      'min-h-[44px] flex items-center'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Button
                    className="w-full mt-2"
                    onClick={() => {
                      router.push('/auth/signup')
                      setIsMenuOpen(false)
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
