# Visual Templates for Social Media Sharing

**Date:** 2026-01-18
**Status:** Approved
**Priority:** P0 - Key Differentiator
**Estimated Effort:** 35-45 hours

---

## Overview

Enable users to share their itineraries to social media using beautiful, engaging visual templates. Users select a template style and format, preview it live, and download a high-quality image to post on Instagram, Facebook, Twitter, or TikTok.

This is Stashport's **key differentiating feature** - turning itinerary data into shareable visual content.

---

## Goals

1. Make sharing itineraries visually compelling
2. Support both daily itineraries AND categorical guides
3. Work with or without user-uploaded photos
4. Enable direct posting to Twitter/Facebook, share intents for Instagram/TikTok
5. Set foundation for future PRO customization features

---

## Data Structure Changes

### New Itinerary Type

```typescript
type ItineraryType = 'daily' | 'guide'

interface Itinerary {
  // ... existing fields
  type: ItineraryType           // NEW
  cover_photo_url: string | null // NEW
}
```

### New Tables for Guide Type

```sql
-- Add to itineraries
ALTER TABLE itineraries
  ADD COLUMN type VARCHAR(10) DEFAULT 'daily',
  ADD COLUMN cover_photo_url TEXT;

-- Categories (for guide type)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '📍',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category items
CREATE TABLE category_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  location VARCHAR(200),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_itinerary_id ON categories(itinerary_id);
CREATE INDEX idx_category_items_category_id ON category_items(category_id);
```

---

## User Experience

### Creating: Type Selection (Visual Cards)

When user clicks "Create New", show two visual cards:

| Card | Label | Description |
|------|-------|-------------|
| Daily | "Plan My Trip" | Day-by-day with times & schedule |
| Guide | "Share My Favorites" | Curated recommendations without dates |

No dropdown - user clicks the card that matches their intent.

### Creating: Cover Photo Upload

Optional cover photo field in the create/edit form:
- Appears after destination field
- Helper text: "This will be your share image background"
- Accepts: JPEG, PNG, WebP (max 5MB)
- Stored in Supabase Storage: `itinerary-covers/{user_id}/{itinerary_id}/cover.{ext}`

### Sharing: Template Modal

```
┌─────────────────────────────────────────────────┐
│  Share "Tokyo Adventure"                    ✕   │
├─────────────────────────────────────────────────┤
│  Choose a template:                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Clean   │  │  Bold   │  │ Minimal │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                 │
│  Format:  [Story 9:16]  [Post 1:1]  [Post 4:5] │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         << LIVE PREVIEW >>              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Post to Twitter] [Post to Facebook]          │
│  [Share to Instagram] [Share to TikTok]        │
│  [Download Image]                              │
└─────────────────────────────────────────────────┘
```

---

## Templates

### MVP Templates (3 styles)

| Template | Background | Text | Best For |
|----------|------------|------|----------|
| **Clean** | White/cream | Stashport colors | Professional, blogs |
| **Bold** | Photo or gradient | White overlay | Instagram, eye-catching |
| **Minimal** | Subtle gray | Dark text | Pinterest, clean aesthetic |

### Formats

| Format | Dimensions | Ratio | Platform |
|--------|-----------|-------|----------|
| Story | 1080×1920 | 9:16 | Instagram/TikTok Stories |
| Square | 1080×1080 | 1:1 | Instagram Feed |
| Portrait | 1080×1350 | 4:5 | Instagram Feed (more space) |

### Background Handling

- If cover photo uploaded → Use as background (with overlay for readability)
- If no photo → Use gradient matching Stashport palette (coral/teal)

---

## Technical Implementation

### Rendering Approach: Hybrid

| Phase | Technology | Purpose |
|-------|------------|---------|
| Preview | html2canvas (client) | Fast, interactive preview |
| Download | Puppeteer (server) | High-quality, consistent output |

### Social Media Integration

| Platform | Method | API Required |
|----------|--------|--------------|
| Twitter/X | Direct API post | Yes - OAuth 2.0 |
| Facebook | Direct API post | Yes - Graph API |
| Instagram | Share Intent | No - opens app |
| TikTok | Share Intent | No - opens app |

### Files to Create

```
components/
  itinerary/
    share-modal.tsx           # Main share modal
    template-preview.tsx      # Live preview component
    cover-upload.tsx          # Cover photo upload
    type-selector.tsx         # Daily vs Guide selection

lib/
  templates/
    clean.tsx                 # Clean template
    bold.tsx                  # Bold template
    minimal.tsx               # Minimal template
    base.tsx                  # Shared template utilities

app/
  api/
    share/
      generate/route.ts       # Server-side image generation
    upload/
      cover/route.ts          # Cover photo upload handler
    social/
      twitter/route.ts        # Twitter OAuth + post
      facebook/route.ts       # Facebook OAuth + post

lib/
  utils/
    image-generator.ts        # Puppeteer rendering
    social-auth.ts            # OAuth utilities
```

---

## MVP Scope

### Included

- Itinerary type selection (daily/guide) with visual cards
- Cover photo upload to Supabase Storage
- Share modal with template picker
- 3 templates (Clean, Bold, Minimal)
- 3 formats (Story, Square, Portrait)
- Client-side preview (html2canvas)
- Server-side generation (Puppeteer)
- Direct post to Twitter/Facebook
- Share intents for Instagram/TikTok
- Download image button

### Excluded (Future/PRO)

- Custom colors/fonts (Canva-like editor)
- Multiple photos per day
- Video/animation export
- Template marketplace
- AI-generated captions
- Direct Instagram posting (requires Business account)

---

## Effort Breakdown

| Task | Estimate |
|------|----------|
| Itinerary type selection UI | 4-6h |
| Cover photo upload + storage | 3-4h |
| Share modal + template picker | 4-5h |
| 3 templates × 3 formats | 6-8h |
| Client preview (html2canvas) | 3-4h |
| Server generation (Puppeteer) | 4-5h |
| Twitter/Facebook API integration | 6-8h |
| Share intents (Instagram/TikTok) | 2-3h |
| Testing + polish | 3-4h |
| **Total** | **35-47h** |

---

## Success Metrics

- % of users who use share feature after creating itinerary
- Download count per template style
- Social post completion rate (for direct posting)
- Template preference distribution

---

## Future Enhancements (Post-MVP)

1. **PRO Customization**: Canva-like editor for colors, fonts, layout
2. **More Templates**: Seasonal, destination-specific, trending styles
3. **Instagram Direct Post**: For Business/Creator accounts
4. **Video Export**: Animated slideshows for Reels/TikTok
5. **Template Analytics**: Which templates perform best on social

---

**Approved:** 2026-01-18
