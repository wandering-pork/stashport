'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { signupSchema } from '@/lib/utils/validation'
import { createClient } from '@/lib/supabase/client'

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-gray-600 mt-1">Join Stashport and start collecting trips</p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Create account
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Or sign up with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignup('google')}
              disabled={isOAuthLoading === 'google'}
            >
              {isOAuthLoading === 'google' ? 'Signing up...' : 'Google'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignup('facebook')}
              disabled={isOAuthLoading === 'facebook'}
            >
              {isOAuthLoading === 'facebook' ? 'Signing up...' : 'Facebook'}
            </Button>

            <div className="text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
