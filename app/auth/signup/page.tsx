'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { signupSchema } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = signupSchema.safeParse({ email, password, confirmPassword })
    if (!result.success) {
      const firstError = result.error.issues[0]
      setError(firstError.message)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // Create user profile record
      if (data.user && data.user.email) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            auth_id: data.user.id,
            email: data.user.email,
          })

        if (userError) {
          console.error('Error creating user profile:', userError)
          // Continue anyway - user is authenticated
        }
      }

      // Redirect to confirmation page with email
      router.push(`/auth/confirm-email?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'facebook') => {
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
      setError(`${provider} signup failed. Please try again.`)
      console.error(`${provider} signup error:`, err)
    } finally {
      setIsOAuthLoading(null)
    }
  }

  const features = [
    'Create beautiful day-by-day itineraries',
    'Share your trips with the world',
    'Discover journeys from travelers',
    'Save and customize any trip',
  ]

  return (
    <div className="min-h-screen bg-mesh-editorial flex">
      {/* Left Column - Brand Panel (Teal Theme) */}
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
            <h1 className="text-editorial-display text-5xl xl:text-6xl text-white mb-6 leading-[0.95]">
              Start your
              <br />
              <span className="text-secondary-200">journey</span>
              <br />
              today
            </h1>

            <div className="w-20 h-1 bg-gradient-to-r from-secondary-300 to-accent-400 rounded-full mb-8" />

            <p className="text-lg text-secondary-100 font-body leading-relaxed mb-10">
              Join thousands of travel creators planning adventures and sharing inspiration.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-reveal-left"
                  style={{ animationDelay: `${200 + i * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm text-secondary-100 font-body">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspirational Quote - Positioned Absolute at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 p-12 lg:p-16">
            <p className="text-sm text-secondary-200 italic font-body leading-relaxed max-w-sm">
              "Travel isn't just about visiting new places, it's about discovering new perspectives."
            </p>
            <p className="text-xs text-secondary-300 font-heading font-bold uppercase tracking-wider mt-3">
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
              <span className="text-xl font-display font-bold text-secondary-600">Stashport</span>
            </div>
            <h1 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              Join Stashport
            </h1>
            <p className="text-neutral-600 font-body">
              Create your free account
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-10">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-secondary-600 mb-4 block">
              Create Account
            </span>
            <h2 className="text-editorial-headline text-4xl text-neutral-900 mb-3">
              Begin your adventure
            </h2>
            <p className="text-neutral-600 font-body">
              Create an account to start planning your journeys
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-error rounded-xl animate-shake-enhanced shadow-sm">
              <p className="text-error font-heading font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Signup Form */}
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
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showErrorAnimation={!!error}
              helperText="At least 8 characters"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showErrorAnimation={!!error}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full font-heading font-bold shadow-teal hover:shadow-teal-lg bg-secondary-600 hover:bg-secondary-700"
              isLoading={isLoading}
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
            <span className="text-xs font-heading font-bold text-neutral-400 uppercase tracking-wider">Or sign up with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="font-heading font-bold"
              onClick={() => handleOAuthSignup('google')}
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
              onClick={() => handleOAuthSignup('facebook')}
              disabled={isOAuthLoading === 'facebook'}
              isLoading={isOAuthLoading === 'facebook'}
              hideTextWhileLoading
            >
              Facebook
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <p className="text-center text-neutral-600 font-body">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className={cn(
                  'text-secondary-600 font-heading font-bold',
                  'hover:text-secondary-700 transition-colors duration-300',
                  'underline underline-offset-4 decoration-2 decoration-secondary-200 hover:decoration-secondary-400'
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
