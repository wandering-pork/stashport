# Stashport Technical Architecture

**Version:** 0.6.0
**Last Updated:** January 20, 2026
**Status:** Production Ready

---

## System Overview

Stashport is a full-stack travel itinerary management application built with modern web technologies. The system is organized into distinct layers: presentation (UI), business logic (API), and data persistence (Database).

```
┌─────────────────────────────────────────────┐
│         Client (Browser)                    │
│  ┌───────────────────────────────────────┐  │
│  │  React Components / Next.js Pages     │  │
│  │  (TypeScript + Tailwind CSS)          │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    ↕ (HTTP/REST)
┌─────────────────────────────────────────────┐
│       Backend (Next.js API Routes)          │
│  ┌───────────────────────────────────────┐  │
│  │  API Endpoints with Validation        │  │
│  │  (TypeScript + Zod)                   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    ↕ (SQL)
┌─────────────────────────────────────────────┐
│    Database (Supabase PostgreSQL)           │
│  ┌───────────────────────────────────────┐  │
│  │  Tables with RLS Policies             │  │
│  │  Row-Level Security Enforcement       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology:** Next.js 16, React 19, TypeScript, Tailwind CSS

**Key Responsibilities:**
- Render user interfaces
- Capture user input
- Display data from API
- Handle client-side state
- Manage navigation

**Directory Structure:**
```
app/
├── page.tsx                 # Home/landing page
├── layout.tsx               # Root layout
├── dashboard/
│   └── page.tsx             # User dashboard (trip list)
├── itinerary/
│   ├── new/page.tsx         # Create trip form
│   ├── [id]/
│   │   ├── page.tsx         # View trip details
│   │   ├── edit/page.tsx    # Edit trip form
│   │   └── layout.tsx       # Trip layout
│   └── api/
│       └── ... (API routes)
├── auth/
│   ├── login/page.tsx       # Login page
│   ├── signup/page.tsx      # Signup page
│   ├── confirm-email/page.tsx # Email confirmation page
│   ├── callback/route.ts    # OAuth callback
│   └── logout/route.ts      # Sign out
├── t/
│   └── [slug]/page.tsx      # Public trip view
├── api/
│   ├── itineraries/
│   │   ├── route.ts         # GET/POST /api/itineraries
│   │   ├── [id]/route.ts    # GET/PUT/DELETE /api/itineraries/[id]
│   │   └── public/route.ts  # Public trip API
│   └── auth/
│       └── ... (auth endpoints)
└── globals.css              # Global styles + design system

components/
├── layout/
│   ├── header.tsx           # Top navigation
│   ├── footer.tsx           # Footer
│   └── sidebar.tsx          # Sidebar (if applicable)
├── itinerary/
│   ├── itinerary-form.tsx   # Create/edit form
│   ├── day-cards.tsx        # Draggable day cards
│   └── trip-card.tsx        # Trip display card
├── ui/
│   ├── button.tsx           # Button component
│   ├── input.tsx            # Input component
│   ├── textarea.tsx         # Textarea component
│   ├── card.tsx             # Card component
│   ├── toggle.tsx           # Toggle switch
│   ├── country-select.tsx   # Country dropdown
│   ├── save-status.tsx      # Autosave status indicator
│   ├── avatar.tsx           # User avatar with initials
│   ├── tag-pill.tsx         # Tag display pill
│   ├── tag-selector.tsx     # Multi-select tag picker
│   └── budget-selector.tsx  # Budget level selector
└── auth/
    └── auth-context.tsx     # Global auth state

lib/
├── auth/
│   ├── auth-context.tsx     # useAuth() hook
│   └── auth-utils.ts        # Helper functions
├── constants/
│   └── tags.ts              # TRIP_TAGS, BUDGET_LEVELS
├── hooks/
│   └── use-autosave.ts      # Debounced autosave hook
├── supabase/
│   ├── client.ts            # Client-side Supabase
│   └── server.ts            # Server-side Supabase
├── types/
│   ├── models.ts            # TypeScript interfaces
│   └── database.ts          # Supabase auto-generated types
├── utils/
│   ├── validation.ts        # Zod schemas
│   ├── cn.ts                # Class name utility
│   └── helpers.ts           # Utility functions
└── theme/
    └── tokens.ts            # Design tokens (optional)
```

#### Component Architecture

**Smart Components (Pages):**
- Handle data fetching
- Manage route parameters
- Control page-level state
- Render layout

**Dumb Components (UI):**
- Accept props
- Render UI
- Call callbacks on user interaction
- No data fetching

**Example Data Flow:**
```
Dashboard Page (Smart)
    ↓
  Uses useAuth() hook to get user
  Fetches /api/itineraries
    ↓
  TripCard Component (Dumb) ← Receives trip data as prop
  Renders trip info, edit/delete buttons
    ↓
  User clicks Edit → navigates to edit page
