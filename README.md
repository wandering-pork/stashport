# Stashport 🧳

Your travel itinerary passport. Collect and share beautiful travel itineraries. Stash trips you love, create your own, and share them everywhere.

**Version:** 0.8.0 (Beta)
**Status:** Phase 1-4 ✅ Complete | Features Development 🚀
**Build:** Zero Errors | TypeScript Strict Mode | WCAG AA Accessible

---

## About Stashport

Stashport is a vlogger-first travel platform designed for content creators to:
- Create beautiful, shareable travel itineraries
- Instantly post to Instagram, TikTok, Twitter & YouTube with auto-generated captions
- "Stash" (save) trips they love from other creators
- Build their travel content audience

### Core Features

- ✅ **Plan Every Detail** - Build day-by-day itineraries with times, locations, notes
- ✅ **Share to Social** - Generate platform-ready captions for Instagram, TikTok, Twitter, YouTube
- ✅ **Stash & Customize** - One-click save any public trip to your collection and modify it
- ✅ **Beautiful Links** - Share clean preview cards that look great on all platforms
- 🚀 **Coming:** Public itinerary discovery, calendar export, advanced analytics

---

## Tech Stack

### Frontend
- [Next.js 16](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Strict type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Zod](https://zod.dev/) - Runtime schema validation
- [Lucide Icons](https://lucide.dev/) - Iconography

### Backend & Database
- [Supabase](https://supabase.com/) - PostgreSQL + Auth + RLS
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering) - Server-side authentication

### Development
- [ESLint](https://eslint.org/) - Code quality
- [Turbopack](https://turbo.build/pack) - Next.js build engine

---

## Project Status

### ✅ Phases 1-4: Complete

**Phase 1-4 delivered a comprehensive design system foundation and working itinerary management platform:**

- ✅ Database schema (users, itineraries, days, activities)
- ✅ Row Level Security (RLS) & authentication
- ✅ OAuth (Google, Facebook) + Email/password auth
- ✅ Full itinerary CRUD operations
- ✅ Responsive design system with 3-tier typography
- ✅ 15+ animations & micro-interactions
- ✅ WCAG AA accessibility compliance
- ✅ Mobile-first responsive design
- ✅ Public/private trip sharing
- ✅ Public trip discovery pages

**See:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for complete phase-by-phase breakdown

### 📋 Current Development: Feature Expansion

**Now building additional features for community & discovery:**

- 🚀 **Featured Itineraries** - Random public itineraries on dashboard + Stash functionality
- 📋 **Trip Discovery** - Browse public trips by destination
- 📋 **Social Sharing** - Auto-generated captions for social platforms
- 📋 **User Profiles** - Public user pages & trip collections
- 📋 **Analytics** - View counts, engagement metrics

**See:** [FEATURED_ITINERARIES_PLAN.md](./FEATURED_ITINERARIES_PLAN.md) for next feature

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd stashport

# Install dependencies
npm install

# Configure environment variables
# Copy .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-url
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Development Commands

```bash
npm run dev      # Start dev server (with hot reload)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## Project Structure

```
stashport/
├── app/
│   ├── auth/                 # Authentication pages
│   │   ├── login/page.tsx    # Login page
│   │   ├── signup/page.tsx   # Signup page
│   │   └── callback/         # OAuth callback (Phase 2)
│   ├── dashboard/            # User dashboard
│   ├── layout.tsx            # Root layout with header
│   └── page.tsx              # Landing page
│
├── components/
│   ├── layout/
│   │   ├── header.tsx        # Navigation header
│   │   └── layout-wrapper.tsx # Client boundary
│   └── ui/
│       ├── button.tsx        # Button component
│       ├── card.tsx          # Card component
│       └── input.tsx         # Input component with labels
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   ├── server.ts         # Server Supabase client
│   │   └── database.types.ts # Auto-generated database types
│   ├── types/
│   │   └── models.ts         # TypeScript data models
│   └── utils/
│       ├── validation.ts     # Zod schemas for forms
│       └── mock-data.ts      # Mock data for development
│
├── .env.local                     # Environment variables (not in git)
├── database-schema.sql            # SQL schema reference
├── README.md                      # This file (start here!)
├── IMPLEMENTATION_SUMMARY.md      # Phase 1-4 complete breakdown
├── DESIGN_SYSTEM.md               # Design tokens & components
├── PROJECT_OVERVIEW.md            # Project context & features
├── FEATURED_ITINERARIES_PLAN.md   # Next feature plan
├── ROADMAP.md                     # Future features
└── GETTING_STARTED.md             # Setup guide
```

---

## Database Schema

### Tables
- **users** - User profiles linked to Supabase Auth
- **itineraries** - Travel trips/plans
- **days** - Individual days within itineraries
- **activities** - Activities within days

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own private data
- Public itineraries visible to everyone
- Service role key for server operations only

**See:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#phase-comparison) for detailed schema

---

## Configuration

### Environment Variables

**Required (Phase 1):**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Optional (Phase 2):**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

Store these in `.env.local` (never commit to git).

---

## Development Workflow

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- No console.log() for sensitive data
- Password validation: 8+ chars, uppercase, lowercase, number, special char

### Type Safety
- All database operations are type-safe via `database.types.ts`
- Zod for runtime validation of user input
- React hooks typed with proper generics

### Components
- Mix of Server and Client Components (Next.js best practices)
- UI components in `components/ui/` (shadcn-inspired)
- Reusable layout components in `components/layout/`
- Accessibility: WCAG 2.1 compliant (labels, ARIA, semantic HTML)

---

## Testing

### Manual Testing

1. **Landing Page** - `npm run dev` → http://localhost:3000
2. **Login/Signup** - Test form validation and error handling
3. **Dashboard** - Shows mock trips (will use real data in Phase 2)
4. **Build** - `npm run build` → Should show ✓ Compiled successfully

### Type Checking
```bash
npx tsc --noEmit
```

---

## Common Tasks

### Add a New Page
1. Create folder in `app/` with `page.tsx`
2. Component should be marked with `'use client'` if interactive
3. Import types from `lib/types/models.ts`
4. Add to navigation if needed (Header component)

### Add a New UI Component
1. Create in `components/ui/`
2. Export as named export
3. Include TypeScript interfaces for props
4. Add to `components/ui/index.ts` if creating barrel export

### Update Database Schema
1. Edit `database-schema.sql`
2. Run updated SQL in Supabase SQL Editor
3. Re-generate types: Check Supabase documentation
4. Update `lib/types/models.ts` accordingly

### Create a New Validation Schema
1. Add to `lib/utils/validation.ts`
2. Use Zod for schema definition
3. Export inferred TypeScript type with `z.infer<typeof schema>`
4. Use in form pages with `.safeParse()`

---

## Troubleshooting

### Build Fails with TypeScript Errors
```bash
npm run build
# Check output for specific errors
# Most likely: schema mismatch between database.types.ts and models.ts
```

### Supabase Connection Issues
1. Check `.env.local` has correct credentials
2. Verify Supabase project is running (check dashboard)
3. Ensure RLS policies allow your user

### Styling Issues
Tailwind CSS should auto-reload in dev mode. If not:
```bash
npm run dev  # Restart dev server
```

---

## Security Checklist

- ✅ Passwords validated with 8+ chars, complexity requirements
- ✅ Passwords not logged to console
- ✅ Service role key only in `.env.local` (not in code)
- ✅ Row Level Security (RLS) enforces data isolation
- ✅ OAuth secrets stored securely in environment
- ✅ Input validation with Zod on all forms
- ✅ TypeScript for type safety

---

## Performance

- Next.js static generation for landing pages
- Automatic code splitting
- Tailwind CSS purging unused styles
- Image optimization with Next.js Image component
- Database indexes on frequently queried columns

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zod Docs](https://zod.dev)

### Project Documentation
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Complete Phase 1-4 breakdown
- [Design System](./DESIGN_SYSTEM.md) - Design tokens, components, guidelines
- [Backlog](./BACKLOG.md) - Feature backlog, bugs & enhancements
- [Roadmap](./ROADMAP.md) - Sprint planning & timeline
- [Featured Itineraries Plan](./FEATURED_ITINERARIES_PLAN.md) - Next feature design
- [Getting Started](./GETTING_STARTED.md) - Setup & development guide
- [Test Data](./TEST_DATA.md) - SQL data for development

---

## What's Next?

Stashport is actively expanding with community & discovery features:

**Immediate (Next Sprint):**
- Featured Itineraries section on dashboard
- Stash (copy) public itineraries to your collection
- User attribution for featured content

**Short Term:**
- Trip discovery & browsing by destination
- User profiles & public collections
- Social media sharing toolkit

**Long Term:**
- Analytics & engagement tracking
- Trip recommendations based on interests
- Calendar integration & export

See [ROADMAP.md](./ROADMAP.md) for complete feature roadmap and [FEATURED_ITINERARIES_PLAN.md](./FEATURED_ITINERARIES_PLAN.md) for design details.

---

## License

[Your chosen license]

---

**Built with ❤️ for travel creators**
Stashport - Your travel itinerary passport

