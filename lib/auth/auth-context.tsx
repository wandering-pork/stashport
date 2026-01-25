'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
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

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), [])

  // Fetch user profile from our users table, create if doesn't exist
  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
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
  }, [supabase])

  // Refresh profile (can be called after profile updates)
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, user.email || undefined)
      setProfile(profileData)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('[Auth] Getting initial session...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        console.log('[Auth] Initial session result:', { hasUser: !!currentUser, userId: currentUser?.id })
        setUser(currentUser)

        // Fetch profile if user exists
        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id, currentUser.email || undefined)
          setProfile(profileData)
        }
      } catch (error) {
        console.error('[Auth] Error getting session:', error)
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
      const currentUser = session?.user ?? null
      setUser(currentUser)

      // Fetch profile on auth change
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
      // Create a fresh client for sign out to avoid any stale state issues
      const freshClient = createClient()
      console.log('[Auth] Calling supabase.auth.signOut...')
      const { error } = await freshClient.auth.signOut()
      console.log('[Auth] supabase.auth.signOut returned')
      if (error) {
        console.error('[Auth] Sign out error:', error)
      } else {
        console.log('[Auth] Sign out successful')
      }
      setUser(null)
      setProfile(null)
    } catch (err) {
      console.error('[Auth] Sign out exception:', err)
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
