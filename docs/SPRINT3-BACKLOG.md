# Sprint 3 Backlog

**Created:** 2026-01-21
**Status:** Planning

---

## High Priority

### BUG-001: Cover Photo Not Displaying After Upload
**Status:** 🔴 Critical
**Type:** Bug
**Component:** Trip Card, Itinerary Form

**Description:**
After uploading a cover photo, it doesn't display in:
1. Trip card on dashboard
2. Edit form when reopening the same itinerary

**Steps to Reproduce:**
1. Create/edit itinerary
2. Upload cover photo via CoverUpload component
3. Save itinerary
4. Return to dashboard → cover photo not shown on trip card
5. Edit same itinerary → cover photo not shown in form

**Evidence:**
- Upload API works (logs show successful upload to Supabase Storage)
- URL returned: `https://aeudkpniqgwvqbgsgogg.supabase.co/storage/v1/object/public/itinerary-covers/...`
- Data appears to be saved but not retrieved/displayed

**Files to Check:**
- `components/itinerary/trip-card.tsx` - Trip card display
- `components/itinerary/cover-upload.tsx` - Form display logic
- `app/api/itineraries/route.ts` - Check if cover_photo_url in SELECT
- `app/api/itineraries/[id]/route.ts` - Check GET endpoint

**Acceptance Criteria:**
- [ ] Cover photo displays on trip card after upload
- [ ] Cover photo displays in edit form when reopening itinerary
- [ ] Cover photo persists across page refreshes

---

### UX-001: Tag Selector Limit Not Communicated
**Status:** 🟡 Medium
**Type:** UX Enhancement
**Component:** TagSelector

**Description:**
TagSelector has a 3-tag maximum limit (enforced in code), but users aren't informed of this limit. They only discover it when attempting to select a 4th tag.

**Current Behavior:**
- Limit exists (`max={3}` in code)
- Enforcement works (prevents 4th selection)
- No visual indicator or message

**Desired Behavior:**
- Show "Select up to 3 tags" helper text
- Optionally show "3/3 selected" counter
- Possibly disable unselected tags when limit reached

**Files to Update:**
- `components/ui/tag-selector.tsx`

**Acceptance Criteria:**
- [ ] User sees "Select up to 3 tags" text before/during selection
- [ ] Clear feedback when limit is reached
- [ ] Accessible (screen reader friendly)

---

### FEATURE-001: Guide Type Display Structure
**Status:** 🟡 Medium
**Type:** Feature Enhancement
**Component:** Itinerary Form, Trip Display

**Description:**
"Share My Favorites" (guide type) currently shows daily itinerary structure (Day 1, Day 2, etc.), which doesn't make sense for category-based guides.

**Current State:**
- Both `'daily'` and `'guide'` types use same day-based structure
- TypeSelector exists and saves type correctly
- Display logic doesn't differentiate

**Desired State:**
- `'daily'` (Plan My Trip) → Day-based structure (Day 1, Day 2...)
- `'guide'` (Share My Favorites) → Category-based structure (Where to Eat, What to See, Hidden Gems, etc.)

**Implementation Notes:**
- User mentioned possible hybrid approach for future
- May want to defer this or implement basic version
- Consider template system in `lib/constants/templates.ts`

**Files to Update:**
- `components/itinerary/itinerary-form.tsx` - Form structure
- `app/t/[slug]/page.tsx` - Public display
- Database schema may need category field

**Acceptance Criteria:**
- [ ] Guide type shows category-based sections instead of days
- [ ] Daily type continues to show day-based structure
- [ ] Both types save and display correctly
- [ ] Type selection persists

**Deferred Decision:**
- Hybrid approach (TBD by user later)

---

## Medium Priority

### TECH-001: Missing API Logging
**Status:** 🟡 Medium
**Type:** Technical Debt
**Component:** API Routes

**Description:**
Most API routes lack the logging standards defined in `CLAUDE.md`. Only `/api/upload/cover` has proper `[API]` prefixed logs.

**Current State:**
- `/api/upload/cover` ✓ Has proper logging
- `/api/itineraries` (GET, POST) ✗ No logs
- `/api/itineraries/[id]` (GET, PUT) ✗ No logs
- Missing `[API]`, `[DB]`, `[Form]` prefixed logs

**Impact:**
- Harder to debug issues in production
- Can't monitor API performance server-side
- Inconsistent with coding standards

**Files to Update:**
- `app/api/itineraries/route.ts`
- `app/api/itineraries/[id]/route.ts`
- Any other API routes

**Pattern to Follow:**
```typescript
console.log('[API] POST /api/itineraries - Request received')
console.log('[API] POST /api/itineraries - Payload:', { title, daysCount, userId })
console.log('[API] POST /api/itineraries - Created:', { id, slug })
console.error('[API] POST /api/itineraries - Error:', error.message)
```

**Acceptance Criteria:**
- [ ] All API routes log entry point
- [ ] All routes log key data (sanitized)
- [ ] All routes log success/error outcomes
- [ ] Follows `[API]` prefix convention from CLAUDE.md

---

### PERF-001: Dashboard API Performance
**Status:** 🟢 Low
**Type:** Performance
**Component:** Dashboard API

**Description:**
Dashboard `/api/itineraries` calls are taking ~1 second per request, causing slower page loads.

**Evidence from Logs:**
```
GET /api/itineraries 200 in 1057ms (compile: 3ms, render: 1054ms)
GET /api/itineraries 200 in 1091ms (compile: 3ms, render: 1088ms)
```

**Possible Causes:**
- Pagination query not optimized
- Missing database indexes
- N+1 query problem
- Fetching too much data

**Investigation Needed:**
- Check query in `app/api/itineraries/route.ts`
- Review Supabase query performance
- Check if relations are being loaded efficiently

**Files to Check:**
- `app/api/itineraries/route.ts`

**Acceptance Criteria:**
- [ ] Dashboard API responds in <500ms
- [ ] Query optimized with proper indexes
- [ ] No unnecessary data fetched

---

## Backlog Summary

| Priority | Count | Issues |
|----------|-------|--------|
| 🔴 High  | 3     | BUG-001, UX-001, FEATURE-001 |
| 🟡 Medium| 1     | TECH-001 |
| 🟢 Low   | 1     | PERF-001 |
| **Total**| **5** | |

---

## Notes

- All issues discovered during testing session on 2026-01-21
- Server logs show no application errors (all 200/201 responses)
- TypeSelector and CoverUpload components working functionally
- Main issues are display/UX related, not data persistence

---

## Next Steps

1. Prioritize and assign issues
2. Fix BUG-001 (cover photo display) first
3. Add UX-001 (tag limit message) - quick win
4. Evaluate FEATURE-001 scope (guide vs daily structure)
5. Add logging (TECH-001) to all API routes
6. Investigate PERF-001 if time permits
