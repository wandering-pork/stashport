# Stashport Feature Backlog

Prioritized backlog aligned with MVP Scope and PRD.

**Reference Docs:** [stashport_mvp_scope.md](./stashport_mvp_scope.md) | [stashport_prd.md](./stashport_prd.md)

---

## Priority Legend
- **P0** - MVP Blocker (must ship)
- **P1** - MVP Required (must ship)
- **P2** - Post-MVP (v1.1/v1.2)
- **P3** - Future consideration

---

## API Reference

### Current Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/itineraries` | Required | Fetch user's itineraries with nested days/activities |
| POST | `/api/itineraries` | Required | Create new itinerary |
| GET | `/api/itineraries/[id]` | Required | Get single itinerary by ID |
| PUT | `/api/itineraries/[id]` | Required | Update itinerary (full replace) |
| DELETE | `/api/itineraries/[id]` | Required | Delete itinerary (cascade) |
| GET | `/api/itineraries/public/[slug]` | None | Get public itinerary by slug |

### Planned Endpoints (MVP)

| Method | Path | Auth | Description | Feature |
|--------|------|------|-------------|---------|
| GET | `/api/itineraries/featured` | None | Get 6 random public itineraries | Featured Itineraries |
| POST | `/api/itineraries/stash` | Required | Deep copy public itinerary to user's trips | Stash |
| POST | `/api/auth/resend-confirmation` | None | Resend email confirmation | Signup Confirmation |
| GET | `/api/users/profile` | Required | Get user profile (display name, avatar) | Creator Identity |
| PUT | `/api/users/profile` | Required | Update display name/avatar | Creator Identity |

### Response Format

- **Success:** Direct data object or array
- **Error:** `{ "error": "message" }` with appropriate HTTP status code

---

## 🟥 MVP Scope (Must Ship)

These features define the **minimum lovable product**.

---

### 1. Post-Signup Confirmation Flow (P0) — FR-1
**Problem:** After signup, user is redirected to login with no notice about email confirmation.

**Solution:**
Create dedicated confirmation page at `/auth/confirm-email`:
- Display: "Check your email to confirm your account"
- Show the email address they registered with
- "Resend confirmation email" button
- Helpful tips: "Check spam folder", "Email arrives within 2 minutes"

**Implementation:**
- Modify `app/auth/signup` to redirect to confirmation page
- Create `app/auth/confirm-email/page.tsx`
- Add Supabase resend confirmation API call
- Style with teal gradient (consistent with signup)

**Effort:** 1-2 hours

---

### 2. Autosave & Draft Recovery (P0) — FR-4
**Problem:** Users can lose work if they navigate away or browser crashes.

**Why MVP Blocker:** Nothing kills user trust faster than lost work.

**Solution:**
- Debounced autosave (save 2 seconds after last change)
- Visual save indicator: "Saving..." → "✓ Saved"
- Draft recovery on page reload
- Store drafts in localStorage + sync to database

**Implementation:**
```typescript
// Debounced autosave hook
const debouncedSave = useDebouncedCallback(async (data) => {
  setSaveStatus('saving')
  await saveItinerary(data)
  setSaveStatus('saved')
}, 2000)

// Visual indicator
<span className="text-sm text-neutral-500">
  {saveStatus === 'saving' && '⏳ Saving...'}
  {saveStatus === 'saved' && '✓ Saved'}
</span>
```

**Files to Modify:**
- `components/itinerary/itinerary-form.tsx`
- Add `useDebouncedCallback` from `use-debounce` package

**Effort:** 2-3 hours

---

### 3. Guided Onboarding Flow (P1) — FR-2
**Problem:** New users don't know what to do after signup.

**Solution:**
3-step onboarding (< 30 seconds, fully skippable):

**Step 1:** "What kind of traveler are you?"
```
[Solo Explorer] [Couple] [Family] [Group]
```

