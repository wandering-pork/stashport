'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Auth Callback Page
 *
 * This page handles email verification (token_hash) only.
 * OAuth callbacks are handled by route.ts (server-side).
 *
 * When users click email confirmation links, they arrive here with token_hash.
 * OAuth flows redirect to route.ts which handles code exchange server-side.
 */
function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [statusMessage, setStatusMessage] = useState('Verifying your account...')
  const hasStarted = useRef(false)

  useEffect(() => {
    // Prevent double execution from React Strict Mode
    if (hasStarted.current) return
    hasStarted.current = true

    const handleEmailVerification = async () => {
      const supabase = createClient()
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      console.log('[Auth Callback Page] Processing', { tokenHash: !!tokenHash, type, errorParam })

      // Handle error from Supabase/OAuth provider
      if (errorParam) {
        console.error('[Auth Callback Page] Error from provider:', errorParam, errorDescription)
        setError(errorDescription || 'Authentication failed')
        setIsProcessing(false)
        return
      }

      // Handle email verification (token_hash flow)
      if (tokenHash && type) {
        try {
          setStatusMessage('Confirming your email...')
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'email' | 'signup' | 'recovery' | 'email_change',
          })

          if (verifyError) {
            console.error('[Auth Callback Page] Token verification error:', verifyError)
            setError(verifyError.message)
            setIsProcessing(false)
            return
          }

          // Create user profile if needed
          if (data.user && data.user.email) {
            setStatusMessage('Setting up your account...')
            console.log('[Auth Callback Page] Ensuring user profile exists...')

            const { error: upsertError } = await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                auth_id: data.user.id,
                email: data.user.email,
              }, {
                onConflict: 'id',
                ignoreDuplicates: true
              })

            if (upsertError && !upsertError.message.includes('duplicate')) {
              console.error('[Auth Callback Page] Error creating user profile:', upsertError)
              // Continue anyway - auth is successful
            }
          }

          console.log('[Auth Callback Page] Email verification successful, redirecting...')
          window.location.href = '/dashboard'
          return
        } catch (err: any) {
          console.error('[Auth Callback Page] Unexpected error:', err)
          setError('An unexpected error occurred during verification')
          setIsProcessing(false)
          return
        }
      }

      // No token_hash - check if user is already authenticated
      // (This handles edge cases where user lands here without parameters)
      console.log('[Auth Callback Page] No token_hash, checking existing session...')
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          console.log('[Auth Callback Page] Already authenticated, redirecting...')
          window.location.href = '/dashboard'
          return
        }
      } catch (err) {
        console.error('[Auth Callback Page] Error checking session:', err)
      }

      // No valid parameters and not authenticated
      setError('No verification token provided')
      setIsProcessing(false)
    }

    handleEmailVerification()
  }, [searchParams])

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
