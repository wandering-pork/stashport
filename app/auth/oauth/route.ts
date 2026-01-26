import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  console.log('[Auth OAuth Route] Processing callback', {
    hasCode: !!code,
    error,
    errorDescription
  })

  // Handle OAuth error from provider
  if (error) {
    console.error('[Auth OAuth Route] OAuth error:', error, errorDescription)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('message', errorDescription)
    }
    return NextResponse.redirect(errorUrl)
  }

  // No code provided - redirect to error
  if (!code) {
    console.error('[Auth OAuth Route] No code provided')
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', 'no_code')
    errorUrl.searchParams.set('message', 'No authentication code provided')
    return NextResponse.redirect(errorUrl)
  }

  // Create Supabase client with proper cookie handling for Route Handler
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // Exchange the code for a session
    console.log('[Auth OAuth Route] Exchanging code for session...')
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[Auth OAuth Route] Code exchange error:', exchangeError.message)
      const errorUrl = new URL('/auth/error', origin)
      errorUrl.searchParams.set('error', 'exchange_failed')
      errorUrl.searchParams.set('message', exchangeError.message)
      return NextResponse.redirect(errorUrl)
    }

    if (!data.user) {
      console.error('[Auth OAuth Route] No user returned from code exchange')
      const errorUrl = new URL('/auth/error', origin)
      errorUrl.searchParams.set('error', 'no_user')
      errorUrl.searchParams.set('message', 'Authentication failed - no user data')
      return NextResponse.redirect(errorUrl)
    }

    console.log('[Auth OAuth Route] Code exchange successful, user:', data.user.id)

    // Create user profile if it doesn't exist
    if (data.user.email) {
      console.log('[Auth OAuth Route] Ensuring user profile exists...')
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
        console.error('[Auth OAuth Route] Error creating user profile:', upsertError)
        // Continue anyway - auth is successful, profile can be created later
      } else {
        console.log('[Auth OAuth Route] User profile ready')
      }
    }

    // Success - redirect to dashboard
    console.log('[Auth OAuth Route] Redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', origin))

  } catch (err) {
    console.error('[Auth OAuth Route] Unexpected error:', err)
    const errorUrl = new URL('/auth/error', origin)
    errorUrl.searchParams.set('error', 'unexpected')
    errorUrl.searchParams.set('message', 'An unexpected error occurred during authentication')
    return NextResponse.redirect(errorUrl)
  }
}
