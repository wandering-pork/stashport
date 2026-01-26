'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [statusMessage, setStatusMessage] = useState('Verifying your account...')

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      console.log('[Auth Callback] Starting callback processing', { code: !!code, tokenHash: !!tokenHash, type, errorParam })

      // Handle error from Supabase/OAuth provider
      if (errorParam) {
        console.error('[Auth Callback] Error from provider:', errorParam, errorDescription)
        // Translate common OAuth errors to user-friendly messages
        let userMessage = errorDescription || 'Authentication failed'
        if (errorParam === 'access_denied') {
          userMessage = 'Access was denied. Please try again.'
        } else if (errorParam === 'server_error') {
          userMessage = 'The authentication server is temporarily unavailable. Please try again.'
        }
        setError(userMessage)
        setIsProcessing(false)
        return
      }

      // Helper function to create/update user profile
      const ensureUserProfile = async (userId: string, email: string): Promise<boolean> => {
        try {
          console.log('[Auth Callback] Ensuring user profile exists...')
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: userId,
              auth_id: userId,
              email: email,
            }, {
              onConflict: 'id',
              ignoreDuplicates: true
            })

          if (upsertError && !upsertError.message.includes('duplicate')) {
            console.error('[Auth Callback] Error creating user profile:', upsertError)
            return false
          }
          console.log('[Auth Callback] User profile ready')
          return true
        } catch (profileErr) {
          console.error('[Auth Callback] Profile upsert exception:', profileErr)
          return false
        }
      }

      // Method 1: Token hash verification (for email confirmation)
      // This works even if user clicks link in different browser
      if (tokenHash && type) {
        try {
          setStatusMessage('Confirming your email...')
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'email' | 'signup' | 'recovery' | 'email_change',
          })

          if (verifyError) {
            console.error('[Auth Callback] Token verification error:', verifyError)
            setError(verifyError.message)
            setIsProcessing(false)
            return
          }

          if (data.user && data.user.email) {
            setStatusMessage('Setting up your account...')
            await ensureUserProfile(data.user.id, data.user.email)
          }

          console.log('[Auth Callback] Token verification successful, redirecting to dashboard...')
          window.location.href = '/dashboard'
          return
        } catch (err) {
          console.error('[Auth Callback] Unexpected error during token verification:', err)
          setError('An unexpected error occurred during verification')
          setIsProcessing(false)
          return
        }
      }

      // Method 2: Code exchange (for OAuth - requires same browser session)
      if (code) {
        try {
          setStatusMessage('Completing sign in...')
          console.log('[Auth Callback] Exchanging code for session...')

          // Show "taking longer than expected" after 5 seconds
          const slowTimer = setTimeout(() => {
            setStatusMessage('Taking longer than expected...')
          }, 5000)

          // Single 12-second timeout for the entire operation
          const exchangePromise = supabase.auth.exchangeCodeForSession(code)
          const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error('timeout') }), 12000)
          )

          const { data, error: exchangeError } = await Promise.race([exchangePromise, timeoutPromise])
          clearTimeout(slowTimer)

          // Handle timeout
          if (exchangeError?.message === 'timeout') {
            console.log('[Auth Callback] Code exchange timed out, checking if authenticated...')
            setStatusMessage('Checking authentication status...')

            // Quick check if session was actually created
            const { data: { user: currentUser } } = await supabase.auth.getUser()

            if (currentUser) {
              console.log('[Auth Callback] User authenticated despite timeout')
              if (currentUser.email) {
                await ensureUserProfile(currentUser.id, currentUser.email)
              }
              window.location.href = '/dashboard'
              return
            }

            // Auth truly failed
            setError('Authentication timed out. Please try again.')
            setIsProcessing(false)
            return
          }

          console.log('[Auth Callback] exchangeCodeForSession result:', {
            hasUser: !!data?.user,
            userId: data?.user?.id,
            hasSession: !!data?.session,
            error: exchangeError?.message
          })

          if (exchangeError) {
            console.error('[Auth Callback] Code exchange error:', exchangeError)
            // Translate common errors to user-friendly messages
            if (exchangeError.message.includes('PKCE') || exchangeError.message.includes('code verifier')) {
              setError('Your session expired. Please sign in again using the same browser.')
            } else if (exchangeError.message.includes('invalid_grant')) {
              setError('This sign-in link has expired. Please try again.')
            } else {
              setError(exchangeError.message)
            }
            setIsProcessing(false)
            return
          }

          // Create user profile - AWAIT this before redirecting
          if (data?.user && data.user.email) {
            setStatusMessage('Setting up your account...')
            await ensureUserProfile(data.user.id, data.user.email)
          }

          // Success - redirect to dashboard
          console.log('[Auth Callback] Code exchange successful, redirecting to dashboard...')
          window.location.href = '/dashboard'
          return
        } catch (err) {
          console.error('[Auth Callback] Unexpected error during code exchange:', err)
          setError('An unexpected error occurred during authentication')
          setIsProcessing(false)
          return
        }
      }

      // No code parameter - check if we're already authenticated
      console.log('[Auth Callback] No code/token_hash, checking existing session...')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('[Auth Callback] Already authenticated, redirecting to dashboard...')
        window.location.href = '/dashboard'
        return
      }

      // No code and not authenticated
      setError('No authentication code provided')
      setIsProcessing(false)
    }

    handleCallback()
  }, [searchParams, router])

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-editorial">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto mb-4" />
          <h1 className="text-xl font-heading font-bold text-neutral-900">
            {statusMessage}
          </h1>
          <p className="text-neutral-600 mt-2">Please wait, this should only take a moment.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh-editorial px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-neutral-600 mb-6">{error}</p>
            <div className="space-y-3">
              <a
                href="/auth/signup"
                className="block w-full py-3 px-4 bg-secondary-600 hover:bg-secondary-700 text-white font-heading font-bold rounded-xl transition-colors"
              >
                Try Signing Up Again
              </a>
              <a
                href="/auth/login"
                className="block w-full py-3 px-4 border-2 border-secondary-600 text-secondary-600 hover:bg-secondary-50 font-heading font-bold rounded-xl transition-colors"
              >
                Go to Login
              </a>
            </div>
            <p className="text-sm text-neutral-500 mt-6">
              The confirmation link may have expired or was already used.
              Please try signing up again to receive a new confirmation email.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-editorial">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto mb-4" />
        <h1 className="text-xl font-heading font-bold text-neutral-900">
          Loading...
        </h1>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