**Step 2:** "What brings you to Stashport?"
```
[Plan a new trip] [Browse for inspiration] [Share a past trip]
```

**Step 3:** CTA based on selection
```
[Create Your First Trip] or [Explore Featured Trips]
```

**Implementation:**
- Create `app/onboarding/page.tsx`
- Store preferences in user profile (optional)
- Skip button always visible
- Redirect from signup confirmation → onboarding → dashboard

**Effort:** 3-4 hours

---

### 4. Trip Categories / Tags (P1) — FR-6
**Problem:** No way to organize or filter trips by type.

**Solution:**
Curated tag system (not free-form):

**Initial Tags:**
```
[Adventure] [Romantic] [Budget] [Luxury] [Family] [Solo] [Food Tour] [Road Trip]
```

**Rules:**
- Max 3 tags per trip
- Tags shown on trip cards
- Filter featured itineraries by tag

**Database:**
```sql
CREATE TABLE trip_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(itinerary_id, tag)
);

CREATE INDEX idx_trip_tags_tag ON trip_tags(tag);
```

**UI:**
- Multi-select chips in trip form
- Tag pills on trip cards
- Filter dropdown on featured section

**Effort:** 3-4 hours

---

### 5. Creator Identity & Attribution (P1) — FR-9
**Problem:** Public trips feel anonymous; no trust or credibility.

**Solution:**
- Display name field (separate from email)
- Avatar (upload or initials fallback)
- "Created by [Name]" on public trip pages
- Creator info on featured itinerary cards

**Database:**
```sql
ALTER TABLE users
  ADD COLUMN display_name VARCHAR(100),
  ADD COLUMN avatar_url TEXT;
```

**UI Components:**
```tsx
// components/ui/avatar.tsx
<Avatar
  src={user.avatar_url}
  fallback={getInitials(user.display_name || user.email)}
  size="sm" | "md" | "lg"
/>

// On public trip page
<div className="flex items-center gap-2">
  <Avatar src={creator.avatar_url} size="sm" />
  <span>Created by {creator.display_name}</span>
</div>
```

**Effort:** 3-4 hours

---

### 6. Featured Itineraries (P1) — FR-10
**Problem:** No way to discover inspiring trips from others.

**Solution:** (See [FEATURED_ITINERARIES_PLAN.md](./FEATURED_ITINERARIES_PLAN.md))
- Dashboard section showing 6 random public trips
- Filter by tags
- "Stash" button to copy trips (if not own)
- Shows creator attribution

**Effort:** 6-8 hours

#### Stash Feature Specifications

**Copy vs Reference Behavior:**
- Stashing creates a **deep copy** (not a reference)
- Copied itinerary, days, and activities are independent
- Changes to source do not affect stashed copy
- Changes to stashed copy do not affect source

**Attribution:**
- Store `stashed_from_id` pointing to original itinerary ID
- If original is deleted, show "Originally stashed from a deleted trip"
- Display "Stashed from [Creator Name]" badge on stashed trip cards

**UI Differentiation:**
- Stashed trips show subtle bookmark icon overlay on card
- "Originally stashed from [Creator]" label in trip detail view
- No separate filter for stashed trips in MVP (consider for v1.1)

