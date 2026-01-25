'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowRight, CheckCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { z } from 'zod'

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      // User should have a session from the recovery link
      setIsValidSession(!!session)
    }
    checkSession()
  }, [supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = passwordSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Password update error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-mesh-editorial flex items-center justify-center">
        <div className="animate-pulse text-neutral-500 font-body">Loading...</div>
      </div>
    )
  }

  // Invalid or expired session
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-mesh-editorial flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-reveal-up">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-neutral-900 mb-3">
            Invalid or Expired Link
          </h1>
          <p className="text-neutral-600 font-body mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button onClick={() => router.push('/auth/forgot-password')}>
            Request New Link
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh-editorial flex">
      {/* Left Column - Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-800" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 pattern-diagonal opacity-10" />

        {/* Grain Texture */}
        <div className="absolute inset-0 grain-overlay opacity-40" />

        {/* Decorative Shapes */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-400 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary-500 rounded-full opacity-15 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 lg:p-16 w-full h-full">
          <div className="animate-reveal-left max-w-sm">
            <h1 className="text-editorial-display text-5xl xl:text-6xl text-white mb-6 leading-[0.95]">
              Create a
              <br />
              <span className="text-accent-200">new password</span>
            </h1>

            <div className="decorative-line w-20 mb-8 opacity-60" />

            <p className="text-lg text-accent-100 font-body leading-relaxed">
              Choose a strong password to keep your account secure.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 md:px-12 py-20 lg:py-0">
        <div className="w-full max-w-md animate-reveal-up">
          {/* Mobile Heading */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✈️</span>
              <span className="text-xl font-display font-bold text-primary-600">Stashport</span>
            </div>
            <h1 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              New password
            </h1>
            <p className="text-neutral-600 font-body">
              Enter your new password below
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-accent-600 mb-4 block">
              Reset Password
            </span>
            <h2 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              Set new password
            </h2>
            <p className="text-neutral-600 font-body">
              Your new password must be at least 8 characters
            </p>
          </div>

          {isSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
                Password updated!
              </h3>
              <p className="text-neutral-600 font-body mb-6">
                Your password has been successfully updated. Redirecting you to login...
              </p>
              <Link href="/auth/login">
                <Button variant="secondary">
                  Go to Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-error rounded-xl animate-shake-enhanced shadow-sm">
                  <p className="text-error font-heading font-bold text-sm">{error}</p>
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showErrorAnimation={!!error}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showErrorAnimation={!!error}
                  required
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-heading font-bold shadow-golden hover:shadow-golden-lg"
                  isLoading={isLoading}
                >
                  Update Password
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
