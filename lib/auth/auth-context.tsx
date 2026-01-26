'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

// User profile from our users table
interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_color: string
}

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Timeout helper
const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Track if initial session has been processed to prevent double profile fetch
  const initialSessionProcessed = useRef(false)
  // Track last profile fetch to debounce rapid fetches
  const lastProfileFetch = useRef<{ userId: string; timestamp: number } | null>(null)

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  // Fetch user profile from our users table, create if doesn't exist
  // Includes debouncing to prevent rapid duplicate fetches
  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    // Debounce: skip if same user was fetched within last 500ms
    const now = Date.now()
    if (lastProfileFetch.current &&
        lastProfileFetch.current.userId === userId &&
        now - lastProfileFetch.current.timestamp < 500) {
      console.log('[Auth] Skipping duplicate profile fetch (debounced)')
      return profile // Return current profile instead of fetching again
    }
    lastProfileFetch.current = { userId, timestamp: now }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, display_name, avatar_color')
        .eq('id', userId)
        .single()

      if (error) {
        // PGRST116 means no rows found - create the profile
        if (error.code === 'PGRST116' && userEmail) {
          console.log('[Auth] Profile not found, creating new profile...')
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: userId,
              auth_id: userId,
              email: userEmail,
            })
            .select('id, email, display_name, avatar_color')
            .single()

          if (createError) {
            console.error('[Auth] Error creating profile:', createError)
            return null
          }
          console.log('[Auth] Profile created successfully')
          return newProfile as UserProfile
        }
        console.error('[Auth] Error fetching profile:', error)
        return null
      }
      return data as UserProfile
    } catch (err) {
      console.error('[Auth] Error fetching profile:', err)
      return null
    }
  }, [supabase, profile])

  // Refresh profile (can be called after profile updates)
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, user.email || undefined)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    // Get initial session with timeout to prevent infinite loading
    const getInitialSession = async () => {
      console.log('[Auth] Getting initial session...')
      try {
        // Add 5-second timeout to prevent hanging if Supabase is unresponsive
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          5000,
          { data: { session: null }, error: null }
        )

        const currentUser = sessionResult.data?.session?.user ?? null
        console.log('[Auth] Initial session result:', { hasUser: !!currentUser, userId: currentUser?.id })
        setUser(currentUser)

        // Fetch profile if user exists
        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id, currentUser.email || undefined)
          setProfile(profileData)
        }

        // Mark initial session as processed
        initialSessionProcessed.current = true
      } catch (error) {
        console.error('[Auth] Error getting session:', error)
        initialSessionProcessed.current = true
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', { event, hasUser: !!session?.user, userId: session?.user?.id })

      // Skip INITIAL_SESSION event if we've already processed initial session
      // This prevents double profile fetch on page load
      if (event === 'INITIAL_SESSION' && initialSessionProcessed.current) {
        console.log('[Auth] Skipping duplicate INITIAL_SESSION event')
        return
      }

      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Fetch profile on auth change (debouncing handled in fetchProfile)
      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id, currentUser.email || undefined)
        setProfile(profileData)
      } else {
        setProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [supabase, fetchProfile])

  const signOut = async () => {
    console.log('[Auth] Sign out initiated')
    try {
      // Call signOut with a timeout to prevent hanging
      console.log('[Auth] Calling supabase.auth.signOut...')
      const signOutPromise = supabase.auth.signOut()
      const timeoutPromise = new Promise<{ error: Error }>((resolve) =>
        setTimeout(() => resolve({ error: new Error('Sign out timeout') }), 5000)
      )

      const { error } = await Promise.race([signOutPromise, timeoutPromise])

      if (error) {
        if (error.message === 'Sign out timeout') {
          console.warn('[Auth] Sign out timed out, forcing local cleanup...')
        } else {
          console.error('[Auth] Sign out error:', error)
        }
        // Even on error/timeout, clear local state and force reload to ensure clean slate
        setUser(null)
        setProfile(null)
        // Force a full page reload to clear any cached auth state
        window.location.href = '/auth/login'
        return
      }

      console.log('[Auth] Sign out successful')
      // Clear local state after successful server signout
      setUser(null)
      setProfile(null)
    } catch (err) {
      console.error('[Auth] Sign out exception:', err)
      // On any error, still clear state and redirect
      setUser(null)
      setProfile(null)
      window.location.href = '/auth/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
