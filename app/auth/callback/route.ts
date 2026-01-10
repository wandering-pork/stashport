import { createServerClient as createServerClientLib } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClientLib(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options)
                })
              } catch {
                // Ignore errors in server component context
              }
            },
          },
        }
      )

      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Redirect to dashboard on success
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
    }
  }

  // Redirect to login on error
  return NextResponse.redirect(
    new URL('/auth/login?error=authentication_failed', request.url)
  )
}