**Business Rules:**
- Cannot stash your own public trips (button hidden)
- Stashed trips default to private (`is_public: false`)
- Can stash the same trip multiple times (creates new copy each time)
- Stashing increments source trip's `stash_count` (for analytics, post-MVP)
- User can edit stashed trip freely (it's their copy)

---

### 7. Social Caption Generator (P1) — FR-11
**Problem:** Content creators spend time writing captions manually.

**Why Key Differentiator:** This is what makes Stashport valuable for creators.

**Solution:**
Generate platform-ready captions from trip data:

**Platforms:**
- Instagram (longer, emoji-rich)
- Twitter/X (concise, 280 chars)
- TikTok (casual, hashtag-heavy)

**UI:**
```
┌─────────────────────────────────────────────┐
│ 📱 Share to Social                          │
├─────────────────────────────────────────────┤
│ [Instagram] [Twitter] [TikTok]              │
│                                             │
│ "Day 3 in Tokyo! 🗼 Started the morning     │
│ at Senso-ji Temple, then explored           │
│ Akihabara for the best anime finds..."      │
│                                             │
│ #Tokyo #Japan #TravelJapan #TokyoTrip       │
│ #JapanTravel #Wanderlust                    │
│                                             │
│ [📋 Copy Caption] [#️⃣ Copy with Hashtags]    │
└─────────────────────────────────────────────┘
```

**Implementation (No AI Required):**
```typescript
function generateInstagramCaption(trip: Itinerary, day?: Day): string {
  const destination = trip.destination || 'adventure'
  const dayNum = day?.day_number
  const activities = day?.activities || []

  let caption = dayNum
    ? `Day ${dayNum} in ${destination}! `
    : `My ${trip.days.length}-day ${destination} itinerary! `

  if (activities.length > 0) {
    caption += activities.slice(0, 3).map(a => a.title).join(', ')
  }

  return caption
}

function generateHashtags(trip: Itinerary): string[] {
  const base = ['#Travel', '#Wanderlust', '#TravelGram']
  const destination = trip.destination?.replace(/\s+/g, '') || ''
  if (destination) {
    base.push(`#${destination}`, `#${destination}Trip`, `#Visit${destination}`)
  }
  return base
}
```

**Files to Create:**
- `lib/utils/caption-generator.ts`
- `components/itinerary/share-modal.tsx`

**Effort:** 4-5 hours

---

### 8. Dashboard Pagination (P1)
**Problem:** All itineraries load at once, degrading performance.

**Solution:**
- Show 9 cards initially (3x3 grid)
- "Load More" button
- Client-side pagination for MVP

**Implementation:**
```typescript
const PAGE_SIZE = 9
const [page, setPage] = useState(1)
const displayedTrips = itineraries.slice(0, page * PAGE_SIZE)
const hasMore = itineraries.length > displayedTrips.length
```

**Effort:** 1-2 hours

---

### 9. Trip Quick Stats (P1) — FR-7
**Problem:** Hard to quickly assess a trip's scope.

**Solution:**
Display at-a-glance stats on trip cards and public view:
```
7 days · 24 activities · Budget: $$
```

**Stats:**
- Duration (days)
- Activity count
- Optional: Budget indicator ($–$$$$)

**Implementation:**
Already have the data - just display it nicely on cards.

**Effort:** 1-2 hours

---

---

## 🟡 Post-MVP (v1.1 / v1.2)

Enhance depth after MVP validation.

---

### 10. Legal Pages & Compliance (P2)
**Problem:** OAuth providers require Privacy Policy & Terms of Service URLs. Users expect legal disclosures.

**When Needed:** Before public launch and switching OAuth apps to Production mode.

**Solution:**
Create basic legal pages using free templates:
- Privacy Policy (`/legal/privacy`)
- Terms of Service (`/legal/terms`)
- Footer links to both pages
- Optional: "By signing up, you agree to Terms" text on signup

**Implementation:**
- User provides policy text (generated from TermsFeed/GetTerms - **FREE**)
- Create `app/legal/privacy/page.tsx`
- Create `app/legal/terms/page.tsx`
- Update footer component with links
- Style for readability (clean typography, max-width content)

**Effort:** 1-2 hours

**Note:** Free templates exist - no cost required. Only pay for lawyer review after traction/revenue.

---

### 11. Custom Email Service Setup (P2)
**Problem:** Default Supabase emails send from `noreply@mail.app.supabase.io`, have rate limits, and may go to spam.

**When Needed:** Before public launch, after domain is configured.

**Why Important:**
- Professional branded emails from your domain
- Better deliverability (avoid spam folder)
- Higher rate limits (Supabase default: 3/hour)
- Custom email templates with your branding

**Recommended Service: Resend**
- Free tier: 3,000 emails/month
- $20/month for 50,000 emails
- Simple setup
- Great deliverability

**Alternative Options:**
- SendGrid (100 emails/day free)
- AWS SES (pay-as-you-go, ~$0.10 per 1000 emails)
- Postmark ($15/month for 10,000 emails)

**Implementation Steps:**
1. Sign up for email service (Resend recommended)
2. Verify your domain (add DNS records)
3. Get SMTP credentials
4. Configure in Supabase:
   - Dashboard → Project Settings → Auth → SMTP Settings
   - Add SMTP host, port, username, password
   - Set "Sender email" to `noreply@yourdomain.com`
5. Customize email templates in Supabase Auth → Email Templates:
   - Confirmation email
   - Password reset
   - Magic link (if enabled)

**Effort:** 1-2 hours

**Prerequisites:**
- ✅ Domain purchased and DNS accessible
- ✅ Email service account created

---

### 12. OAuth Production Mode Setup (P2)
**Problem:** OAuth apps are in Testing/Development mode and won't work for public users.

**When Needed:** Before public launch, **AFTER** legal pages are created.

**Prerequisites:**
- ✅ Legal pages published at your domain
- ✅ Your own domain configured (not Supabase)

**Google OAuth Steps:**
1. Go to Google Cloud Console → OAuth consent screen
2. Update branding section with:
   - Privacy Policy URL: `https://yourdomain.com/legal/privacy`
   - Terms of Service URL: `https://yourdomain.com/legal/terms`
