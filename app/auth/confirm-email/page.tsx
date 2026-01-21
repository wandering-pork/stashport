'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const supabase = createClient()

  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleResendEmail = async () => {
    if (!email) {
      setErrorMessage('No email address provided')
      setResendStatus('error')
      return
    }

    setIsResending(true)
    setResendStatus('idle')
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setResendStatus('error')
      } else {
        setResendStatus('success')
      }
    } catch (err) {
      setErrorMessage('Failed to resend email. Please try again.')
      setResendStatus('error')
      console.error('Resend error:', err)
    } finally {
      setIsResending(false)
    }
  }

  const tips = [
    { text: 'Check your spam or junk folder', icon: AlertCircle },
    { text: 'Email usually arrives within 2 minutes', icon: Mail },
    { text: 'Make sure the email address is correct', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-mesh-editorial flex">
      {/* Left Column - Brand Panel (Teal Theme - matches signup) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Gradient Background - Teal */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-800" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 pattern-dots opacity-10" />

        {/* Grain Texture */}
        <div className="absolute inset-0 grain-overlay opacity-40" />

        {/* Decorative Shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-secondary-400 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-primary-500 rounded-full opacity-15 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full opacity-40" />
        <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-accent-400 rounded-full opacity-60" />
        <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-white rounded-full opacity-30" />

        {/* Content - Centered Vertical Layout */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 lg:p-16 w-full h-full">
          {/* Main Content - Centered */}
          <div className="animate-reveal-left max-w-sm">
            {/* Large Mail Icon */}
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
              <Mail className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-editorial-display text-5xl xl:text-6xl text-white mb-6 leading-[0.95]">
              Almost
              <br />
              <span className="text-secondary-200">there!</span>
            </h1>

            <div className="w-20 h-1 bg-gradient-to-r from-secondary-300 to-accent-400 rounded-full mb-8" />

            <p className="text-lg text-secondary-100 font-body leading-relaxed">
              We've sent a confirmation link to your email. Click it to activate your account and start your journey.
            </p>
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 p-12 lg:p-16">
            <p className="text-sm text-secondary-200 italic font-body leading-relaxed max-w-sm">
              "The journey of a thousand miles begins with a single step."
            </p>
            <p className="text-xs text-secondary-300 font-heading font-bold uppercase tracking-wider mt-3">
              — Lao Tzu
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Content */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 md:px-12 py-20 lg:py-0">
        <div className="w-full max-w-md animate-reveal-up">
          {/* Mobile Heading */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✈️</span>
              <span className="text-xl font-display font-bold text-secondary-600">Stashport</span>
            </div>
          </div>

          {/* Desktop Heading */}
          <div className="mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-secondary-600 mb-4 block">
              Verify Your Email
            </span>
            <h2 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              Check your inbox
            </h2>
            <p className="text-neutral-600 font-body">
              We've sent a confirmation email to:
            </p>
          </div>

          {/* Email Display */}
          <div className="mb-8 p-4 bg-secondary-50 border-2 border-secondary-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-secondary-600" />
              </div>
              <span className="font-heading font-bold text-neutral-900 break-all">
                {email || 'your email address'}
              </span>
            </div>
          </div>

          {/* Status Messages */}
          {resendStatus === 'success' && (
            <div role="alert" aria-live="polite" className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                <p className="text-green-700 font-heading font-bold text-sm">
                  Confirmation email sent! Check your inbox.
                </p>
              </div>
            </div>
          )}

          {resendStatus === 'error' && errorMessage && (
            <div role="alert" aria-live="assertive" className="mb-6 p-4 bg-red-50 border-2 border-error rounded-xl animate-shake-enhanced">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0" aria-hidden="true" />
                <p className="text-error font-heading font-bold text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="mb-8 space-y-3">
            <p className="text-sm font-heading font-bold text-neutral-700 uppercase tracking-wider">
              Didn't receive it?
            </p>
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-neutral-600"
              >
                <tip.icon className="w-4 h-4 text-secondary-500 flex-shrink-0" />
                <span className="text-sm font-body">{tip.text}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              type="button"
              size="lg"
              className="w-full font-heading font-bold shadow-teal hover:shadow-teal-lg bg-secondary-600 hover:bg-secondary-700"
              onClick={handleResendEmail}
              isLoading={isResending}
              disabled={!email}
            >
              <RefreshCw className={cn('w-5 h-5 mr-2', isResending && 'animate-spin')} />
              Resend Confirmation Email
            </Button>

            <Link href="/auth/login" className="block">
              <Button
                type="button"
                variant="tertiary"
                size="lg"
                className="w-full font-heading font-bold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <p className="text-center text-neutral-600 font-body text-sm">
              Wrong email?{' '}
              <Link
                href="/auth/signup"
                className={cn(
                  'text-secondary-600 font-heading font-bold',
                  'hover:text-secondary-700 transition-colors duration-300',
                  'underline underline-offset-4 decoration-2 decoration-secondary-200 hover:decoration-secondary-400'
                )}
              >
                Sign up again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mesh-editorial flex items-center justify-center">
        <div className="animate-pulse text-secondary-600">Loading...</div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
}
