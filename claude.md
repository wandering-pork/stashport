# Stashport Development Guide

## Quick Commands

```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build + TypeScript check
npm run lint     # ESLint
```

## Project Structure

```
app/           # Next.js App Router pages
  auth/        # Login, signup, callback
  dashboard/   # Main dashboard
  itinerary/   # Create/edit pages
  t/[slug]/    # Public trip view
  api/         # API routes
components/
  ui/          # Button, Card, Input, etc.
  itinerary/   # Trip forms, cards
  layout/      # Header, footer
lib/
  supabase/    # Client/server Supabase setup
  auth/        # AuthContext, useAuth hook
  types/       # TypeScript interfaces
  utils/       # cn(), validation schemas
```

## Code Patterns

### Component Template

```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface ComponentProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export function Component({ variant = 'primary', children }: ComponentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // ...
}
```

### Form Submission

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    const result = schema.safeParse(data)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Request failed')
    }
    // Success handling
  } catch (err: any) {
    setError(err.message || 'An error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

### API Route

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query logic...
    return NextResponse.json(data)
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## UI Components

### Button

```tsx
<Button variant="primary">Save</Button>      // Coral, main CTA
<Button variant="secondary">Cancel</Button>  // Teal outline
<Button variant="tertiary">Skip</Button>     // Text only
<Button variant="danger">Delete</Button>     // Red, destructive
<Button variant="ghost">Menu</Button>        // Transparent

// Props: size="sm|md|lg|xl", isLoading, fullWidth, iconOnly
```

### Card

```tsx
<Card variant="default|elevated|interactive" accentColor="primary|secondary|accent">
  <CardHeader>Title</CardHeader>
  <CardContent padding="default|compact|relaxed">Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

## Design Tokens

### Colors

- **Primary (Coral):** `primary-500` (#f86f4d) - CTAs, main actions
- **Secondary (Teal):** `secondary-500` (#14b8a6) - Secondary actions
- **Accent (Golden):** `accent-500` (#f59e0b) - Highlights
- **Background:** `bg-cream` (#fffaf5)

### Typography

- `font-display` (Playfair Display) - H1, H2, hero text
- `font-heading` (Space Grotesk) - H3, H4, buttons, labels
- `font-body` (Source Sans Pro) - Body text, paragraphs

### Animations

```tsx
className="animate-fade-in"      // 250ms fade entrance
className="animate-reveal-up"    // Slide up + fade
className="animate-scale-in"     // Modal/dialog entrance
className="animate-shake"        // Error feedback
```

## Validation (Zod)

```tsx
import { itinerarySchema, signupSchema } from '@/lib/utils/validation'

const result = schema.safeParse(formData)
if (!result.success) {
  setError(result.error.issues[0].message)
  return
}
```

## Authentication

```tsx
import { useAuth } from '@/lib/auth/auth-context'

const { user, isLoading, signOut } = useAuth()

// Check auth state
if (isLoading) return <Loading />
if (!user) redirect('/auth/login')
```

## Database Types

```tsx
import { ItineraryWithDays, Day, Activity } from '@/lib/types/models'
import { Database } from '@/lib/supabase/database.types'
```

## Key Rules

1. Use `@/` path alias for all imports
2. Mark interactive components with `'use client'` at top
3. Use `cn()` utility for conditional class composition
4. Always handle loading and error states in async operations
5. Supabase RLS enforces authorization - always verify user in API routes
6. Validate user input with Zod schemas before processing
7. Use existing UI components from `components/ui/` - don't recreate