3. Click **"Publish App"** to switch from Testing → Production
4. May require app verification (depends on scopes requested)

**Facebook App Steps:**
1. Go to Meta for Developers → Your App → Settings → Basic
2. Add Privacy Policy URL and Terms URL
3. Complete all required fields in App Review tab
4. Switch app from **Development** → **Live** mode

**Effort:** 30 minutes (after legal pages exist)

**Critical:** Don't do this until legal pages are live at your domain!

---

### 13. User Profile Settings Page (P2)
Full account management:
- Update display name
- Change avatar
- Change password
- Change email
- Delete account

**Effort:** 4-6 hours

---

### 14. Multi-Country Itineraries (P2)
Support trips spanning multiple countries:
- Junction table for countries
- Multi-select UI
- Filter by country

**Database:**
```sql
CREATE TABLE itinerary_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  visit_order INTEGER DEFAULT 0,
  UNIQUE(itinerary_id, country_code)
);
```

**Effort:** 4-6 hours

---

### 15. Multi-Day Activities (P2)
Show activities spanning multiple days:
- Add `end_day_number` field
- Display on all days with "Day 1 of 2" badge
- Visual connector between days

**Effort:** 4-6 hours

---

### 16. Itinerary Stats / Analytics (P2)
Track engagement:
- View count
- Stash count
- Display on cards: "👁️ 1.2k views · 📌 45 stashes"

**Effort:** 4-6 hours

---

### 17. Packing List (P2) — FR-12
Simple checklist tied to trip:
- Add/remove items
- Check/uncheck
- Auto-suggestions by destination (optional)

**Effort:** 3-4 hours

---

### 18. Comments on Public Trips (P2) — FR-13
Allow engagement on public itineraries:
- Authenticated users only
- Chronological list
- Delete own comments

**Effort:** 5-6 hours

---

## 🟢 Deferred (After Traction)

Higher cost or complexity features.

---

### Activity Photos (P3)
Attach photos to activities. Requires Supabase Storage setup.

**Effort:** 8-10 hours

---

### Cover Photos for Cards (P3)
Use uploaded photos as card header backgrounds.

**Effort:** 4-6 hours

---

### Video Embeds (P3)
Support YouTube/TikTok URL embeds on activities.

**Effort:** 4-6 hours

---