```

### 2. API Layer (Backend)

**Technology:** Next.js API Routes, TypeScript, Zod

**Key Responsibilities:**
- Handle HTTP requests
- Validate input data
- Enforce authentication
- Query database
- Return JSON responses

**API Endpoints:**

#### Itineraries
- `GET /api/itineraries` - Fetch all user's trips
- `POST /api/itineraries` - Create new trip
- `GET /api/itineraries/[id]` - Get single trip
- `PUT /api/itineraries/[id]` - Update trip
- `DELETE /api/itineraries/[id]` - Delete trip

#### Public Itineraries
- `GET /api/itineraries/public/[slug]` - View public trip (includes creator info and tags)

#### User Profile
- `GET /api/users/profile` - Get current user's profile
- `PUT /api/users/profile` - Update display name

#### Authentication
- `POST /auth/signup` - Register with email
- `POST /auth/login` - Login with email
- `GET /auth/callback` - OAuth callback
- `POST /auth/logout` - Sign out

**Request/Response Pattern:**

```typescript
// Request validation with Zod
const schema = z.object({
  title: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  // ...
})

// Response format
{
  "status": "success" | "error",
  "data": { /* response data */ },
  "error": { /* error details */ }
}
```

**Error Handling:**
- 400 Bad Request - Invalid input
- 401 Unauthorized - Not authenticated
- 403 Forbidden - No access to resource
- 404 Not Found - Resource doesn't exist
- 500 Internal Server Error - Server error

#### Request/Response Examples

**Create Trip:**
```
POST /api/itineraries
Content-Type: application/json

{
  "title": "Paris Spring Break",
  "description": "A week in Paris",
  "destination": "France",
  "isPublic": true,
  "startDate": "2026-04-01",
  "endDate": "2026-04-07",
  "days": [
    {
      "dayNumber": 1,
      "date": "2026-04-01",
      "title": "Arrival",
      "activities": [
        {
          "title": "Arrive at CDG",
          "location": "Paris",
          "startTime": "14:00",
          "endTime": "15:00"
        }
      ]
    }
  ]
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "title": "Paris Spring Break",
    "user_id": "user-uuid",
    "days": [...],
    "created_at": "2026-01-11T..."
  }
}
```

### 3. Data Layer (Database)

**Technology:** Supabase (PostgreSQL), Row Level Security (RLS)

**Database Schema:**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  auth_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name VARCHAR(100),          -- Sprint 2: Creator identity
  avatar_color VARCHAR(7) DEFAULT '#14b8a6',  -- Sprint 2: Avatar color
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itineraries table
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT,
  is_public BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  budget_level INTEGER CHECK (budget_level >= 1 AND budget_level <= 4),  -- Sprint 2
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Days table (individual days within an itinerary)
CREATE TABLE days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table (activities within a day)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip tags table (Sprint 2: Discovery & Identity)
CREATE TABLE trip_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(itinerary_id, tag)
);
-- Tags: Adventure, Romantic, Budget, Luxury, Family, Solo, Food Tour, Road Trip
```

**Row Level Security (RLS) Policies:**

```sql
-- Users can only view their own itineraries
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only edit their own itineraries
CREATE POLICY "Users can edit own itineraries"
  ON itineraries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own itineraries
CREATE POLICY "Users can delete own itineraries"
  ON itineraries FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for days and activities
```

**Relationships:**
```
Users (1)
  ├─ (1:many) ─┬─ Itineraries
                  ├─ (1:many) ─┬─ Days
                  │              ├─ (1:many) ─┬─ Activities
                  └─ (1:many) ─┬─ TripTags
```

---

## Data Flow Examples

### Creating a New Trip

```
1. User fills form (ItineraryForm component)
   - Title, description, destination, dates

2. User clicks "Create Trip"
   - Form validation with Zod
   - Auto-generates days from date range
   - POST to /api/itineraries

3. Backend processes request
   - Validates all data with Zod schemas
   - Gets user ID from auth context
   - Auto-creates user profile if needed
   - Inserts itinerary with days and activities
   - Returns created data with IDs

4. Frontend receives response
   - Shows success message
   - Navigates to dashboard
   - Dashboard refetches trips

5. Dashboard displays new trip
   - TripCard shows trip info
   - User can edit or delete
```

### Editing a Trip

