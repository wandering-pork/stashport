# Phase 3: Itinerary CRUD Operations - Roadmap

**Status:** 🚀 Starting
**Expected Duration:** 2-3 days
**Build Target:** Zero Errors | Production Ready

---

## Overview

Phase 3 implements the core itinerary management functionality. Users will be able to create, read, update, and delete travel itineraries. This phase connects the authenticated user experience (Phase 2) to the database schema (Phase 1), enabling real data persistence and retrieval.

### Phase 3 is the MVP Feature Foundation

This phase is critical because:
- ✅ Authenticated users exist (Phase 2)
- ✅ Database schema is ready (Phase 1)
- 🚀 Now we need to let users actually create and manage trips
- 🔜 This becomes the foundation for Phase 4 (public itinerary sharing)
- 🔜 This enables Phase 5 (social media integration)

---

## Phase 3 Goals

1. **Create Itinerary** - Users can create new travel plans from scratch
2. **View Itinerary** - Users can see detailed view of individual itineraries
3. **Edit Itinerary** - Users can modify existing itineraries (title, description, dates, activities)
4. **Delete Itinerary** - Users can remove itineraries they created
5. **List User Itineraries** - Dashboard shows all user's trips with previews
6. **Real Database Integration** - All data persists to Supabase (no more mock data)
7. **Row Level Security** - Enforce that users can only access their own private trips

---

## Task Breakdown

### ✅ Task 1: Create Zod Validation Schemas for Forms

**File:** `lib/utils/validation.ts` (UPDATE)

**What to add:**
- `createItinerarySchema` - For creating new itineraries
- `updateItinerarySchema` - For editing itineraries
- `createDaySchema` - For adding days to itinerary
- `createActivitySchema` - For adding activities to days

**Details:**
```typescript
// Example structure needed:
export const createItinerarySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  destination: z.string().min(1, "Destination is required").max(100),
  start_date: z.string(), // ISO date string
  end_date: z.string(),   // ISO date string
  is_public: z.boolean().default(false),
}).refine(
  data => new Date(data.start_date) < new Date(data.end_date),
  { message: "End date must be after start date", path: ["end_date"] }
)

export const createDaySchema = z.object({
  day_number: z.number().min(1),
  date: z.string(), // ISO date string
  title: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export const createActivitySchema = z.object({
  time: z.string(), // HH:MM format
  title: z.string().min(1, "Activity title is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().max(500).optional(),
  category: z.enum(['accommodation', 'dining', 'activity', 'transport', 'other']).optional(),
})
```

**Success Criteria:**
- All schemas compile without errors
- Schemas enforce required fields
- Date validation works (start < end)
- Zod type inference produces correct TypeScript types

---

### ✅ Task 2: Create "Create Itinerary" Page

**File:** `app/itinerary/new/page.tsx` (CREATE)

**What to build:**
- Form with itinerary details (title, description, destination, dates)
- Initial day setup (optional)
- Protected page (redirect to login if not authenticated)
- Real Supabase integration (not mock)
- Loading and error states

**Page Structure:**
```
/itinerary/new
├── Form Section
│   ├── Title input
│   ├── Description textarea
│   ├── Destination input
│   ├── Start date picker
│   ├── End date picker
│   └── Public/Private toggle
└── Submit Button
```

**Features:**
- ✅ Form validation with Zod
- ✅ Submit to Supabase `itineraries` table
- ✅ Get current user from auth context
- ✅ Set created_at timestamp
- ✅ Success redirect to itinerary detail page
- ✅ Error handling and display

**Database Operation:**
```typescript
const { data, error } = await supabase
  .from('itineraries')
  .insert([{
    user_id: user.id,
    title,
    description,
    destination,
    start_date,
    end_date,
    is_public: false,
    created_at: new Date().toISOString(),
  }])
  .select()
  .single()

// On success: router.push(`/itinerary/${data.id}/edit`)
```

**Success Criteria:**
- Form validates before submit
- Data saves to Supabase
- User redirected to edit page after creation
- Unauthenticated users redirected to login

---

### ✅ Task 3: Create "Edit Itinerary" Page

**File:** `app/itinerary/[id]/edit/page.tsx` (CREATE)

**What to build:**
- Detailed itinerary editor
- Section for managing days and activities
- Day-by-day breakdown
- Add/edit/delete activities within days
- Protected page (verify ownership before allowing edits)

