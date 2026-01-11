# Getting Started with Stashport 🚀

Quick start guide for developers working on Stashport.

---

## Prerequisites

- **Node.js:** 18 or higher
- **npm:** 8 or higher (or yarn/pnpm)
- **Git:** For version control
- **Supabase Account:** Free tier available at [supabase.com](https://supabase.com)
- **Google OAuth Credentials:** Optional, for Google login development
- **Facebook OAuth Credentials:** Optional, for Facebook login development

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stashport
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json`.

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Configuration (Optional, for development)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

**Where to find these:**

1. **Supabase Keys:**
   - Go to [supabase.com](https://supabase.com) and create a project
   - In Project Settings → API Keys
   - Copy the URL and two keys shown

2. **Google OAuth (Optional):**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a project and enable Google OAuth
   - Create OAuth 2.0 credentials (Web Application)
   - Add authorized redirect URI: `http://localhost:3000/auth/callback`

3. **Facebook OAuth (Optional):**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create an app and add Facebook Login product
   - Configure authorized domains and redirect URI

**Note:** `.env.local` is in `.gitignore` — never commit credentials to git.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

### Key Directories

```
stashport/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/             # OAuth callback
│   ├── dashboard/                # User dashboard
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   └── layout-wrapper.tsx
│   └── ui/                       # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       └── card.tsx
│
├── lib/                          # Utilities and helpers
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── database.types.ts     # Auto-generated types
│   ├── auth/                     # Auth utilities
│   │   └── auth-context.tsx      # Global auth state
│   ├── types/                    # TypeScript types
│   └── utils/                    # Helper functions
│
├── public/                       # Static assets
├── styles/                       # Global styles
├── .env.local                    # Environment variables (NOT in git)
├── database-schema.sql           # Database structure reference
├── ROADMAP.md                    # Full project roadmap
├── PHASE_*.md                    # Phase documentation
└── README.md                     # Project overview
```

---

## Common Development Tasks

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000` with hot reload enabled.

### Building for Production

```bash
npm run build
npm start
```

This creates an optimized production build.

### Linting Code

```bash
npm run lint
```

Checks code quality with ESLint. Fix issues automatically:

```bash
npm run lint -- --fix
```

### Type Checking

```bash
npx tsc --noEmit
```

Checks TypeScript types without emitting files.

### Testing the Build Locally

```bash
npm run build
npm start
```

This simulates production mode locally.

---

## Working with Authentication

### Current Auth Methods

1. **Email/Password:** Sign up with email and password
2. **Google OAuth:** Sign in with Google account
3. **Facebook OAuth:** Sign in with Facebook account

### Testing Auth Flows

**Email/Password:**
1. Go to `/auth/signup`
2. Enter email and password (8+ chars, needs uppercase, lowercase, number, special char)
3. Click "Create account"
4. Should redirect to `/dashboard`

**Google OAuth:**
1. Go to `/auth/login`
2. Click "Google" button
3. Authenticate with your Google account
4. Should redirect to `/dashboard`

**Session Persistence:**
1. Log in via any method
2. Refresh the page — you should still be logged in
3. Close the browser and reopen — session persists via secure HTTP-only cookies

### Global Auth Hook

Access auth state anywhere in your app:

```typescript
import { useAuth } from '@/lib/auth/auth-context'

export default function MyComponent() {
  const { user, isLoading, signOut } = useAuth()

  if (isLoading) return <div>Loading...</div>

  if (user) {
    return (
      <div>
        Logged in as: {user.email}
        <button onClick={signOut}>Sign out</button>
      </div>
    )
  }

  return <div>Not logged in</div>
}
```

---

## Working with the Database

### Database Structure

- **users** - User profiles
- **itineraries** - Travel trips/plans
- **days** - Individual days within itineraries
- **activities** - Activities within days

### Viewing Database

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Click "SQL Editor" or "Tables"
4. Browse and query your data

### Auto-Generated Types

Database types are auto-generated in `lib/supabase/database.types.ts`. After making database changes:

1. Update your database via Supabase SQL Editor
2. Re-generate types (check Supabase docs for your client version)
3. Update code to use new types

### Using Supabase Client

**In Client Components:**
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('user_id', user.id)

    if (error) console.error(error)
    return data
  }
}
```

**In Server Components:**
```typescript
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function MyPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data } = await supabase
    .from('itineraries')
    .select('*')
}
```

---

## Component Development

### Creating a New Component

1. **UI Components** go in `components/ui/`:
```typescript
// components/ui/my-component.tsx
export interface MyComponentProps {
  title: string
  onClick?: () => void
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <button onClick={onClick}>
      {title}
    </button>
  )
}
```

2. **Page Components** go in `app/`:
```typescript
// app/my-page/page.tsx
'use client'
import { MyComponent } from '@/components/ui/my-component'

export default function MyPage() {
  return <MyComponent title="Hello" />
}
```

### Using Tailwind CSS

All styling uses Tailwind CSS. Example:

```typescript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg">
  <h2 className="text-lg font-bold">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Click me
  </button>
</div>
```

---

## Form Validation

Uses Zod for runtime validation. Example:

```typescript
// lib/utils/validation.ts
import { z } from 'zod'

export const myFormSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be 8+ characters'),
})

// In component
const result = myFormSchema.safeParse({ email, password })

if (!result.success) {
  const errors = result.error.issues[0].message
  setError(errors)
}
```

---

## Debugging

### Console Logging
- Avoid logging passwords or sensitive data
- Use `console.error()` for errors, `console.log()` for info
- Check browser DevTools Console (F12)

### Type Errors
```bash
npx tsc --noEmit
```

Shows all TypeScript errors without building.

### Build Errors
```bash
npm run build
```

Shows all errors before production deployment.

### Supabase Issues
- Check Supabase Dashboard for database errors
- Verify `.env.local` has correct credentials
- Check RLS policies if data isn't visible

---

## Code Style

### TypeScript
- All code should be TypeScript
- Use strict mode (enabled in tsconfig)
- Type all function parameters and returns

### Components
- Functional components only (no class components)
- Use React hooks
- Mark interactive components with `'use client'`

### Naming
- Files: `kebab-case` (my-component.tsx)
- Components: `PascalCase` (MyComponent)
- Variables/functions: `camelCase` (myVariable)
- Constants: `UPPER_SNAKE_CASE` (MY_CONSTANT)

### Formatting
- 2 spaces for indentation
- 80+ character line length
- Use ESLint to auto-fix: `npm run lint -- --fix`

---

## Phase-Specific Information

### Phase 1: Infrastructure ✅
Database and types are set up. See [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md)

### Phase 2: Authentication ✅
Google, Facebook, and email/password auth are working. See [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md)

### Phase 3: Itinerary Management 📋
Implementing CRUD operations. See [PHASE_3_PLAN.md](./PHASE_3_PLAN.md)

### Phase 3.5: UI/UX Polish 📋
Polish and accessibility. See [PHASE_3.5_PLAN.md](./PHASE_3.5_PLAN.md)

### Phase 4: Production 📋
Custom domain and deployment. See [PHASE_4_PLAN.md](./PHASE_4_PLAN.md)

---

## Troubleshooting

### "SUPABASE_URL is undefined"
- Check `.env.local` exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- Restart dev server: `npm run dev`

### "Cannot find module '@/lib/...'"
- Make sure the file exists at that path
- Check `tsconfig.json` for path alias configuration
- Restart TypeScript server in your editor

### Build fails with TypeScript errors
```bash
npx tsc --noEmit
```

Identify and fix type issues before building.

### OAuth not working
- Check redirect URIs in Google Console and Facebook settings
- Verify URLs match exactly (including protocol and port)
- Check `.env.local` has correct Client IDs
- See [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) for OAuth setup

### Database not returning data
- Check RLS policies in Supabase Dashboard
- Verify user has access to table
- Check SQL syntax in queries
- Look at Database tab in Supabase Dashboard

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zod Docs](https://zod.dev)

### Project Documentation
- [README](./README.md) - Project overview
- [ROADMAP](./ROADMAP.md) - Full timeline
- [PHASE_1_COMPLETE](./PHASE_1_COMPLETE.md) - Infrastructure details
- [PHASE_2_COMPLETE](./PHASE_2_COMPLETE.md) - Auth details
- [PHASE_3_PLAN](./PHASE_3_PLAN.md) - Itinerary CRUD plan

---

## Quick Reference

### Key Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check code quality
npm start        # Start production server
npx tsc --noEmit # Check TypeScript types
```

### Key File Locations
```
Authentication:     lib/auth/auth-context.tsx
Supabase Client:    lib/supabase/client.ts
Database Types:     lib/supabase/database.types.ts
Validation:         lib/utils/validation.ts
UI Components:      components/ui/*
Layout Components:  components/layout/*
Pages:              app/*
```

### Environment Setup
```bash
# Create .env.local with:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=... (optional)
NEXT_PUBLIC_FACEBOOK_APP_ID=... (optional)
```

---

## Next Steps

1. **Read the documentation** - Start with [README.md](./README.md) and [ROADMAP.md](./ROADMAP.md)
2. **Explore the codebase** - Check out Phase 1 and 2 completed code
3. **Run locally** - Follow setup above and test the app
4. **Join Phase 3** - Implement itinerary management
5. **Check phase plans** - See what needs to be built next

---

## Questions?

- Check phase documentation files
- Review code in existing phases
- Look at TypeScript types for data structure
- Check Supabase Dashboard for database structure

---

**Happy coding! 🚀**

Built with ❤️ for travel creators.