```
1. User clicks "Edit" on trip card
   - Navigates to /itinerary/[id]/edit
   - Page fetches trip data from /api/itineraries/[id]

2. Form loads with existing data
   - All fields populated
   - Days loaded as draggable cards

3. User makes changes
   - Change detection compares to initial state
   - "Save Changes" button appears only if changes detected

4. User drags days to reorder
   - @dnd-kit handles drag-and-drop
   - Day numbers auto-update in state
   - Form shows as modified

5. User clicks "Save Changes"
   - Form validates all data
   - PUT to /api/itineraries/[id]
   - Backend updates database
   - Returns updated data
   - Form state reset (Save button hides)
   - User stays on page (no navigation)
```

### Viewing Dashboard

```
1. User navigates to /dashboard
   - Page checks auth (redirects if not authenticated)
   - Starts loading state (Loader2 spinner)

2. Fetch trips from /api/itineraries
   - API queries database filtered by user_id
   - RLS policy ensures user can only see own trips

3. Backend returns trips
   - Array of itineraries with days and activities
   - Includes metadata (dates, durations)

4. Frontend displays trips
   - Grid of TripCards (responsive: 1, 2, or 3 columns)
   - Empty state if no trips
   - Edit and Delete buttons on each card

5. User interactions
   - Click trip card → view details
   - Click Edit → go to edit page
   - Click Delete → confirm and delete
   - Click Create New Trip → go to /itinerary/new
```

---

## Authentication Flow

### Email/Password Authentication

```
1. User visits /auth/signup
2. Fills email and password
3. Frontend validates and POSTs to Supabase Auth
4. Supabase creates auth user and sends confirmation email
5. User redirected to /auth/confirm-email with email param
6. User clicks confirmation link in email
7. Redirected to /auth/callback which handles session
8. Server-side code creates user profile in users table
9. User redirected to /dashboard
```

### OAuth (Google/Facebook)

```
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth flow
3. Supabase Auth handles OAuth
4. Callback to /auth/callback
5. Supabase callback handler:
   - Creates/updates auth user
   - Creates user profile if needed
   - Returns session
6. Frontend receives session
7. User redirected to /dashboard
```

### Session Management

```
Auth Context (lib/auth/auth-context.tsx):
  - useAuth() hook provides global auth state
  - Checks session on app load
  - Provides user object and loading state
  - Handles logout

Protected Routes:
  - Dashboard, itinerary pages check useAuth()
  - Redirect to login if not authenticated
  - Show loading spinner while checking
```

---

## State Management

### Client-Side State

**Global State:**
- **Auth Context** - User session, authentication status
  ```typescript
  const { user, isLoading, signOut } = useAuth()
  ```

**Page State:**
- **Form State** - ItineraryForm uses useState for:
  - Title, description, destination
  - Start/end dates
  - Days array with activities
  - Loading and error states

**Component State:**
- **Local State** - Individual components use useState for:
  - UI toggle states (open/close)
  - Form input values
  - Loading indicators

### Data Fetching

**Fetch Pattern:**
```typescript
useEffect(() => {
  if (!isLoading && user) {
    fetch('/api/itineraries')
      .then(r => r.json())
      .then(data => setItineraries(data))
      .catch(err => setError(err))
  }
}, [user, isLoading])
```

**No State Management Library:**
- Using React hooks + context
- Simple, no additional dependencies
- Sufficient for current complexity

---

## Key Features Implementation

### 1. Auto-Generate Days from Date Range

```typescript
const generateDaysFromDates = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const newDays: DayForm[] = []

  let dayNumber = 1
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0]
    newDays.push({
      dayNumber,
      date: dateString,
      title: '',
      activities: [],
    })
    currentDate.setDate(currentDate.getDate() + 1)
    dayNumber++
  }

  setDays(newDays)
}
```

### 2. Drag-and-Drop Reordering

**Library:** @dnd-kit/core, @dnd-kit/sortable

```typescript
const DayCards = ({ days, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const activeIndex = days.findIndex(d => `day-${d.dayNumber}` === active.id)
      const overIndex = days.findIndex(d => `day-${d.dayNumber}` === over.id)

      const reordered = arrayMove(days, activeIndex, overIndex)
        .map((day, idx) => ({
          ...day,
          dayNumber: idx + 1,  // Auto-update day numbers
        }))

      onReorder(reordered)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={dayIds}>
        {/* Day cards */}
      </SortableContext>
    </DndContext>
  )
}
```

### 3. Change Detection

