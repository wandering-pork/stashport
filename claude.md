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
    [id]/
      edit/    # Edit existing trip
      share/   # Share page - full-page editorial studio experience
    new/       # Create new trip
  t/[slug]/    # Public trip view
  api/         # API routes
components/
  ui/          # Button, Card, Input, SaveStatusIndicator, Dialog, Tooltip, etc.
  itinerary/   # Trip forms, cards, type selector, cover upload, explore, sections
  share/       # Share page components (template/format selectors, preview, download)
  layout/      # Header, footer
lib/
  supabase/    # Client/server Supabase setup
  auth/        # AuthContext, useAuth hook
  hooks/       # Custom hooks (useAutosave)
  constants/   # Tags, budget levels, templates, section-presets
  types/       # TypeScript interfaces
  utils/       # cn(), validation schemas, share-helpers
docs/          # Planning documents
  share-page-plan.md          # Dedicated share page specification
  SPRINT-3.5-EXTENDED-PLAN.md # Sprint 3.5 Extension UI/UX overhaul plan
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
// - 'daily': Plan My Trip (day-by-day itineraries with dates)
// - 'guide': Share My Favorites (category-based guides without dates)

// Form adapts based on type:
// - 'daily': Shows travel dates section, timeline view, "days" terminology
// - 'guide': Hides dates, shows section view, "sections" terminology, "Add Section" button
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

### Dialog

```tsx
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen} maxWidth="4xl">
  <DialogHeader onClose={() => setIsOpen(false)}>
    Modal Title
  </DialogHeader>
  <DialogContent>
    {/* Modal content */}
  </DialogContent>
</Dialog>

// maxWidth options: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
// Default: 'md'
```

### Tooltip

```tsx
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

// Wrap app/form in TooltipProvider
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger type="button">
      <HelpCircle className="w-4 h-4 text-gray-400" />
    </TooltipTrigger>
    <TooltipContent side="right" className="max-w-xs">
      <p>Helpful tooltip text here</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// Props: side="top|right|bottom|left", sideOffset (default: 4)
// Accessible, keyboard navigable, smooth animations
```

### Toast Notifications

```tsx
import { toast } from 'sonner'

// Success toast
toast.success('Link copied to clipboard!')

// Error toast
toast.error('Failed to copy link')

// Info toast
toast('Processing...')

// Toaster component added to root layout
// Position: bottom-right, richColors enabled
```

### Share Page (Dedicated Full-Page Experience)

```tsx
// Navigate to share page from trip cards
router.push(`/itinerary/${tripId}/share`)

// Route: /itinerary/[id]/share
// Features:
// - Editorial studio aesthetic with 3-column layout (desktop)
// - Template selector (left): Clean, Bold, Minimal styles
// - Preview panel (center): 60% scale real-time preview
// - Format selector + download (right): Story (9:16), Square (1:1), Portrait (4:5)
// - Compact, fits on single screen without scrolling
// - Mobile-responsive stacked layout
// - Smooth 300ms crossfade transitions between styles
// - Downloads high-resolution PNG files

// Components (in components/share/):
// - TemplateSelector: Vertical cards with sparkle selection indicators
// - FormatSelector: Aspect ratio visuals with teal selection states
// - PreviewPanel: Large preview with decorative corner accents
// - DownloadPanel: Trip stats and download button
```

### ShareModal (Legacy - Public Trips Only)

```tsx
import { ShareModal } from '@/components/itinerary/share-modal'

// Still used on public trip pages (/t/[slug]) for viewers who don't own the trip
// For owned trips, use the dedicated share page instead

const [showShareModal, setShowShareModal] = useState(false)

<ShareModal
  itinerary={itinerary}
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
/>
```

## Design Tokens

### Colors