### Maps & Route Visualization (Deferred - Budget)
Google Maps / Mapbox integration for location autocomplete and map display.

**Why Deferred:** API costs (~$3-7 per 1000 requests) not justified until user base grows.

---

### Real-Time Collaboration (Deferred)
Multiple users editing same itinerary.

**Why Deferred:** Complex architecture, not core to MVP value prop.

---

## Edge Case Handling

### Creator Account Deletion

| Scenario | Behavior |
|----------|----------|
| User deletes account | All their itineraries deleted (CASCADE) |
| Public trip viewed after creator deleted | 404 - trip not found |
| Stashed trip's source creator deleted | Stashed copy remains, show "Originally from a deleted trip" |

### Autosave & Network Issues

| Scenario | Behavior |
|----------|----------|
| Network lost during autosave | Queue save, retry on reconnection, show "Offline - changes saved locally" |
| Browser crash mid-edit | Recover from last autosaved state (localStorage + database) |
| Conflicting edits (same trip, two tabs) | Last-write-wins with timestamp check |
| Autosave fails 3 consecutive times | Show persistent error banner, enable manual save button |
| localStorage full | Gracefully degrade to database-only saves, warn user |

### Validation & Data Integrity

| Scenario | Behavior |
|----------|----------|
| Trip with 0 days | Allow - show "Add your first day" prompt |
| Day with 0 activities | Allow - show "Add an activity" placeholder |
| Duplicate slug generated | Append random 6-char suffix (e.g., `-a1b2c3`) |
| Title exceeds 200 chars | Truncate in UI, validate max length on submit |
| Activity time overlap | Allow - user responsibility (no validation) |
| Empty required fields on publish | Block publish, highlight missing fields |

### Public Trip Edge Cases

| Scenario | Behavior |
|----------|----------|
| User unpublishes while someone viewing | Viewer sees current state, next refresh shows 404 |
| Stash while trip being edited | Stash captures point-in-time snapshot |
| Featured trip unpublished | Removed from featured on next refresh |

---

## MVP Implementation Roadmap

### Sprint 1: Foundation (P0s)
| Feature | Effort | FR |
|---------|--------|-----|
| Post-Signup Confirmation | 1-2h | FR-1 |
| Autosave & Draft Recovery | 2-3h | FR-4 |
| Dashboard Pagination | 1-2h | - |

**Sprint 1 Total:** ~5-7 hours

### Sprint 2: Discovery & Identity (P1s)
| Feature | Effort | FR |
|---------|--------|-----|
| Trip Categories/Tags | 3-4h | FR-6 |
| Creator Identity (Avatar + Name) | 3-4h | FR-9 |
| Trip Quick Stats | 1-2h | FR-7 |

**Sprint 2 Total:** ~8-10 hours

### Sprint 3: Visual Templates - KEY DIFFERENTIATOR (P0)
| Feature | Effort | FR |
|---------|--------|-----|
| Itinerary type selection (daily/guide) | 4-6h | FR-NEW |
| Cover photo upload + Supabase Storage | 3-4h | FR-NEW |
| Share modal + template picker | 4-5h | FR-11 |
| 3 templates (Clean/Bold/Minimal) | 6-8h | FR-11 |
| 3 formats (Story/Square/Portrait) | 2-3h | FR-11 |
| Client preview (html2canvas) | 3-4h | FR-11 |
| Server generation (Puppeteer) | 4-5h | FR-11 |
| Twitter/Facebook direct post | 6-8h | FR-11 |
| Instagram/TikTok share intents | 2-3h | FR-11 |

**Sprint 3 Total:** ~35-47 hours

**Design Doc:** [docs/plans/2026-01-18-visual-templates-design.md](./docs/plans/2026-01-18-visual-templates-design.md)

### Sprint 4: Engagement Features (P1s)
| Feature | Effort | FR |
|---------|--------|-----|
| Guided Onboarding Flow | 3-4h | FR-2 |
| Featured Itineraries | 6-8h | FR-10 |
| Stash functionality | 3-4h | FR-10 |

