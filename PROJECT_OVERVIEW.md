# Stashport - Project Overview

**Travel itinerary planning and sharing platform**

## What is Stashport?

Stashport helps travelers create, organize, and share beautiful travel itineraries. Users can:
- Create detailed day-by-day trip plans or curated destination guides
- Upload cover photos and customize their trips with tags and budget levels
- Share trips publicly with unique URLs or keep them private
- Generate platform-ready images for social media sharing
- Discover trips from other travelers for inspiration

---

## Current Status

**Version:** 0.9.3 (Beta)
**Last Updated:** January 25, 2026
**Deployment Readiness:** 85%

| Sprint | Status | Key Deliverables |
|--------|--------|------------------|
| Sprints 1-3 | Complete | Core platform, authentication, visual templates |
| Sprint 3.5 | Complete | UX polish, Web Share API, keyboard shortcuts |
| Sprint 3.5 Extension | Complete | Explore section, guide type UI |
| Sprint 4 (Current) | In Progress | Dashboard redesign, personalized recommendations |

See `roadmap.html` for detailed progress tracking.

---

## Core Features

### Trip Creation & Management
- **Daily Itineraries**: Day-by-day trip planning with dates, activities, and notes
- **Guide Itineraries**: Curated collections organized by sections (restaurants, attractions, etc.)
- **Cover Photos**: Upload custom cover images (drag-and-drop, max 5MB)
- **Trip Tags**: 8 predefined tags (Adventure, Romantic, Budget, Luxury, Family, Solo, Food Tour, Road Trip)
- **Budget Levels**: 4-tier system ($, $$, $$$, $$$$)
- **Autosave**: Automatic draft saving with recovery

### Sharing & Discovery
- **Public Trips**: Shareable via unique URLs (`/t/[slug]`)
- **Visual Sharing**: Generate images in 3 styles (Clean, Bold, Minimal) and 3 formats (Story, Square, Portrait)
- **Web Share API**: Native mobile sharing to Instagram, WhatsApp, etc.
- **Explore Section**: Discover public trips from other travelers with personalized recommendations

### User Experience
- **Responsive Design**: Mobile-first, works on all devices
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Smooth Animations**: Editorial magazine aesthetic with micro-interactions
- **Keyboard Shortcuts**: Power-user features on share page (1-3 for styles, S/Q/P for formats)

---

## Dashboard (Current Sprint - Redesign)

The dashboard is being redesigned from a tab-based layout to a unified magazine-style experience:

### New Layout Structure
| Section | Description | Data Source |
|---------|-------------|-------------|
| **Hero Header** | Personalized greeting with wave background | User profile |
| **Upcoming Trips** | 2 large horizontal cards (smart hybrid: upcoming first, recent fallback) | User's trips |
| **Suggested for You** | 3 recommendation cards (tag + destination matching) | Explore API |
| **My Favorites** | Sidebar placeholder for future saved spots feature | Coming soon |

### Personalized Recommendations
- **Tag-based**: If user has "Beach" trips, suggest similar explore trips
- **Destination-based**: If user has trips to "Japan", suggest Asia region trips
- **Fallback**: Show popular/recent explore trips for new users
- **Future**: Search history-based recommendations

---

## User Flows

### New User Journey
1. Sign up with email or OAuth (Google/Facebook)
2. Confirm email (if email signup)
3. Land on dashboard with empty state + "Create First Trip" CTA
4. Create trip → choose type (daily/guide) → add details → save
5. Optional: Make trip public and share

### Returning User Journey
1. Login → Dashboard with personalized greeting
2. See upcoming trips and recommendations
3. Create new trip or browse explore section
4. Edit existing trips or share via visual templates

### Sharing Flow
1. From trip card → Navigate to share page (`/itinerary/[id]/share`)
2. Select template style and format
3. Preview updates in real-time
4. Download PNG or use native share (mobile)

---

## Design Philosophy

### Editorial + Modern Aesthetic
- **Typography**: Playfair Display (headlines), Space Grotesk (UI), Source Sans Pro (body)
- **Colors (App)**: Coral (#f86f4d) primary, Teal (#14b8a6) secondary, Cream (#fffaf5) background
- **Colors (Landing/Auth)**: "Sunlit Voyage" theme - Terracotta (#e07a5f), Sage (#6b7b5f), Warm Sand (#fdfcfa)
- **Animations**: Purposeful micro-interactions with reduced-motion support

### Accessibility First
- WCAG AA compliant throughout
- Keyboard navigation on all pages
- High contrast ratios for readability
- Semantic HTML structure

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth (Email, OAuth) |
| **Storage** | Supabase Storage (cover photos) |
| **Validation** | Zod |
| **UI Libraries** | @dnd-kit, Radix UI, Lucide Icons |
| **Image Generation** | Puppeteer + @sparticuz/chromium |

---

## Roadmap Summary

### Completed
- Core CRUD operations
- Authentication (email + OAuth)
- Visual template sharing
- Explore section
- Guide type itineraries

### Current (Sprint 4)
- Dashboard redesign (magazine layout)
- Personalized recommendations
- Favorites placeholder

### Upcoming
- Stash/Save functionality
- Social caption generator
- User profile settings
- Itinerary stats (views, stashes)

### Deferred (Post-MVP)
- Activity photos
- Maps integration
- Real-time collaboration
- Comments on public trips

---

## Documentation

| Document | Purpose |
|----------|---------|
| `PROJECT_OVERVIEW.md` | Business features & product vision (this file) |
| `ARCHITECTURE.md` | Technical implementation details |
| `CLAUDE.md` | Development guide & code patterns |
| `roadmap.html` | Visual progress dashboard |
| `docs/CURRENT-SPRINT.md` | Active sprint implementation plan |

---

**Last Updated:** January 25, 2026
