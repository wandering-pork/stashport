# Featured Itineraries Implementation Plan

## Overview
Add a "Featured Itineraries" section to the dashboard that displays 6 random public itineraries from all users. Users can view any featured itinerary and "Stash" (copy) itineraries from other users to their own collection.

## Requirements
- Display 6 random public itineraries
- Include user's own public itineraries (so they know they're featured)
- Click navigates to public view `/t/[slug]`
- Show "Stash" button only for non-owned itineraries
- Stashed itineraries are copied to user's trips as private

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| CREATE | `app/api/itineraries/featured/route.ts` | Fetch random public itineraries |
| CREATE | `app/api/itineraries/stash/route.ts` | Copy itinerary to user's trips |
| CREATE | `components/itinerary/featured-trip-card.tsx` | Card for featured itineraries |
| MODIFY | `app/dashboard/page.tsx` | Add Featured section |

---

## Implementation Steps

### Step 1: Create Featured API Endpoint
**File:** `app/api/itineraries/featured/route.ts`

- GET endpoint returning 6 random public itineraries
- Include nested days and activities
- Return `currentUserId` for ownership check on frontend
- Use client-side shuffle (fetch 50, shuffle, take 6)

### Step 2: Create Stash API Endpoint
**File:** `app/api/itineraries/stash/route.ts`

- POST endpoint accepting `{ sourceId: string }`
- Require authentication
- Verify source is public before copying
- Deep copy: itinerary, days, activities
- Set `stashed_from_id` to source ID
- Generate new unique slug
- Default to `is_public: false`

### Step 3: Create FeaturedTripCard Component
**File:** `components/itinerary/featured-trip-card.tsx`

- Similar to TripCard but for featured display
- Props: `trip`, `isOwn`, `onView`, `onStash`, `isStashing`
- Show "Your trip" badge if user owns it
- Show Stash button (BookmarkPlus icon) only if not owned
- Loading state for stashing action

### Step 4: Update Dashboard
**File:** `app/dashboard/page.tsx`

Add state:
- `featuredItineraries` - array of featured trips
- `currentUserId` - for ownership check
- `featuredLoading` - loading state
- `stashingId` - track which trip is being stashed

Add functions:
- `fetchFeatured()` in useEffect
- `handleStash(itinerary)` to call stash API

Add section (before existing sections):
- "Featured Adventures" header with Sparkles icon
- 3-column grid of FeaturedTripCard components
- Staggered animation delays

### Step 5: Add Success Feedback
- Simple toast notification on successful stash
- Auto-dismiss after 3 seconds

---

## Verification
1. Run `npm run dev` and navigate to dashboard
2. Verify Featured section shows 6 public itineraries
3. Verify user's own trips show "Your trip" badge (no Stash button)
4. Click a featured trip - should navigate to `/t/[slug]`
5. Click Stash on another user's trip - should copy to your trips
6. Verify stashed trip appears in your Private Collection
7. Verify stashed trip has correct data and is private