**Sprint 4 Total:** ~12-16 hours

### Sprint 5: Security & Performance (P0)
| Feature | Effort | Priority |
|---------|--------|----------|
| CSRF protection on all API routes | 2-3h | Critical |
| Rate limiting (auth + API) | 3-4h | Critical |
| Auth middleware for route protection | 2-3h | Critical |
| Fix authorization bypass in GET /api/itineraries/[id] | 1-2h | Critical |
| Security headers (CSP, HSTS, X-Frame-Options) | 1-2h | High |
| Add pagination to itineraries API | 2-3h | High |
| Implement SWR for client-side caching | 2-3h | Medium |
| Database indexes for performance | 1-2h | High |

**Sprint 5 Total:** ~16-22 hours

**Full Audit Report:** See Security & Performance Audit section below.

### Sprint 6: Design Refinement (Final Polish)
| Feature | Effort | Notes |
|---------|--------|-------|
| UI/UX polish based on user feedback | 4-6h | After user testing |
| Animation refinements | 2-3h | Micro-interactions |
| Mobile responsiveness audit | 2-3h | All breakpoints |

**Sprint 6 Total:** ~8-12 hours

---

## MVP Checklist

### Foundation
- [ ] Signup confirmation clarity (P0)
- [ ] Autosave & draft recovery (P0)
- [ ] Dashboard pagination (P1)

### Discovery & Identity
- [ ] Trip categories / tags (P1)
- [ ] Creator identity (avatar + name) (P1)
- [ ] Trip quick stats (P1)

### Visual Templates (Key Differentiator)
- [ ] Itinerary type selection (daily vs guide)
- [ ] Cover photo upload
- [ ] Share modal with template picker
- [ ] 3 templates × 3 formats
- [ ] Client preview + server generation
- [ ] Twitter/Facebook direct posting
- [ ] Instagram/TikTok share intents

### Engagement
- [ ] Guided onboarding flow (P1)
- [ ] Featured itineraries (P1)
- [ ] Stash functionality (P1)

### Security & Performance
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Auth middleware
- [ ] Security headers
- [ ] API pagination
- [ ] Client-side caching (SWR)

### Final Polish
- [ ] Design refinement pass
- [ ] Mobile responsiveness audit

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Pagination | 9 cards + Load More | Good balance |
| Multi-day activities | Show on all days | Better visibility |
| Maps/Location | Deferred | API costs |
| Visual Templates | MVP priority | Key differentiator for travel creators |
| Template rendering | Hybrid (client preview + server download) | Best UX + quality |
| Instagram posting | Share Intent | API requires Business account |
| Twitter/Facebook | Direct API | Easier approval, works for all accounts |
| Itinerary types | daily + guide | Flexibility for different creator styles |

---

## Success Metrics (from PRD)

MVP is successful when:
- Users complete and publish trips
- Trips are shared externally
- Caption generator shows regular usage
- Users return to create multiple trips

---

## Analytics & Tracking Plan

### Core Metrics

| Metric | Definition | Target | Tracking Method |
|--------|------------|--------|-----------------|
| First trip completion | % users who finish creating first trip | >70% | DB: trips with ≥1 day |
| Time to first trip | Minutes from signup to first trip saved | <10 min | Timestamp diff |
| Public share rate | % of trips set to public | >40% | DB: is_public counts |
| Caption copy rate | % of public trips where caption copied | >30% | Client event |
| Repeat creation | % users creating 2+ trips | >25% | DB: user trip counts |

### Event Tracking (MVP - Client-side)

