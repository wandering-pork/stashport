'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Handle error from Supabase
      if (errorParam) {
        console.error('Auth callback error:', errorParam, errorDescription)
        setError(errorDescription || 'Authentication failed')
        setIsProcessing(false)
        return
      }

      // Method 1: Token hash verification (recommended for email confirmation)
      // This works even if user clicks link in different browser
      if (tokenHash && type) {
        try {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'email' | 'signup' | 'recovery' | 'email_change',
          })

          if (verifyError) {
            console.error('Token verification error:', verifyError)
            setError(verifyError.message)
            setIsProcessing(false)
            return
          }

          if (data.user) {
            // Create user profile record if needed
            try {
              await supabase
                .from('users')
                .upsert({
                  id: data.user.id,
                  auth_id: data.user.id,
                  email: data.user.email!,
                }, {
                  onConflict: 'id',
                  ignoreDuplicates: true
                })
            } catch {
              // User record might already exist
            }
          }

          router.push('/dashboard')
          return
        } catch (err) {
          console.error('Unexpected error during token verification:', err)
          setError('An unexpected error occurred during verification')
          setIsProcessing(false)
          return
        }
      }

      // Method 2: Code exchange (for OAuth and PKCE flow - requires same browser session)
      if (code) {
        try {
          // Exchange code for session - client-side has access to PKCE verifier
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            // Provide more helpful error message for PKCE issues
            if (exchangeError.message.includes('PKCE') || exchangeError.message.includes('code verifier')) {
              setError('Session expired. Please sign up again using the same browser.')
            } else {
              setError(exchangeError.message)
            }
            setIsProcessing(false)
            return
          }

          // Create user profile record if needed
          if (data.user && data.user.email) {
            try {
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
                console.error('Error creating user profile:', upsertError)
              }
            } catch {
              // User record might already exist, which is fine
            }
          }

          // Success - redirect to dashboard
          router.push('/dashboard')
          return
        } catch (err) {
          console.error('Unexpected error during code exchange:', err)
          setError('An unexpected error occurred during authentication')
          setIsProcessing(false)
          return
        }
      }

      // No code parameter - check if we're already authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
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
            Verifying your account...
          </h1>
          <p className="text-neutral-600 mt-2">Please wait while we confirm your email.</p>
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
