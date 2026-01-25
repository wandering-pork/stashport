'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Compass, MapPin, Globe2, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingInput } from '@/components/ui/floating-input'
import { loginSchema } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
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
      const supabase = createClient()
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
      const supabase = createClient()
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
    <div className="min-h-screen flex">
      {/* Left Column - Brand Panel (Terracotta) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[#c24d35] via-[#d4654a] to-[#e07a5f]">
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-32 left-16 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />

        {/* Stamp Decoration */}
        <div className="absolute bottom-24 right-16 w-32 h-32 stamp-decoration opacity-30" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16 w-full h-full">
          {/* Main Content */}
          <div className="max-w-sm">
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome back,
              <br />
              traveler
            </h1>

            <p className="text-white/80 text-lg leading-relaxed mb-10">
              Sign in to continue planning your adventures and discovering new journeys.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm">Continue where you left off</span>
              </div>
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm">Access all your saved trips</span>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="border-t border-white/20 pt-8">
            <p className="text-sm text-white/60 italic leading-relaxed max-w-sm">
              "Travel is the only thing you buy that makes you richer."
            </p>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mt-3">
              — Anonymous Traveler
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 md:px-12 py-16 lg:py-0 bg-[#fdfcfa] relative">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(45, 42, 38, 0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-md relative z-10 animate-slide-in-up">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#e07a5f] flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2d2a26]">Stashport</span>
            </div>
            <h1 className="text-3xl font-bold text-[#2d2a26] mb-2">
              Welcome back
            </h1>
            <p className="text-[#7d7a74]">
              Sign in to continue your journey
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#e07a5f] mb-4">
              Sign In
            </span>
            <h2 className="text-3xl font-bold text-[#2d2a26] mb-2">
              Continue your journey
            </h2>
            <p className="text-[#7d7a74]">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake-enhanced">
              <p className="text-red-600 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingInput
              label="Email Address"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              showErrorAnimation={!!error}
              required
            />

            <div>
              <FloatingInput
                label="Password"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showErrorAnimation={!!error}
                required
              />
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#e07a5f] hover:text-[#d4654a] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Breathing CTA Button with Shimmer */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-14 rounded-2xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(224,122,95,0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#e07a5f] via-[#d4654a] to-[#e07a5f] bg-[length:200%_100%] animate-gradient-x" />

              {/* Shimmer Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              {/* Button Content */}
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#ebe4d6]" />
            <span className="text-xs font-medium text-[#9d9a94] uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-[#ebe4d6]" />
          </div>

          {/* OAuth Buttons - Icon Only */}
          <div className="flex justify-center gap-4">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isOAuthLoading === 'google'}
              className="w-14 h-14 rounded-2xl border border-[#ebe4d6] bg-white flex items-center justify-center transition-all duration-300 hover:border-[#d9cfc0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Sign in with Google"
            >
              {isOAuthLoading === 'google' ? (
                <svg className="animate-spin h-5 w-5 text-[#9d9a94]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              disabled={isOAuthLoading === 'facebook'}
              className="w-14 h-14 rounded-2xl border border-[#ebe4d6] bg-white flex items-center justify-center transition-all duration-300 hover:border-[#d9cfc0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Sign in with Facebook"
            >
              {isOAuthLoading === 'facebook' ? (
                <svg className="animate-spin h-5 w-5 text-[#9d9a94]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
            </button>

          </div>

          {/* Sign Up Link */}
          <div className="mt-10 pt-8 border-t border-[#ebe4d6]">
            <p className="text-center text-[#5d5a54]">
              New to Stashport?{' '}
              <Link
                href="/auth/signup"
                className="text-[#e07a5f] font-semibold hover:text-[#d4654a] transition-colors"
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
