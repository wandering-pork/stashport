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
  auth/        # Login, signup, callback, confirm-email
  dashboard/   # Main dashboard (with pagination)
  itinerary/   # Create/edit pages
  t/[slug]/    # Public trip view
  api/         # API routes
components/
  ui/          # Button, Card, Input, SaveStatusIndicator, etc.
  itinerary/   # Trip forms, cards
  layout/      # Header, footer
lib/
  supabase/    # Client/server Supabase setup
  auth/        # AuthContext, useAuth hook
  hooks/       # Custom hooks (useAutosave)
  constants/   # Tags, budget levels
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

### Avatar

```tsx
import { Avatar } from '@/components/ui/avatar'

<Avatar name="John Doe" size="sm" />  // 24px, shows "JD"
<Avatar name="Jane" size="md" />       // 32px (default)
<Avatar name={null} size="lg" />       // 48px, shows "?"

// Props: name (generates initials), size="sm|md|lg", color (optional hex)
// Color is auto-generated from name hash if not provided
```

### TagSelector & TagPill

```tsx
import { TagSelector } from '@/components/ui/tag-selector'
import { TagPill } from '@/components/ui/tag-pill'
import { TRIP_TAGS } from '@/lib/constants/tags'

// Selection (max 3 tags)
<TagSelector
  selected={tags}
  onChange={setTags}
  max={3}
/>

// Display only
<TagPill tag="Adventure" size="sm" />  // or size="md"

// Available tags: Adventure, Romantic, Budget, Luxury, Family, Solo, Food Tour, Road Trip
```

### BudgetSelector

```tsx
import { BudgetSelector } from '@/components/ui/budget-selector'

<BudgetSelector
  value={budgetLevel}      // 1-4 or null
  onChange={setBudgetLevel}
/>

// Displays: $ (Budget), $$ (Moderate), $$$ (Upscale), $$$$ (Luxury)
// Click same button again to deselect
```

### TypeSelector

```tsx
import { TypeSelector } from '@/components/itinerary/type-selector'
import { ItineraryTypeKey } from '@/lib/constants/templates'

<TypeSelector
  value={itineraryType}    // 'daily' or 'guide'
  onChange={setItineraryType}
  disabled={false}
/>

// Two types:
// - 'daily': Plan My Trip (day-by-day itineraries)
// - 'guide': Share My Favorites (category-based guides)
```

### CoverUpload

```tsx
import { CoverUpload } from '@/components/itinerary/cover-upload'

<CoverUpload
  value={coverPhotoUrl}    // URL or null
  onChange={setCoverPhotoUrl}
  disabled={false}
/>

// Features:
// - Drag-and-drop support
// - JPG, PNG, WebP formats
// - Max 5MB file size
// - Uploads to Supabase Storage
// - Preview with remove button
```

### ShareModal

```tsx
import { ShareModal } from '@/components/itinerary/share-modal'

const [showShareModal, setShowShareModal] = useState(false)

<ShareModal
  itinerary={itinerary}         // ItineraryWithDays
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
/>

// Template styles: clean, bold, minimal
// Formats: story (9:16), square (1:1), portrait (4:5)
// Downloads as PNG file
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

### Nullable Optional Fields

Optional fields use `.nullable()` to handle both `null` and `undefined`:

```tsx
// Pattern for optional string fields that may be null from forms
const optionalString = (maxLength: number, message?: string) =>
  z.string()
    .max(maxLength, message)
    .optional()
    .nullable()
    .transform(val => val || undefined)

// Usage in schemas
destination: optionalString(100, 'Destination must be less than 100 characters'),
```

This pattern transforms `null` and empty strings to `undefined`, preventing validation errors when form fields are empty.

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

## Autosave Hook

```tsx
import { useAutosave } from '@/lib/hooks/use-autosave'

// In forms that need autosave
const autosave = useAutosave<FormDataType>({
  storageKey: 'draft-key',      // localStorage key
  debounceMs: 2000,             // Save after 2s of inactivity
  syncToServer: true,           // Also save to server
  itineraryId: 'optional-id',   // For existing items
})

// Update data (triggers debounced autosave)
autosave.updateData(formData)

// Display save status
<SaveStatusIndicator
  status={autosave.status}      // idle | saving | saved | error | offline
  lastSaved={autosave.lastSaved}
  error={autosave.error}
/>

// Other methods
autosave.saveNow()              // Immediate save
autosave.clearDraft()           // Remove from localStorage
autosave.loadDraft()            // Recover saved draft
```

## Logging

Add detailed console logs for key actions to enable server-side validation without browser inspection.

### Logging Patterns

```tsx
// API Routes - Log entry, key data, and outcomes
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/itinerary - Request received')

  const body = await request.json()
  console.log('[API] POST /api/itinerary - Payload:', {
    title: body.title,
    daysCount: body.days?.length,
    userId: user.id,
  })

  // After DB operation
  console.log('[API] POST /api/itinerary - Created:', { id: data.id, slug: data.slug })

  // On error
  console.error('[API] POST /api/itinerary - Error:', error.message)
}

// Auth flows - Log each step
console.log('[Auth] Signup initiated:', { email })
console.log('[Auth] Signup success - Confirmation email sent')
console.log('[Auth] Signup error:', error.message)

// Form submissions - Log validation and state changes
console.log('[Form] Itinerary submit - Validating:', { title, destination })
console.log('[Form] Itinerary submit - Validation passed')
console.log('[Form] Itinerary submit - Validation failed:', errors)

// Database operations
console.log('[DB] Query itineraries - Params:', { userId, page, limit })
console.log('[DB] Query itineraries - Results:', { count: data.length, hasMore })
```

### Log Prefixes

| Prefix | Use Case |
|--------|----------|
| `[API]` | API route handlers |
| `[Auth]` | Authentication flows |
| `[Form]` | Form validation/submission |
| `[DB]` | Database operations |
| `[Hook]` | Custom hook actions |
| `[Component]` | Component lifecycle events |

### What to Log

- **Always log:** API entry/exit, auth state changes, errors, DB mutations
- **Include context:** User ID (not email), entity IDs, counts, status
- **Avoid logging:** Passwords, tokens, full email addresses, sensitive PII

## Key Rules

1. Use `@/` path alias for all imports
2. Mark interactive components with `'use client'` at top
3. Use `cn()` utility for conditional class composition
4. Always handle loading and error states in async operations
5. Supabase RLS enforces authorization - always verify user in API routes
6. Validate user input with Zod schemas before processing
7. Use existing UI components from `components/ui/` - don't recreate
8. Use `useAutosave` hook for forms that need draft recovery
9. Add accessibility attributes (`role`, `aria-live`) to status messages
10. Add detailed logs with prefixes (`[API]`, `[Auth]`, etc.) for key actions - see Logging section
