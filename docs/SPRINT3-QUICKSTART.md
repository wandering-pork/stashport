# Sprint 3 Quick Start Guide

## Current State
- **Phase 1 Complete:** Database migration applied, TypeScript types updated
- **Build Status:** Not verified yet - run `npm run build` first

## Immediate Next Steps

### 1. Verify Build
```bash
npm run build
```

### 2. Create Storage Bucket
In Supabase Dashboard (project: stashport):
- Create bucket: `itinerary-covers`
- Public: Yes
- File size limit: 5MB
- Allowed MIME: image/jpeg, image/png, image/webp

### 3. Start Phase 2 - UI Components
Create in order:
1. `components/itinerary/type-selector.tsx`
2. `components/itinerary/cover-upload.tsx`
3. `components/itinerary/share-modal.tsx`
4. `components/itinerary/template-preview.tsx`

## Key Files Modified

```
lib/types/models.ts          # Added ItineraryType, Category interfaces
lib/supabase/database.types.ts  # Added type, cover_photo_url, categories
lib/constants/templates.ts   # NEW - Template styles, formats, colors
```

## Database Changes Applied

```sql
-- New columns on itineraries
type VARCHAR(10) DEFAULT 'daily'
cover_photo_url TEXT

-- New tables
categories (id, itinerary_id, name, icon, sort_order, created_at)
category_items (id, category_id, title, location, notes, sort_order, created_at)
```

## Design Patterns to Follow

- Use existing UI components from `components/ui/`
- Follow component template in CLAUDE.md
- Add `[Component]` log prefixes
- Use `cn()` for conditional classes
- Mark client components with `'use client'`

## Full Plan Location
`docs/HANDOVER-2026-01-20-SPRINT3.md`
