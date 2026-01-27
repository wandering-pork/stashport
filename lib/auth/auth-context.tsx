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
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<UserProfile | null> => {
    // Debounce: skip if same user was fetched within last 500ms
    const now = Date.now()
    if (lastProfileFetch.current &&
        lastProfileFetch.current.userId === userId &&
        now - lastProfileFetch.current.timestamp < 500) {
      return null // Signal that fetch was skipped; caller should use existing state
    }
    lastProfileFetch.current = { userId, timestamp: now }

    // Create a timeout promise to prevent hanging forever
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Profile fetch timeout after 10s')), 10000)
    })

    try {
      const fetchPromise = (async () => {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, display_name, avatar_color')
          .eq('id', userId)
          .single()

        if (error) {
          // PGRST116 means no rows found - create the profile
          if (error.code === 'PGRST116' && userEmail) {
            console.log('[Auth] Creating profile for new user')
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
            return newProfile as UserProfile
          }
          console.error('[Auth] Error fetching profile:', error)
          return null
        }
        return data as UserProfile
      })()

      // Race between fetch and timeout
      return await Promise.race([fetchPromise, timeoutPromise])
    } catch (err) {
      console.error('[Auth] Error fetching profile:', err)
      return null
    }
  }, [supabase])

  // Refresh profile (can be called after profile updates)
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, user.email || undefined)
      if (profileData !== null) {
        setProfile(profileData)
      }
    }
  }, [user, fetchProfile])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[Auth] Session error:', sessionError)
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Fetch profile if user exists
        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id, currentUser.email || undefined)
          if (profileData !== null) {
            setProfile(profileData)
          }
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
      // Skip INITIAL_SESSION event if we've already processed initial session
      // This prevents double profile fetch on page load
      if (event === 'INITIAL_SESSION' && initialSessionProcessed.current) {
        return
      }

      // For SIGNED_IN event, let getInitialSession handle it to prevent race conditions
      if (event === 'SIGNED_IN' && !initialSessionProcessed.current) {
        return
      }

      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Fetch profile on auth change (debouncing handled in fetchProfile)
      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id, currentUser.email || undefined)
        if (profileData !== null) {
          setProfile(profileData)
        }
      } else {
        setProfile(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [supabase, fetchProfile])

  const signOut = async () => {
    console.log('[Auth] Sign out initiated')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] Sign out error:', error)
        // Even on error, clear local state and redirect
        setUser(null)
        setProfile(null)
        window.location.href = '/auth/login'
        return
      }

      console.log('[Auth] Sign out successful')
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