**Page Structure:**
```
/itinerary/[id]/edit
├── Itinerary Details Section
│   ├── Title, description, destination, dates
│   └── Update button
├── Days Management Section
│   ├── List of days
│   ├── Each day shows:
│   │   ├── Date and title
│   │   ├── Activities list
│   │   └── Add activity button
│   └── Add new day button
└── Delete itinerary button
```

**Features:**
- ✅ Load itinerary from Supabase by ID
- ✅ Verify user owns this itinerary (via RLS)
- ✅ Show loading state while fetching
- ✅ Edit itinerary metadata (title, dates, etc.)
- ✅ Manage days (add, edit, delete)
- ✅ Manage activities within days (add, edit, delete)
- ✅ Real-time save or explicit save button
- ✅ Error handling for unauthorized access

**Database Operations:**
```typescript
// GET: Load itinerary with days and activities
const { data, error } = await supabase
  .from('itineraries')
  .select(`
    *,
    days (
      *,
      activities (*)
    )
  `)
  .eq('id', itineraryId)
  .single()

// UPDATE: Modify itinerary
await supabase
  .from('itineraries')
  .update({ title, description, ... })
  .eq('id', itineraryId)

// INSERT: Add day
await supabase
  .from('days')
  .insert([{ itinerary_id: id, day_number, date, ... }])

// DELETE: Remove day (cascades to activities)
await supabase
  .from('days')
  .delete()
  .eq('id', dayId)
```

**Success Criteria:**
- Loads itinerary data correctly
- All CRUD operations work for days and activities
- Unauthorized users get error (via RLS)
- Changes persist to database
- Form validation works throughout

---

### ✅ Task 4: Create "View Itinerary" Page (Read-only)

**File:** `app/itinerary/[id]/page.tsx` (CREATE)

**What to build:**
- Read-only view of itinerary
- Beautiful display of trip details
- Day-by-day activities in chronological order
- Share button placeholder for Phase 5
- Edit/delete buttons if user owns it

**Page Structure:**
```
/itinerary/[id]
├── Header Section
│   ├── Trip title
│   ├── Destination
│   ├── Date range
│   └── Description
├── Days Timeline
│   ├── Day 1
│   │   ├── Date and title
│   │   └── Activities list
│   ├── Day 2
│   └── ...
├── Action Buttons (if owned)
│   ├── Edit button → /itinerary/[id]/edit
│   └── Delete button → confirm → delete
└── Share Button (placeholder for Phase 5)
```

**Features:**
- ✅ Load and display itinerary from Supabase
- ✅ Show all days and activities in order
- ✅ Beautiful UI with card components
- ✅ Show edit/delete buttons only if user owns it
- ✅ Show public/private badge
- ✅ Loading state
- ✅ Not found page if doesn't exist

**Success Criteria:**
- Displays itinerary and related data
- Shows correct actions based on ownership
- Layout is visually appealing
- Mobile responsive

---

### ✅ Task 5: Update Dashboard Page

**File:** `app/dashboard/page.tsx` (MODIFY)

**What to change:**
- Replace mock data with real Supabase query
- Load user's itineraries from `itineraries` table
- Display trip cards with previews
- Add "Create new trip" button
- Add "Edit" and "Delete" options per trip

**Dashboard Structure:**
```
/dashboard
├── Header "Your Trips"
├── Create Trip Button
├── Trips Grid
│   ├── Trip Card 1
│   │   ├── Title
│   │   ├── Destination
│   │   ├── Dates
│   │   ├── Activity count
│   │   └── Actions (view, edit, delete)
│   ├── Trip Card 2
│   └── ...
└── Empty state (if no trips)
    └── "Create your first trip" CTA
```