```typescript
// Priority events to implement
trackEvent('trip_created', { tripId, dayCount, activityCount })
trackEvent('trip_published', { tripId })
trackEvent('trip_unpublished', { tripId })
trackEvent('caption_copied', { platform: 'instagram'|'twitter'|'tiktok', tripId })
trackEvent('stash_completed', { sourceId, newTripId })
trackEvent('featured_trip_clicked', { tripId, position })
trackEvent('onboarding_completed', { travelerType, intent })
trackEvent('onboarding_skipped', { step })
```

### Database Columns for Analytics (Post-MVP)

```sql
-- Add to itineraries table
ALTER TABLE itineraries ADD COLUMN view_count INTEGER DEFAULT 0;
ALTER TABLE itineraries ADD COLUMN stash_count INTEGER DEFAULT 0;

-- Add to users table (or compute)
-- users.trip_count can be computed via query
```

### Implementation Notes

- MVP: Simple client-side event logging (console or localStorage)
- Post-MVP: Integrate PostHog, Mixpanel, or Plausible
- Privacy: No PII in events, aggregate only

---

## Performance Requirements

### Core Web Vitals Targets

| Metric | Target | Tool |
|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |

### Feature-Specific Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Dashboard load (50 trips) | < 3s | With pagination |
| Featured itineraries API | < 500ms | Server response |
| Autosave operation | < 1s | Background, non-blocking |
| Stash operation | < 2s | Full deep copy |
| Public trip page load | < 2s | Including nested data |

### Optimization Strategies

- **Pagination:** 9 cards initially, load more on demand
- **Lazy loading:** Trip cards below fold
- **Optimistic UI:** Show "Saving..." immediately, sync in background
- **Caching:** Featured itineraries cached 5 minutes (client-side)
- **Debouncing:** Autosave triggers 2s after last keystroke
- **Code splitting:** Dynamic imports for modals and non-critical components

---

## Security & Performance Audit

**Audit Date:** 2026-01-18
**Overall Security Score:** 6.5/10
**Overall Performance Score:** 7/10

### Critical Security Issues (Must Fix)

| Issue | Severity | Location | Fix |
|-------|----------|----------|-----|
| No CSRF protection | Critical | All API routes | Add CSRF token validation |
| No rate limiting | Critical | All endpoints | Implement @upstash/ratelimit |
| Authorization bypass | Critical | GET /api/itineraries/[id] | Add auth + ownership check |
| Missing middleware | High | No middleware.ts | Create route protection middleware |
| No security headers | High | next.config.ts | Add CSP, HSTS, X-Frame-Options |

### Performance Issues

| Issue | Impact | Location | Fix |
|-------|--------|----------|-----|
| N+1 query pattern | High | GET /api/itineraries | Add pagination, limit nested data |
| Missing indexes | High | Database | Add indexes on user_id, slug, itinerary_id |
| No client caching | Medium | Dashboard | Implement SWR with caching |
| Inefficient updates | Medium | PUT /api/itineraries/[id] | Use upsert instead of delete+insert |

### Security Fixes (Code Examples)

**CSRF Protection:**
```typescript
// Validate origin header on mutations
function validateCSRF(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL]
  return origin && allowedOrigins.includes(origin)
}
```

**Rate Limiting:**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
})
```

**Auth Middleware:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/itinerary/:path*'],
}
```

### Database Indexes to Add

```sql
CREATE INDEX idx_itineraries_user_id_created_at
  ON itineraries(user_id, created_at DESC);

CREATE INDEX idx_itineraries_slug
  ON itineraries(slug) WHERE is_public = true;

CREATE INDEX idx_days_itinerary_id
  ON days(itinerary_id, day_number);

CREATE INDEX idx_activities_day_id
  ON activities(day_id);
```

### Positive Findings

- TypeScript strict mode enabled
- Zod input validation on all forms
- Supabase RLS policies in place
- No hardcoded secrets
- UUID primary keys (non-sequential)
- No eval() or dangerouslySetInnerHTML

---

**Last Updated:** January 2026
**Status:** MVP-Focused Backlog
**Aligned With:** stashport_mvp_scope.md, stashport_prd.md
