'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const firstError = result.error.issues[0]
      setError(firstError.message)
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError(null)
    setIsOAuthLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(`${provider} login failed. Please try again.`)
      console.error(`${provider} login error:`, err)
    } finally {
      setIsOAuthLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-mesh-editorial flex">
      {/* Left Column - Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 pattern-diagonal opacity-10" />

        {/* Grain Texture */}
        <div className="absolute inset-0 grain-overlay opacity-40" />

        {/* Decorative Shapes */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-400 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary-500 rounded-full opacity-15 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-white rounded-full opacity-40" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-accent-400 rounded-full opacity-60" />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-white rounded-full opacity-30" />

        {/* Content - Centered Vertical Layout */}
        <div className="relative z-10 flex flex-col justify-center items-start p-12 lg:p-16 w-full h-full">
          {/* Main Content - Centered */}
          <div className="animate-reveal-left max-w-sm">
            <h1 className="text-editorial-display text-5xl xl:text-6xl text-white mb-6 leading-[0.95]">
              Welcome
              <br />
              back,
              <br />
              <span className="text-primary-200">explorer</span>
            </h1>

            <div className="decorative-line w-20 mb-8 opacity-60" />

            <p className="text-lg text-primary-100 font-body leading-relaxed">
              Sign in to continue planning and sharing your adventures. Your journeys are waiting.
            </p>
          </div>

          {/* Quote - Positioned Absolute at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16 border-t border-white/20">
            <p className="text-sm text-primary-200 italic font-body leading-relaxed max-w-sm">
              "Travel isn't just about visiting new places, it's about discovering new perspectives."
            </p>
            <p className="text-xs text-primary-300 font-heading font-bold uppercase tracking-wider mt-3">
              — Stashport Community
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
              Welcome back
            </h1>
            <p className="text-neutral-600 font-body">
              Sign in to continue your journey
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-primary-600 mb-4 block">
              Sign In
            </span>
            <h2 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              Continue your journey
            </h2>
            <p className="text-neutral-600 font-body">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-error rounded-xl animate-shake-enhanced shadow-sm">
              <p className="text-error font-heading font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
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

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showErrorAnimation={!!error}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full font-heading font-bold shadow-coral hover:shadow-coral-lg"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
            <span className="text-xs font-heading font-bold text-neutral-400 uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="font-heading font-bold"
              onClick={() => handleOAuthLogin('google')}
              disabled={isOAuthLoading === 'google'}
              isLoading={isOAuthLoading === 'google'}
              hideTextWhileLoading
            >
              Google
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="font-heading font-bold"
              onClick={() => handleOAuthLogin('facebook')}
              disabled={isOAuthLoading === 'facebook'}
              isLoading={isOAuthLoading === 'facebook'}
              hideTextWhileLoading
            >
              Facebook
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <p className="text-center text-neutral-600 font-body">
              New to Stashport?{' '}
              <Link
                href="/auth/signup"
                className={cn(
                  'text-primary-600 font-heading font-bold',
                  'hover:text-primary-700 transition-colors duration-300',
                  'underline underline-offset-4 decoration-2 decoration-primary-200 hover:decoration-primary-400'
                )}
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