**Database Query:**
```typescript
const { data: itineraries, error } = await supabase
  .from('itineraries')
  .select(`
    id,
    title,
    destination,
    start_date,
    end_date,
    description,
    is_public,
    days (count)
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
```

**Features:**
- ✅ Show user's own trips only
- ✅ Display trip preview cards
- ✅ "Create new trip" button links to `/itinerary/new`
- ✅ Each card links to `/itinerary/[id]`
- ✅ Edit button links to `/itinerary/[id]/edit`
- ✅ Delete button with confirmation
- ✅ Empty state for new users
- ✅ Loading and error states

**Success Criteria:**
- Shows real user trips from database
- No mock data remaining
- Trip counts, dates display correctly
- All action buttons work

---

### ✅ Task 6: Add Nested Route Navigation

**File:** `app/itinerary/layout.tsx` (CREATE)

**What to build:**
- Layout wrapper for itinerary routes
- Breadcrumb navigation for context
- Shared styling for itinerary pages

**Purpose:**
- Provides consistent structure for `/itinerary/*` routes
- Can add breadcrumbs: Home > Itineraries > [Title] > Edit
- Ensures consistent styling across itinerary pages

**Success Criteria:**
- Routes render correctly
- Navigation context is clear

---

### ✅ Task 7: Add Delete Functionality

**Files:** Multiple (modify edit page, view page)

**What to add:**
- Delete button with confirmation modal
- Confirm user wants to delete
- Cascade delete (days + activities auto-deleted by database)
- Redirect to dashboard after deletion
- Error handling

**Delete Flow:**
```typescript
const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this trip?')) return

  try {
    const { error } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', itineraryId)

    if (!error) {
      router.push('/dashboard')
    }
  } catch (err) {
    setError('Failed to delete itinerary')
  }
}
```

**Success Criteria:**
- Delete works with confirmation
- Cascades correctly in database
- User redirected to dashboard
- Error handling works

---

### ✅ Task 8: Update Type Models

**File:** `lib/types/models.ts` (UPDATE)

**What to verify:**
- All TypeScript types match database schema
- Types are exported and usable in forms
- Zod schemas produce correct inferred types

**Should have:**
```typescript
export type Itinerary = Database['public']['Tables']['itineraries']['Row']
export type Day = Database['public']['Tables']['days']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']

// With relationships
export interface ItineraryWithDays extends Itinerary {
  days: (Day & { activities: Activity[] })[]
}
```

**Success Criteria:**
- All types compile
- Type inference from Zod works
- No type errors in pages

---

### ✅ Task 9: Error Handling & Validation

**What to add throughout Phase 3:**
- Required field validation (Zod)
- Date range validation (start < end)
- RLS enforcement (database level)
- User feedback on errors
- Loading states during async operations
- Empty states for no data

**Examples:**
```typescript
// Form validation error display
{errors.title && <span className="text-red-500">{errors.title}</span>}

// Loading state
{isLoading && <div>Creating your itinerary...</div>}

// RLS error handling
if (error?.code === 'PGRST116') {
  return <div>Not authorized to access this itinerary</div>
}
```

**Success Criteria:**
- All forms validate before submit
- RLS prevents unauthorized access
- Users see clear error messages
- Loading states visible during operations

---

### ✅ Task 10: Implement Protected Routes

**What to ensure:**
- Only authenticated users can access `/itinerary/*` routes
- Unauthorized users redirected to login
- Users can only edit their own itineraries

**Implementation:**
```typescript
// In create/edit pages:
'use client'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

export default function CreateItinerary() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/itinerary/new')
    }
  }, [user, isLoading])

  if (isLoading) return <div>Loading...</div>
  if (!user) return null

  // Render form...
}
```

**Success Criteria:**
- Unauthenticated users can't create/edit
- Users redirect to login
- RLS prevents data access on backend too

---

### ✅ Task 11: UI Components

**Files to create/update:**
- `components/ui/date-picker.tsx` - For date selection
- `components/ui/textarea.tsx` - For descriptions
- `components/itinerary/activity-card.tsx` - Display activity
- `components/itinerary/day-section.tsx` - Display day with activities
- `components/itinerary/trip-card.tsx` - For dashboard grid

**Success Criteria:**
- Components are reusable
- Consistent styling with Tailwind
- Responsive design
- Accessible (labels, ARIA, semantic HTML)

---

### ✅ Task 12: Testing Phase 3

**Manual Testing Checklist:**

1. **Create Itinerary**
   - [ ] Navigate to `/itinerary/new`
   - [ ] Fill in form (title, destination, dates)
   - [ ] Submit form
   - [ ] Should redirect to edit page
   - [ ] Check Supabase: data in `itineraries` table

2. **Add Days & Activities**
   - [ ] On edit page, add a day
   - [ ] Add activities to that day
   - [ ] Save changes
   - [ ] Check Supabase: `days` and `activities` tables populated

3. **Edit Itinerary**
   - [ ] Modify title/description
   - [ ] Edit activity details
   - [ ] Delete an activity
   - [ ] Changes persist in database

4. **View Itinerary**
   - [ ] Go to `/itinerary/[id]`
   - [ ] See all details displayed
   - [ ] See days in chronological order
   - [ ] See all activities

5. **Dashboard**
   - [ ] Go to `/dashboard`
   - [ ] See all your trips listed
   - [ ] Click trip card → goes to detail view
   - [ ] Click edit → goes to edit page
   - [ ] Click delete → confirms → deletes
   - [ ] Dashboard updates after delete

6. **RLS Security**
   - [ ] Log in as User A, create trip
   - [ ] Log in as User B
   - [ ] Try to access User A's trip via URL
   - [ ] Should get "not authorized" error (RLS blocks it)

7. **Form Validation**
   - [ ] Try to submit without title → error shows
   - [ ] Try end date before start date → error shows
   - [ ] Fill all required fields → submit works

8. **Build**
   - [ ] `npm run build` → should pass with zero errors
   - [ ] `npm run dev` → no console errors
   - [ ] `npm run lint` → no issues

---

## Database Schema Reminder

The Phase 1 schema already supports Phase 3:

```sql
-- Itineraries table
CREATE TABLE itineraries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  destination VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  stashed_from_id UUID, -- For Phase 4 (from other users' public trips)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Days table
CREATE TABLE days (
  id UUID PRIMARY KEY,
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  title VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  time VARCHAR(5), -- HH:MM format
  title VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**RLS Policies Already Configured:**
- Users can only access their own itineraries
- Public itineraries visible to everyone (Phase 4)
- Users can create/edit/delete their own itineraries
- Service role key can do everything

---

## Implementation Order

**Recommended sequence:**
1. Start with validation schemas (Task 1)
2. Build create page (Task 2)
3. Build edit page with days/activities (Task 3)
4. Build view page (Task 4)
5. Update dashboard (Task 5)
6. Add route layout (Task 6)
7. Add delete functionality (Task 7)
8. Verify type models (Task 8)
9. Add error handling throughout (Task 9)
10. Verify protected routes (Task 10)
11. Build UI components as needed (Task 11)
12. Test everything (Task 12)

---

## File Structure After Phase 3

```
stashport/
├── app/
│   ├── itinerary/
│   │   ├── [id]/
│   │   │   ├── page.tsx              # View itinerary
│   │   │   └── edit/
│   │   │       └── page.tsx          # Edit itinerary + manage days/activities
│   │   ├── new/
│   │   │   └── page.tsx              # Create new itinerary
│   │   └── layout.tsx                # Itinerary routes wrapper
│   ├── dashboard/
│   │   └── page.tsx                  # UPDATED: Real data from Supabase
│   └── ...
│
├── components/
│   ├── itinerary/
│   │   ├── activity-card.tsx         # NEW: Display activity
│   │   ├── day-section.tsx           # NEW: Display day + activities
│   │   └── trip-card.tsx             # NEW: For dashboard grid
│   ├── ui/
│   │   ├── date-picker.tsx           # NEW: Date selection
│   │   ├── textarea.tsx              # NEW: Multi-line input
│   │   └── ...
│   └── ...
│
├── lib/
│   ├── utils/
│   │   └── validation.ts             # UPDATED: Add itinerary schemas
│   ├── types/
│   │   └── models.ts                 # VERIFY: Types match schema
│   └── ...
└── ...
```

---

## Success Criteria for Phase 3

✅ Users can create itineraries with basic details
✅ Users can edit itineraries and manage days/activities
✅ Users can view their trips in detail
✅ Users can delete trips they created
✅ Dashboard displays all user's trips from real database
✅ All data persists to Supabase
✅ RLS prevents unauthorized access
✅ Form validation works throughout
✅ Protected routes redirect unauthenticated users
✅ Build passes with zero errors
✅ No console errors in dev mode
✅ Responsive design on mobile and desktop
✅ All tests pass

---

## What Phase 3 Does NOT Include

- ❌ Public trip discovery/search
- ❌ Social media sharing integration
- ❌ Stashing/saving other users' trips
- ❌ Calendar export
- ❌ Analytics
- ❌ User profiles
- ❌ Comments/ratings on public trips

These are Phase 4+ features.

---

## When Phase 3 is Complete

After Phase 3, the app will have:

✅ Full authentication system (Phase 2)
✅ Complete itinerary management (Phase 3)
✅ Real database integration
✅ Protected user data with RLS

At this point, developers can:
- Build Phase 4 (public viewing & stashing)
- Build Phase 5 (social media integration)
- Add advanced features (Phase 6)

---

## Ready to Start Phase 3?

Phase 2 authentication is production-ready. All infrastructure is in place:
- ✅ Users can sign up and log in
- ✅ Sessions persist
- ✅ Auth state available throughout app
- ✅ Database schema ready
- ✅ RLS policies configured

**Phase 3 is next: Implement itinerary CRUD operations**

Begin with Task 1 (Zod validation schemas) and proceed through the task breakdown above.

---

**Built with ❤️ for travel creators**
Stashport - Your travel itinerary passport