- **Primary (Coral):** `primary-500` (#f86f4d) - CTAs, main actions
- **Secondary (Teal):** `secondary-500` (#14b8a6) - Secondary actions
- **Accent (Golden):** `accent-500` (#f59e0b) - Highlights
- **Background:** `bg-cream` (#fffaf5)

### Typography

- `font-display` (Fira Sans) - H1, H2, hero text - humanist sans by Mozilla
- `font-heading` (Fira Sans) - H3, H4, buttons, labels - humanist sans by Mozilla
- `font-body` (Fira Sans) - Body text, paragraphs - clean and highly readable

### Animations

```tsx
className="animate-fade-in"      // 250ms fade entrance
className="animate-reveal-up"    // Slide up + fade
className="animate-scale-in"     // Modal/dialog entrance
className="animate-shake"        // Error feedback
```

### Background Patterns

```tsx
// Wave backgrounds (for sections/hero areas)
className="bg-wave-warm"  // Coral + teal waves at bottom
className="bg-wave-cool"   // Teal wave at top

// Usage example
<section className="bg-wave-warm min-h-screen">
  <!-- Content -->
</section>
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

### Category/Section Schemas (Guide Type)

```tsx
import { categorySchema, categoryItemSchema } from '@/lib/utils/validation'

// Validate a section/category
const sectionResult = categorySchema.safeParse({
  name: 'Best Restaurants',
  icon: '🍜',
  sortOrder: 0,
  items: [
    { title: 'Sukiyabashi Jiro', location: 'Ginza, Tokyo', notes: 'Reserve weeks ahead' }
  ]
})

// Category item validation
const itemResult = categoryItemSchema.safeParse({
  title: 'Item title',         // Required, max 200 chars
  location: 'Location',        // Optional, max 200 chars
  notes: 'Notes here',         // Optional, max 1000 chars
  sortOrder: 0,                // Optional, defaults to 0
})
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

## Web Share API Helpers

```tsx
import { canShareFiles, shareImage, buildShareData, createShareFile } from '@/lib/utils/share-helpers'

// Check if Web Share API is supported
const canShare = canShareFiles() // Returns boolean

// Share an image with native share sheet
const shared = await shareImage(
  blob,              // Image blob from API
  'Trip Title',      // Title
  'trip-slug',       // Slug for URL
  'square'           // Format: 'story' | 'square' | 'portrait'
)

// Returns true if share initiated, false if cancelled or unsupported
// Automatically builds caption: "Check out my trip: {title} on Stashport! {url}"

// Manual share data building
const file = createShareFile(blob, 'filename.png')
const shareData = buildShareData(file, 'Trip Title', 'trip-slug')
await navigator.share(shareData)
```

**Browser Support:**
- ✅ Mobile Safari (iOS), Chrome Android, Samsung Internet
- ⚠️ Desktop browsers (limited support)
- ❌ Firefox (no support)

## Date Utilities (date-fns)

```tsx
import { format, differenceInDays, isPast, isToday, isTomorrow } from 'date-fns'

// Format dates for display
format(date, 'MMM d')           // "Jan 22"
format(date, 'MMM d, yyyy')     // "Jan 22, 2026"

// Date range display
const dateRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`

// Trip countdown calculations
const daysUntil = differenceInDays(startDate, new Date())
if (isToday(startDate)) { /* show "Today!" badge */ }
if (isTomorrow(startDate)) { /* show "Tomorrow" badge */ }
if (isPast(startDate)) { /* trip has started/ended */ }
```

**Used in:**
- `trip-card.tsx` - Date range display and "days until trip" countdown badges

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

## Itinerary Type Behavior

The form dynamically adapts based on the selected itinerary type:

### Daily Itinerary ('daily')
- **Purpose**: Day-by-day trip planning
- **Date Handling**: Travel dates section is **shown** and **required**
- **Days Generation**: Auto-generates day cards from date range
- **Terminology**: Uses "days" (e.g., "3 days planned")
- **Section Header**: "Your Itinerary" with 📅 icon
- **UI**: Timeline view with day numbers and dates

### Guide Itinerary ('guide')
- **Purpose**: Curated collections of favorite spots
- **Date Handling**: Travel dates section is **hidden** (dates not needed)
- **Days Generation**: Manual - user adds sections with "Add Section" button
- **Terminology**: Uses "sections" (e.g., "3 sections planned")
- **Section Header**: "Your Favorites" with ❤️ icon
- **Empty State**: Shows helpful prompt to add first section
- **UI**: Section-based view without dates
- **Database**: Uses `categories` and `category_items` tables (not `days`/`activities`)
- **API**: Send `sections[]` array in request body (or `categories[]`)

### Section Presets (Guide Type)

```tsx
import { SECTION_PRESETS, getSectionPreset, DEFAULT_SECTION_ICON } from '@/lib/constants/section-presets'

// 12 predefined section templates
SECTION_PRESETS.map(preset => ({
  icon: preset.icon,        // '🍜', '☕', '🏛️', etc.
  name: preset.name,        // 'Best Restaurants', 'Coffee & Cafés', etc.
  placeholder: preset.placeholder,
}))

// Get a specific preset
const preset = getSectionPreset('Best Restaurants')  // { icon: '🍜', name: '...', placeholder: '...' }

// Default icon for custom sections
const icon = DEFAULT_SECTION_ICON  // '📍'

// Available presets:
// 🍜 Best Restaurants, ☕ Coffee & Cafés, 🏛️ Must-See Attractions,
// 🌿 Hidden Gems, 🛍️ Shopping, 🌅 Viewpoints, 🍸 Nightlife,
// 🎨 Art & Culture, 🏖️ Beaches, 🥾 Hiking & Nature, 🏨 Where to Stay,
// ✨ Custom Section
```

### SectionCards & SectionItem (Guide Type UI)

```tsx
import { SectionCards, Section } from '@/components/itinerary/section-cards'
import { SectionItem, SectionItemData } from '@/components/itinerary/section-item'
import { AddSectionModal } from '@/components/itinerary/add-section-modal'

// Section data structure
interface Section {
  name: string           // Section name (e.g., "Best Restaurants")
  icon: string           // Emoji icon (e.g., "🍜")
  sortOrder: number      // Position in list
  items: SectionItemData[]
}

interface SectionItemData {
  title: string          // Place name (required)
  location?: string      // Location/address
  notes?: string         // Tips or notes
  sortOrder?: number     // Position in section
}

// Usage in itinerary form (guide type)
const [sections, setSections] = useState<Section[]>([])

{itineraryType === 'guide' ? (
  <SectionCards
    sections={sections}
    onSectionsChange={setSections}
  />
) : (
  <DayCards days={days} onDaysChange={setDays} />
)}

// Features:
// - Timeline-style layout with vertical connector
// - Expandable/collapsible sections
// - Editable section titles (click to edit)
// - Add/remove items within sections
// - Item count badges
// - Empty state with placeholder text
// - "Add place" button per section
```

### AddSectionModal

```tsx
import { AddSectionModal } from '@/components/itinerary/add-section-modal'

<AddSectionModal
  open={showModal}
  onOpenChange={setShowModal}
  onAddSection={(section) => {
    // { name: string, icon: string }
    handleAddSection(section)
  }}
  existingSectionNames={sections.map(s => s.name)}
/>

// Features:
// - Grid of 12 preset section templates
// - "Already added" indicator for used presets
// - Custom section creator with emoji picker
// - 12 emoji options for custom sections
// - Back to presets navigation
```

## Public Trip Page Features (`/t/[slug]`)

The public trip view uses an immersive editorial design with two hero variants:

### Hero Section (With Cover Photo)
- Full-width immersive hero (70-80vh height)
- Cover photo as full-bleed background with cinematic gradient overlay
- Glass morphism destination badge (`bg-white/15 backdrop-blur-md`)
- Large display title (up to 7xl), meta info (days, activities, tags)
- Creator attribution with Avatar, Share button

### Hero Section (Without Cover Photo)
- Gradient background (`from-primary-500 via-primary-600 to-secondary-600`)
- Dot pattern overlay and decorative blurred shapes
- Same content layout as cover photo variant

### Day Cards (Timeline View)
- Large gradient day number badges (rounded squares with shadow)
- Timeline layout with left border (`border-primary-200`)
- Activity cards with icon, title, location, time, notes
- Timeline dots connecting activities

### Footer CTA
- Full-width gradient section with "Inspired by this trip?" messaging
- Share and "Plan Your Own" action buttons

## Explore API

```tsx
// Fetch public itineraries from other users
const response = await fetch('/api/itineraries/explore?page=1&limit=12')
const { itineraries, pagination } = await response.json()

// Query parameters:
// - page: number (default: 1)
// - limit: number (default: 12, max: 50)
// - destination: string (filter by destination)
// - tags: string (comma-separated tag filter)
// - sort: 'recent' | 'popular' (default: 'recent')
// - type: 'daily' | 'guide' | 'all' (default: 'all')

// Response shape:
interface ExploreResponse {
  itineraries: {
    id: string
    title: string
    description: string | null
    destination: string | null
    slug: string
    budgetLevel: number | null
    type: 'daily' | 'guide'
    coverPhotoUrl: string | null
    createdAt: string
    dayCount: number
    tags: string[]
    creator: {
      id: string
      displayName: string
      avatarColor: string
    }
  }[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}
```

### ExploreCard & ExploreGrid

```tsx
import { ExploreCard, ExploreItinerary } from '@/components/itinerary/explore-card'
import { ExploreGrid } from '@/components/itinerary/explore-grid'

// Individual card for explore section
<ExploreCard
  itinerary={itinerary}  // ExploreItinerary interface
  index={0}              // For staggered animation delay
/>

// Grid with loading, error, and empty states
<ExploreGrid
  itineraries={itineraries}
  isLoading={isLoading}
  error={error}
  hasMore={hasMore}
  onLoadMore={loadMore}
/>

// Features:
// - Magazine-style editorial design
// - Cover photo with cinematic gradient overlay
// - Glass morphism destination badges (backdrop-blur-md)
// - Type indicators (teal "Daily" / coral "Guide")
// - Creator attribution with Avatar
// - Staggered reveal animations
// - "Load More" pagination
```

### Dashboard Tabs (My Trips / Explore)

```tsx
// URL-driven tab navigation
// /dashboard?tab=explore - Shows explore grid
// /dashboard (default) - Shows user's trips

// Dashboard uses Suspense boundary for useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

// Tab state from URL
const searchParams = useSearchParams()
const activeTab = searchParams.get('tab') || 'my-trips'

// Tab navigation updates URL without reload
const handleTabChange = (tab: string) => {
  const params = new URLSearchParams(searchParams)
  if (tab === 'my-trips') {
    params.delete('tab')
  } else {
    params.set('tab', tab)
  }
  router.push(`/dashboard?${params.toString()}`)
}
```

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
11. Form components should adapt to itinerary type - see Itinerary Type Behavior section