```typescript
const hasChanges = () => {
  if (!initialData) return true // New form always modified

  // Compare all fields
  if (title !== initialData.title) return true
  if (description !== initialData.description) return true
  if (destination !== initialData.destination) return true
  if (isPublic !== initialData.is_public) return true

  // Compare days and activities
  // ... detailed comparison logic

  return false
}

// Show save button only if modified
{hasChanges() && <SaveButton />}
```

### 4. Form Validation

```typescript
// lib/utils/validation.ts
export const itinerarySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  destination: z.string().max(100).optional(),
  isPublic: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const daySchema = z.object({
  dayNumber: z.number().min(1),
  date: z.string().nullable().optional(),
  title: z.string().max(200).optional(),
})

// Usage
const validation = itinerarySchema.safeParse(formData)
if (!validation.success) {
  setError(validation.error.issues[0].message)
}
```

---

## Design System

### Color Palette

```typescript
// Defined in app/globals.css
--primary: #FF6B35    // Coral - Main actions
--secondary: #004E89  // Teal - Buttons
--accent: #F7931E    // Golden Hour - Warnings
--neutral-50: #F9FAFB
--neutral-900: #111827
// ... and more
```

### Component Variants

**Button:**
- Primary (coral, large, filled)
- Secondary (teal, outlined)
- Outline (minimal)
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading

**Input:**
- Base styling
- Focus state (outlined in primary color)
- Error state (red border)
- Disabled state
- Character counter (for textarea)

**Card:**
- Base shadow
- Hover elevation
- Spacing (padding, gaps)
- Clean borders, rounded corners

---

## Security Model

### Authentication
- Supabase Auth handles credential storage
- HTTP-only cookies for session
- OAuth tokens never exposed to client

### Authorization
- Row Level Security (RLS) enforces at database level
- Users can only access own data
- API endpoints check auth and user ownership

### Input Validation
- All API inputs validated with Zod
- Type-safe TypeScript throughout
- Sanitized before database operations

### Sensitive Data
- No passwords in logs
- No sensitive data in console
- OAuth credentials in environment variables
- .env.local not committed to git

---

## Deployment Architecture

### Current (Development)
```
localhost:3000
  ├─ Next.js dev server
  ├─ Connected to Supabase staging
  └─ Environment variables from .env.local
```

### Planned (Production)
```
Custom domain (Phase 4)
  ├─ Vercel or similar hosting
  ├─ Connected to Supabase production
  ├─ Environment variables per environment
  └─ Custom domain SSL cert
```

---

## Performance Considerations

### Frontend
- **Code Splitting:** Next.js automatic
- **Image Optimization:** Next.js Image component
- **CSS:** Tailwind CSS minified
- **Bundle Size:** Minimized with Turbopack

### Backend
- **Database Queries:** Indexed columns (user_id, itinerary_id)
- **API Response Time:** < 200ms typical
- **Caching:** No current caching (simple for now)

### Lighthouse Targets
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

## Technology Decisions

### Why Next.js?
- Full-stack framework (frontend + API routes)
- Built-in optimization (images, fonts, code splitting)
- Easy deployment
- Great DX with TypeScript support

### Why TypeScript?
- Type safety catches bugs early
- Better IDE autocomplete
- Self-documenting code
- Zod for runtime validation

### Why Tailwind CSS?
- Utility-first CSS
- Small bundle size
- Easy responsive design
- No naming conflicts

### Why Supabase?
- PostgreSQL with RLS
- Built-in auth (OAuth, email/password)
- Real-time capabilities (future)
- Good free tier for development

### Why @dnd-kit?
- Lightweight drag-and-drop library
- Accessibility built-in
- No jQuery dependencies
- Smooth animations

---

## Known Limitations & Future Improvements

### Current Limitations
1. No real-time collaboration
2. No caching layer
3. No search/filtering
4. Activity ordering within day not implemented
5. No photo attachments
6. No email notifications

### Future Architecture Changes
- **Add Redis** - Caching user's trips, sessions
- **Add Search** - Elasticsearch or similar
- **Add Real-time** - Supabase real-time or WebSockets
- **Add Queue** - Bull/BullMQ for async jobs
- **Add CDN** - Cloudflare or similar for static assets
- **Add Analytics** - Segment or similar

---

## Monitoring & Logging

### Current
- Browser console for errors
- Server logs in terminal during dev

### Planned (Phase 4+)
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics (Mixpanel)
- Uptime monitoring (StatusPage)

---

## Related Documentation

- [ROADMAP.md](./ROADMAP.md) - Long-term vision and project status
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Phase implementation details
- [BACKLOG.md](./BACKLOG.md) - MVP features and priorities

---

**Stashport Architecture - v0.6.0**
*Well-documented, scalable, and maintainable.*
