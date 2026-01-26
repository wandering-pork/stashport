'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  // Map error codes to user-friendly messages
  const getErrorMessage = () => {
    switch (error) {
      case 'access_denied':
        return 'Access was denied. You may have cancelled the sign-in process.'
      case 'server_error':
        return 'The authentication server is temporarily unavailable.'
      case 'no_code':
        return 'No authentication code was provided.'
      case 'exchange_failed':
        return message || 'Failed to complete the sign-in process.'
      case 'no_user':
        return 'Unable to retrieve your account information.'
      case 'unexpected':
        return 'An unexpected error occurred during authentication.'
      default:
        return message || 'Something went wrong during sign-in.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-editorial px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-3">
            Authentication Failed
          </h1>

          {/* Error Message */}
          <p className="text-neutral-600 mb-8">
            {getErrorMessage()}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-secondary-600 hover:bg-secondary-700 text-white font-heading font-bold rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-heading font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-sm text-neutral-500 mt-8">
            If this problem persists, try clearing your browser cookies or using a different browser.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh-editorial">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600 mx-auto mb-4" />
        <p className="text-neutral-600">Loading...</p>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthErrorContent />
    </Suspense>
  )
}
