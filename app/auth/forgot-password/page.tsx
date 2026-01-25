'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = emailSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Password reset error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mesh-editorial flex">
      {/* Left Column - Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-800" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 pattern-diagonal opacity-10" />

        {/* Grain Texture */}
        <div className="absolute inset-0 grain-overlay opacity-40" />

        {/* Decorative Shapes */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-secondary-400 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary-500 rounded-full opacity-15 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 lg:p-16 w-full h-full">
          <div className="animate-reveal-left max-w-sm">
            <h1 className="text-editorial-display text-5xl xl:text-6xl text-white mb-6 leading-[0.95]">
              Forgot your
              <br />
              <span className="text-secondary-200">password?</span>
            </h1>

            <div className="decorative-line w-20 mb-8 opacity-60" />

            <p className="text-lg text-secondary-100 font-body leading-relaxed">
              No worries! Enter your email and we'll send you a link to reset your password.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 md:px-12 py-20 lg:py-0">
        <div className="w-full max-w-md animate-reveal-up">
          {/* Back Link */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 font-heading font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {/* Mobile Heading */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✈️</span>
              <span className="text-xl font-display font-bold text-primary-600">Stashport</span>
            </div>
            <h1 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              Reset password
            </h1>
            <p className="text-neutral-600 font-body">
              Enter your email to receive a reset link
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-secondary-600 mb-4 block">
              Password Reset
            </span>
            <h2 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              Reset your password
            </h2>
            <p className="text-neutral-600 font-body">
              We'll send you a link to reset your password
            </p>
          </div>

          {isSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
                Check your email
              </h3>
              <p className="text-neutral-600 font-body mb-6">
                We've sent a password reset link to{' '}
                <span className="font-heading font-bold text-neutral-900">{email}</span>
              </p>
              <p className="text-sm text-neutral-500 font-body">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-primary-600 hover:text-primary-700 font-heading font-medium"
                >
                  try again
                </button>
              </p>
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
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  showErrorAnimation={!!error}
                  required
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-heading font-bold shadow-teal hover:shadow-teal-lg"
                  isLoading={isLoading}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Reset Link
                </Button>
              </form>
            </>
          )}

          {/* Sign Up Link */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <p className="text-center text-neutral-600 font-body">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className={cn(
                  'text-primary-600 font-heading font-bold',
                  'hover:text-primary-700 transition-colors duration-300',
                  'underline underline-offset-4 decoration-2 decoration-primary-200 hover:decoration-primary-400'
                )}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
