# Stashport UI/UX Improvement Recommendations

**Version:** 1.0
**Date:** January 2026
**Status:** Phase 3.5 Planning Document

---

## Executive Summary

This document outlines comprehensive UI/UX improvements for Stashport based on 2025-2026 design trends, travel app best practices, and industry research. The goal is to create a visually stunning, accessible, and intuitive travel itinerary platform that delights content creators.

---

## Table of Contents

1. [Color Scheme](#1-color-scheme)
2. [Typography](#2-typography)
3. [Iconography](#3-iconography)
4. [Component Design System](#4-component-design-system)
5. [Layout & Spacing](#5-layout--spacing)
6. [Animations & Micro-interactions](#6-animations--micro-interactions)
7. [Responsive Design](#7-responsive-design)
8. [Accessibility](#8-accessibility)
9. [Implementation Priority](#9-implementation-priority)

---

## 1. Color Scheme

### Current State
- Primary: `blue-600` (#2563EB) - Generic blue
- Secondary: `gray-200` - Neutral gray
- No defined brand palette
- Basic dark mode support (system preference only)

### Recommended Color Palette: "Wanderlust"

Inspired by Mediterranean travel destinations with warm, inviting tones balanced by cool accents.

```css
:root {
  /* Primary - Coral Sunset */
  --color-primary-50: #fff5f3;
  --color-primary-100: #ffe8e3;
  --color-primary-200: #ffd5cc;
  --color-primary-300: #ffb5a6;
  --color-primary-400: #ff8a72;
  --color-primary-500: #f86f4d;  /* Main primary */
  --color-primary-600: #e5512f;
  --color-primary-700: #c13f21;
  --color-primary-800: #9f361f;
  --color-primary-900: #833220;

  /* Secondary - Ocean Teal */
  --color-secondary-50: #f0fdfc;
  --color-secondary-100: #ccfbf6;
  --color-secondary-200: #99f6ed;
  --color-secondary-300: #5eead4;
  --color-secondary-400: #2dd4bf;
  --color-secondary-500: #14b8a6;  /* Main secondary */
  --color-secondary-600: #0d9488;
  --color-secondary-700: #0f766e;
  --color-secondary-800: #115e59;
  --color-secondary-900: #134e4a;

  /* Accent - Golden Hour */
  --color-accent-50: #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;  /* Main accent */
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;

  /* Neutrals - Slate */
  --color-neutral-50: #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1e293b;
  --color-neutral-900: #0f172a;

  /* Semantic Colors */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Background & Surface */
  --color-background: #fafaf9;  /* Warm white */
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0c0a09;
    --color-surface: #1c1917;
    --color-surface-elevated: #292524;
    --color-neutral-50: #0f172a;
    /* Invert neutral scale for dark mode */
  }
}
```

### Color Usage Guidelines

| Element | Color | Usage |
|---------|-------|-------|
| Primary CTA buttons | `primary-500` | Create Trip, Save, Submit |
| Secondary actions | `secondary-500` | Edit, View |
| Destructive actions | `error` | Delete, Cancel |
| Success states | `success` | Saved, Published |
| Links | `primary-600` | Navigation, inline links |
| Headings | `neutral-900` | All headings |
| Body text | `neutral-700` | Paragraphs, descriptions |
| Muted text | `neutral-500` | Timestamps, helper text |
| Borders | `neutral-200` | Cards, inputs, dividers |
| Backgrounds | `neutral-50` | Page background |
| Card backgrounds | `surface` | Cards, modals |

### References
- [Piktochart - Travel Color Palettes](https://piktochart.com/tips/travel-color-palette)
- [Coolors - Travel Palettes](https://coolors.co/palettes/popular/travel)
- [Dribbble - Travel App Color Palettes](https://dribbble.com/search/Travel-website-color-palette)

---

## 2. Typography

### Current State
- Using system font: `Arial, Helvetica, sans-serif`
- No defined type scale
- Limited hierarchy

### Recommended Font Pairing

**Primary: Inter** (UI/Body)
**Secondary: Plus Jakarta Sans** (Headings)

Both are free Google Fonts with excellent readability across devices.

```css
/* Font Import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

:root {
  --font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Type Scale

Based on a 1.25 ratio (Major Third) for harmonious scaling:

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}
```

### Typography Hierarchy

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| H1 (Page titles) | Plus Jakarta Sans | 3rem (48px) | 800 | neutral-900 |
| H2 (Section heads) | Plus Jakarta Sans | 2.25rem (36px) | 700 | neutral-900 |
| H3 (Card titles) | Plus Jakarta Sans | 1.5rem (24px) | 600 | neutral-800 |
| H4 (Subsections) | Plus Jakarta Sans | 1.25rem (20px) | 600 | neutral-800 |
| Body Large | Inter | 1.125rem (18px) | 400 | neutral-700 |
| Body | Inter | 1rem (16px) | 400 | neutral-700 |
| Body Small | Inter | 0.875rem (14px) | 400 | neutral-600 |
| Caption | Inter | 0.75rem (12px) | 500 | neutral-500 |
| Button | Inter | 0.875rem (14px) | 600 | varies |
| Label | Inter | 0.875rem (14px) | 500 | neutral-700 |

### References
- [Medium - Best Google Font Pairings for UI Design 2025](https://medium.com/design-bootcamp/best-google-font-pairings-for-ui-design-in-2025-ba8d006aa03d)
- [Shakuro - Best Fonts for Web Design 2025](https://shakuro.com/blog/best-fonts-for-web-design)
- [Design Shack - Font Pairing Trends 2025](https://designshack.net/articles/trends/pairing-fonts/)

---

## 3. Iconography

### Current State
- Using Lucide React icons (stroke-only style)
- Inconsistent icon usage across components
- Missing travel-specific icons

### Recommended Approach

**Primary Library: Lucide React** (Keep existing)
**Supplementary: Phosphor Icons** (For variety and duotone options)

Lucide remains a great choice, but adding Phosphor provides:
- Multiple weights (thin, light, regular, bold, fill, duotone)
- Better variety for travel-specific needs
- Consistent visual language

### Icon Usage Guidelines

```typescript
// Icon sizes based on context
const iconSizes = {
  xs: 'w-3 h-3',      // 12px - inline with small text
  sm: 'w-4 h-4',      // 16px - buttons, inputs
  md: 'w-5 h-5',      // 20px - navigation, cards
  lg: 'w-6 h-6',      // 24px - feature icons
  xl: 'w-8 h-8',      // 32px - empty states
  '2xl': 'w-12 h-12', // 48px - hero sections
}
```

### Key Icons for Stashport

| Feature | Icon | Library |
|---------|------|---------|
| Dashboard | `LayoutDashboard` | Lucide |
| Create Trip | `Plus` / `PlaneTakeoff` | Lucide |
| Itinerary | `Map` / `Route` | Lucide |
| Day | `Calendar` / `Sun` | Lucide |
| Activity | `MapPin` / `Clock` | Lucide |
| Public trip | `Globe` | Lucide |
| Private trip | `Lock` | Lucide |
| Edit | `Pencil` | Lucide |
| Delete | `Trash2` | Lucide |
| Share | `Share2` | Lucide |
| Copy link | `Link` | Lucide |
| Stash (save) | `Bookmark` / `Heart` | Lucide |
| User | `User` / `UserCircle` | Lucide |
| Settings | `Settings` | Lucide |
| Logout | `LogOut` | Lucide |
| Location | `MapPin` | Lucide |
| Time | `Clock` | Lucide |
| Notes | `FileText` | Lucide |
| Success | `CheckCircle` | Lucide |
| Error | `AlertCircle` | Lucide |
| Loading | `Loader2` (animated) | Lucide |

### Icon Component Enhancement

```tsx
// components/ui/icon.tsx
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface IconProps {
  icon: LucideIcon
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12',
}

export function Icon({ icon: IconComponent, size = 'md', className }: IconProps) {
  return <IconComponent className={cn(sizeMap[size], className)} />
}
```

### References
- [Hugeicons - Lucide Alternatives](https://hugeicons.com/blog/design/8-lucide-icons-alternatives-that-offer-better-icons)
- [Lineicons - Best Open Source Icon Libraries](https://lineicons.com/blog/best-open-source-icon-libraries)
- [DEV.to - Open Source Icon Libraries 2025](https://dev.to/icons/21-best-open-source-icon-libraries-o5n)

---

## 4. Component Design System

### Button Component

```tsx
// Enhanced button variants
const buttonVariants = {
  // Primary - Main CTA
  primary: `
    bg-primary-500 text-white
    hover:bg-primary-600
    active:bg-primary-700
    focus:ring-primary-500/50
    disabled:bg-primary-300
  `,

  // Secondary - Less emphasis
  secondary: `
    bg-secondary-500 text-white
    hover:bg-secondary-600
    active:bg-secondary-700
    focus:ring-secondary-500/50
  `,

  // Outline - Tertiary actions
  outline: `
    border-2 border-primary-500 text-primary-600
    hover:bg-primary-50
    active:bg-primary-100
    focus:ring-primary-500/50
  `,

  // Ghost - Minimal emphasis
  ghost: `
    text-neutral-700
    hover:bg-neutral-100
    active:bg-neutral-200
    focus:ring-neutral-500/50
  `,

  // Destructive - Delete, Cancel
  destructive: `
    bg-error text-white
    hover:bg-red-600
    active:bg-red-700
    focus:ring-red-500/50
  `,
}

// Enhanced sizes with proper touch targets
const buttonSizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  xl: 'h-14 px-8 text-lg gap-3',
  icon: 'h-10 w-10', // Square icon buttons
}
```

### Card Component

```tsx
// Card with hover effects and variants
const cardVariants = {
  default: `
    bg-white rounded-xl border border-neutral-200
    shadow-sm hover:shadow-md
    transition-shadow duration-200
  `,

  elevated: `
    bg-white rounded-xl
    shadow-md hover:shadow-lg
    transition-shadow duration-200
  `,

  interactive: `
    bg-white rounded-xl border border-neutral-200
    shadow-sm hover:shadow-md hover:border-primary-300
    transition-all duration-200 cursor-pointer
  `,

  featured: `
    bg-gradient-to-br from-primary-50 to-secondary-50
    rounded-xl border border-primary-100
    shadow-sm
  `,
}
```

### Input Component

```tsx
// Enhanced input with states
const inputStyles = `
  w-full h-11 px-4
  bg-white border border-neutral-300 rounded-lg
  text-neutral-900 placeholder:text-neutral-400
  transition-all duration-200

  /* Focus state */
  focus:outline-none focus:ring-2 focus:ring-primary-500/30
  focus:border-primary-500

  /* Error state */
  aria-[invalid=true]:border-error
  aria-[invalid=true]:focus:ring-error/30

  /* Disabled state */
  disabled:bg-neutral-100 disabled:text-neutral-500
  disabled:cursor-not-allowed
`

// With icon support
const inputWithIcon = `
  relative
  [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-1/2
  [&>svg]:-translate-y-1/2 [&>svg]:text-neutral-400
  [&>input]:pl-10
`
```

### Trip Card Component

```tsx
// components/itinerary/trip-card.tsx
interface TripCardProps {
  trip: ItineraryWithDays
  onEdit: () => void
  onDelete: () => void
  onView: () => void
  onCopyLink: () => void
}

export function TripCard({ trip, ...actions }: TripCardProps) {
  return (
    <div className="group relative bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300">
      {/* Image placeholder / gradient header */}
      <div className="h-32 bg-gradient-to-br from-primary-400 to-secondary-400 relative">
        {/* Destination badge */}
        {trip.destination && (
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-neutral-700 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {trip.destination}
          </span>
        )}

        {/* Public/Private badge */}
        <span className={cn(
          "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
          trip.is_public
            ? "bg-green-100 text-green-700"
            : "bg-neutral-100 text-neutral-600"
        )}>
          {trip.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {trip.is_public ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-neutral-900 mb-1 truncate">
          {trip.title}
        </h3>

        {trip.description && (
          <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
            {trip.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {trip.days.length} day{trip.days.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {trip.days.reduce((acc, day) => acc + day.activities.length, 0)} activities
          </span>
        </div>

        {/* Actions - appear on hover */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-400">
            Updated {formatDate(trip.updated_at)}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton icon={Eye} onClick={actions.onView} tooltip="View" />
            <IconButton icon={Edit2} onClick={actions.onEdit} tooltip="Edit" />
            <IconButton icon={Link} onClick={actions.onCopyLink} tooltip="Copy link" />
            <IconButton
              icon={Trash2}
              onClick={actions.onDelete}
              variant="destructive"
              tooltip="Delete"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

### References
- [TailAdmin - Dashboard Components](https://tailadmin.com/components)
- [daisyUI - Tailwind CSS Component Library](https://daisyui.com/)
- [Preline UI - Tailwind Components](https://preline.co/)

---

## 5. Layout & Spacing

### Spacing Scale

Using an 8px base grid with a harmonious scale:

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### Page Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header (h-16, sticky)                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  Page Content (max-w-7xl, mx-auto, px-4-6)      │   │
│   │                                                  │   │
│   │  ┌─────────────────────────────────────────┐    │   │
│   │  │  Page Header                             │    │   │
│   │  │  Title + Description + Actions           │    │   │
│   │  └─────────────────────────────────────────┘    │   │
│   │                                                  │   │
│   │  ┌─────────────────────────────────────────┐    │   │
│   │  │  Main Content Area                       │    │   │
│   │  │  Cards, Forms, etc.                      │    │   │
│   │  └─────────────────────────────────────────┘    │   │
│   │                                                  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Footer (optional)                                      │
└─────────────────────────────────────────────────────────┘
```

### Grid System for Cards

```tsx
// Responsive grid for trip cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {trips.map(trip => <TripCard key={trip.id} trip={trip} />)}
</div>
```

### Container Widths

| Container | Max Width | Usage |
|-----------|-----------|-------|
| `max-w-sm` | 24rem (384px) | Modals, small forms |
| `max-w-md` | 28rem (448px) | Auth forms |
| `max-w-lg` | 32rem (512px) | Medium modals |
| `max-w-xl` | 36rem (576px) | Content forms |
| `max-w-2xl` | 42rem (672px) | Article content |
| `max-w-4xl` | 56rem (896px) | Itinerary forms |
| `max-w-6xl` | 72rem (1152px) | Wide dashboards |
| `max-w-7xl` | 80rem (1280px) | Full page content |

---

## 6. Animations & Micro-interactions

### Animation Tokens

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easing */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Key Animations

```tsx
// 1. Button press effect
const buttonAnimation = `
  transform active:scale-[0.98]
  transition-transform duration-100
`

// 2. Card hover lift
const cardHoverAnimation = `
  hover:-translate-y-1 hover:shadow-lg
  transition-all duration-200 ease-out
`

// 3. Page transitions (with CSS)
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: fadeIn 300ms ease-out;
}

// 4. Loading spinner
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

// 5. Success checkmark
@keyframes checkmark {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}

// 6. Toast slide in
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

// 7. Skeleton loading pulse
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
  background-size: 200% 100%;
}
```

### Micro-interaction Examples

```tsx
// 1. Like/Stash button with heart animation
const [isStashed, setIsStashed] = useState(false)

<button
  onClick={() => setIsStashed(!isStashed)}
  className={cn(
    "transition-all duration-200",
    isStashed
      ? "text-red-500 scale-110"
      : "text-neutral-400 hover:text-red-400"
  )}
>
  <Heart className={cn("w-5 h-5", isStashed && "fill-current")} />
</button>

// 2. Copy link with feedback
const [copied, setCopied] = useState(false)

const handleCopy = async () => {
  await navigator.clipboard.writeText(shareUrl)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

<button onClick={handleCopy}>
  {copied ? (
    <Check className="w-4 h-4 text-green-500" />
  ) : (
    <Copy className="w-4 h-4" />
  )}
  {copied ? 'Copied!' : 'Copy link'}
</button>

// 3. Form input focus glow
<input className="
  focus:ring-4 focus:ring-primary-500/20
  focus:border-primary-500
  transition-all duration-200
" />
```

### References
- [Designveloper - Mobile App Design Trends 2026](https://www.designveloper.com/blog/mobile-app-design-trends/)
- [Lyssna - App Design Trends 2026](https://www.lyssna.com/blog/app-design-trends/)

---

## 7. Responsive Design

### Breakpoints

```css
/* Tailwind default breakpoints */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

### Mobile-First Patterns

```tsx
// Navigation - Hamburger on mobile, full nav on desktop
<nav className="hidden md:flex items-center gap-6">
  {/* Desktop navigation */}
</nav>
<button className="md:hidden">
  <Menu className="w-6 h-6" />
</button>

// Cards - Single column on mobile, grid on larger screens
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

// Forms - Full width on mobile, constrained on desktop
<form className="w-full max-w-md mx-auto">

// Padding - Less on mobile, more on desktop
<div className="px-4 sm:px-6 lg:px-8">

// Typography - Smaller on mobile
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
```

### Touch Targets

Ensure minimum 44x44px touch targets on mobile:

```tsx
// Good - meets touch target guidelines
<button className="h-11 px-4"> {/* 44px height */}
<button className="w-11 h-11">  {/* 44x44px icon button */}

// Links with adequate spacing
<a className="py-3 block"> {/* Tall touch area */}
```

---

## 8. Accessibility

### WCAG 2.1 AA Compliance Checklist

#### Color Contrast
- [ ] Body text: 4.5:1 ratio minimum
- [ ] Large text (18px+): 3:1 ratio minimum
- [ ] UI components: 3:1 ratio minimum
- [ ] Focus indicators: 3:1 ratio minimum

```tsx
// Our palette contrast ratios
// primary-500 (#f86f4d) on white: 3.2:1 - Use for large text/icons only
// primary-600 (#e5512f) on white: 4.5:1 - Safe for body text
// neutral-900 on white: 17:1 - Excellent for headings
// neutral-700 on white: 8.5:1 - Good for body text
```

#### Focus States

```tsx
// Visible focus indicators
const focusRing = `
  focus:outline-none
  focus-visible:ring-2
  focus-visible:ring-primary-500
  focus-visible:ring-offset-2
`

// Skip link for keyboard users
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-500 text-white px-4 py-2 rounded-lg z-50"
>
  Skip to main content
</a>
```

#### ARIA Labels

```tsx
// Form inputs
<input
  aria-label="Trip title"
  aria-describedby="title-hint"
  aria-invalid={!!errors.title}
  aria-errormessage="title-error"
/>

// Icon buttons
<button aria-label="Delete trip">
  <Trash2 className="w-5 h-5" aria-hidden="true" />
</button>

// Loading states
<div aria-busy="true" aria-live="polite">
  Loading your trips...
</div>

// Alerts
<div role="alert" aria-live="assertive">
  Trip saved successfully!
</div>
```

#### Keyboard Navigation

```tsx
// Trap focus in modals
// Use react-focus-lock or similar

// Escape key to close
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
}, [onClose])

// Arrow key navigation for menus
```

#### Screen Reader Support

```tsx
// Visually hidden but screen reader accessible
<span className="sr-only">3 public trips</span>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {notification}
</div>

// Semantic structure
<main id="main-content" role="main">
  <article aria-labelledby="trip-title">
    <h1 id="trip-title">{trip.title}</h1>
  </article>
</main>
```

### References
- [G & Co. - Travel App Design Trends](https://www.g-co.agency/insights/top-travel-mobile-app-design-trends-ui-inspiration)
- [uidesignz - Best UI Design Practices 2026](https://uidesignz.com/blogs/mobile-ui-design-best-practices)

---

## 9. Implementation Priority

### Phase 1: Foundation (Days 1-2)

1. **Color Palette & CSS Variables**
   - Update `globals.css` with new color tokens
   - Configure Tailwind with custom colors

2. **Typography Setup**
   - Add Google Fonts (Inter, Plus Jakarta Sans)
   - Create type scale utilities
   - Update base styles

3. **Button Component Refresh**
   - Add new variants (destructive, etc.)
   - Improve hover/focus/active states
   - Add proper loading animation

### Phase 2: Core Components (Days 2-3)

4. **Input & Form Components**
   - Enhanced focus states
   - Error/success visual feedback
   - Icon support
   - Proper accessibility attributes

5. **Card Component System**
   - Multiple variants
   - Hover animations
   - Consistent spacing

6. **Trip Card Redesign**
   - Visual hierarchy improvements
   - Gradient headers
   - Better action visibility

### Phase 3: Layout & Polish (Days 3-4)

7. **Dashboard Layout**
   - Improved grid system
   - Better empty states
   - Loading skeletons

8. **Header & Navigation**
   - Mobile menu improvements
   - User avatar/dropdown
   - Smooth transitions

9. **Itinerary Form Polish**
   - Better day/activity cards
   - Drag-and-drop hints
   - Progressive disclosure

### Phase 4: Finishing Touches (Day 5)

10. **Animations**
    - Page transitions
    - Micro-interactions
    - Loading states

11. **Accessibility Audit**
    - WCAG compliance check
    - Screen reader testing
    - Keyboard navigation

12. **Performance**
    - Lighthouse audit (target: 90+)
    - Image optimization
    - Font loading strategy

---

## Quick Wins

These can be implemented immediately for visible impact:

1. **Update primary color** from generic blue to coral `#f86f4d`
2. **Add Inter font** for improved readability
3. **Increase card border-radius** from `rounded-lg` to `rounded-xl`
4. **Add subtle shadows** to cards with hover enhancement
5. **Improve button states** with transforms and better colors
6. **Add gradient backgrounds** to trip card headers
7. **Update empty states** with illustrations and better CTAs

---

## Design Resources

### Inspiration
- [Dribbble - Travel App Designs](https://dribbble.com/search/travel-itinerary-app)
- [Pixso - Travel App UI Case Studies](https://pixso.net/tips/travel-app-ui/)
- [Designli - Wanderlog Behavioral Design](https://designli.co/blog/how-wanderlog-app-simplifies-trip-planning-using-behavioral-design/)

### Tools
- [Coolors - Color Palette Generator](https://coolors.co/)
- [Realtime Colors - Preview palettes](https://www.realtimecolors.com/)
- [Type Scale - Typography calculator](https://typescale.com/)
- [Contrast Checker - WCAG compliance](https://webaim.org/resources/contrastchecker/)

### Component Libraries
- [TailAdmin - Dashboard Components](https://tailadmin.com/)
- [Preline UI - Tailwind Components](https://preline.co/)
- [daisyUI - Component Classes](https://daisyui.com/)
- [Tailwind Components - Free Examples](https://tailwindcomponents.com/)

---

**Document prepared for Stashport Phase 3.5 implementation.**

*Last updated: January 2026*
