# 🎨 Stashport Design System

Complete documentation of the Stashport design system, including colors, typography, components, animations, and guidelines.

---

## 📐 Design Tokens

### Color System

#### Primary Colors (Coral Sunset)
```css
--color-primary-50: #fff5f3   /* Lightest tint */
--color-primary-100: #ffe8e3
--color-primary-200: #ffd5cc
--color-primary-300: #ffb5a6
--color-primary-400: #ff8a72
--color-primary-500: #f86f4d  /* Base primary */
--color-primary-600: #e5512f  /* Hover state */
--color-primary-700: #c13f21  /* Active state */
--color-primary-800: #9f361f
--color-primary-900: #833220  /* Darkest shade */
```
**Usage**: Primary buttons, CTAs, interactive elements, accents

#### Secondary Colors (Ocean Teal)
```css
--color-secondary-50: #f0fdfc   /* Lightest tint */
--color-secondary-100: #ccfbf6
--color-secondary-200: #99f6ed
--color-secondary-300: #5eead4
--color-secondary-400: #2dd4bf
--color-secondary-500: #14b8a6  /* Base secondary */
--color-secondary-600: #0d9488  /* Hover state */
--color-secondary-700: #0f766e  /* Active state */
--color-secondary-800: #115e59
--color-secondary-900: #134e4a  /* Darkest shade */
```
**Usage**: Secondary buttons, teal accent borders, supporting elements

#### Accent Colors (Golden Hour)
```css
--color-accent-50: #fffbeb    /* Lightest tint */
--color-accent-100: #fef3c7
--color-accent-200: #fde68a
--color-accent-300: #fcd34d
--color-accent-400: #fbbf24
--color-accent-500: #f59e0b   /* Base accent */
--color-accent-600: #d97706   /* Hover state */
--color-accent-700: #b45309   /* Active state */
```
**Usage**: Accent borders, highlights, tertiary accents

#### Neutral Colors (Slate Gray)
```css
--color-neutral-50: #f8fafc    /* Off-white */
--color-neutral-100: #f1f5f9
--color-neutral-200: #e2e8f0   /* Borders */
--color-neutral-300: #cbd5e1
--color-neutral-400: #94a3b8
--color-neutral-500: #64748b   /* Secondary text */
--color-neutral-600: #475569
--color-neutral-700: #334155
--color-neutral-800: #1e293b   /* Dark text */
--color-neutral-900: #0f172a   /* Primary text */
```
**Usage**: Text, borders, backgrounds, subtle elements

#### Semantic Colors
```css
--color-success: #22c55e   /* Success states */
--color-warning: #f59e0b   /* Warning states */
--color-error: #ef4444     /* Error states */
--color-info: #3b82f6      /* Info states */
```

#### Theme Colors
```css
--background: #fffaf5              /* Page background (cream) */
--foreground: #0f172a              /* Primary text (dark) */
--color-surface: #ffffff           /* Card background (white) */
--color-surface-elevated: #ffffff  /* Elevated card (white) */
```

---

## 🔤 Typography System

### Font Families

#### Playfair Display (Display Font)
```css
--font-display: 'Playfair Display', serif;
```
- **Weights**: 600, 700, 800
- **Usage**: H1, H2 headlines, large display text
- **Character**: Elegant, editorial, luxury feel
- **Example**: "Turn your trips into adventures"

#### Space Grotesk (Heading Font)
```css
--font-heading: 'Space Grotesk', system-ui, sans-serif;
```
- **Weights**: 500, 600, 700
- **Usage**: H3, H4, labels, UI text, button text
- **Character**: Modern, geometric, distinctive
- **Example**: "Trip Information", "DURATION", button labels

#### Source Sans Pro (Body Font)
```css
--font-body: 'Source Sans Pro', system-ui, sans-serif;
```
- **Weights**: 400, 500, 600, 700
- **Usage**: Body text, descriptions, paragraphs
- **Character**: Refined, readable, professional
- **Example**: Paragraph copy, helper text, descriptions

### Typography Scale

#### Headings
```css
h1 {
  font-family: Playfair Display;
  font-size: 3.5rem;       /* 56px */
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

h2 {
  font-family: Playfair Display;
  font-size: 2.5rem;       /* 40px */
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

h3 {
  font-family: Space Grotesk;
  font-size: 1.75rem;      /* 28px */
  font-weight: 700;
  line-height: 1.3;
}

h4 {
  font-family: Space Grotesk;
  font-size: 1.25rem;      /* 20px */
  font-weight: 600;
  line-height: 1.4;
}
```

#### Body Text
```css
p {
  font-family: Source Sans Pro;
  font-size: 1rem;         /* 16px */
  line-height: 1.6;
  color: #334155;          /* neutral-700 */
}

small {
  font-size: 0.875rem;     /* 14px */
  line-height: 1.5;
}

.text-xs {
  font-size: 0.75rem;      /* 12px */
  line-height: 1.5;
}
```

### Mobile Typography
On screens < 640px, all typography scales down by ~50%:
- H1: 2rem (32px)
- H2: 1.5rem (24px)
- H3: 1.25rem (20px)
- H4: 1.125rem (18px)
- P: 0.9375rem (15px)

---

## 🎬 Animation System

### Animation Durations
```css
--duration-instant: 100ms    /* Immediate feedback */
--duration-fast: 150ms       /* Quick micro-interactions */
--duration-normal: 250ms     /* Standard transition */
--duration-slow: 400ms       /* Deliberate entrance */
--duration-slower: 600ms     /* Emphasis animations */
```

### Easing Functions
```css
--easing-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94)  /* Natural motion */
--easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)     /* Playful bounce */
--easing-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55) /* Elastic spring */
--easing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275)  /* Spring physics */
```

### Animation Library

#### Entrance Animations
| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| `fadeIn` | 250ms | smooth | Content fade-in |
| `slideInUp` | 400ms | smooth | Hero section reveals |
| `slideInDown` | 400ms | smooth | Mobile menu entrance |
| `slideInLeft` | 400ms | smooth | Sidebar entrance |
| `slideInRight` | 400ms | smooth | Notification entrance |
| `scaleIn` | 400ms | bounce | Modal entrance |
| `slideInFromTop` | 250ms | smooth | Error/success messages |

#### Interactive Animations
| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| `buttonPress` | 150ms | smooth | Button click feedback |
| `buttonLift` | 150ms | smooth | Button hover |
| `cardLift` | 150ms | smooth | Card hover lift |
| `inputGlow` | 600ms | smooth | Input focus glow |
| `successScale` | 150ms | bounce | Success checkmark |
| `shakeEnhanced` | 250ms | spring | Error feedback |

#### Continuous Animations
| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| `pulse` | 600ms | smooth | Loading indicator |
| `spin` | 400ms | linear | Spinner |
| `bounce` | 400ms | ease-in-out | Floating element |
| `float` | 3s | ease-in-out | Floating background |
| `glow` | 600ms | smooth | Glowing effect |
| `gradientShift` | 600ms | ease | Gradient animation |

### Utility Classes

```html
<!-- Fade Effects -->
<div class="animate-fade-in">Content</div>
<div class="animate-fade-out">Content</div>

<!-- Slide Effects -->
<div class="animate-slide-in-up">Hero</div>
<div class="animate-slide-in-down">Menu</div>
<div class="animate-slide-in-left">Sidebar</div>
<div class="animate-slide-in-right">Notification</div>
<div class="animate-slide-from-top">Error message</div>

<!-- Scale Effects -->
<div class="animate-scale-in">Modal</div>
<div class="animate-button-press">Button click</div>
<div class="animate-success-scale">Success icon</div>

<!-- Micro-interactions -->
<div class="animate-button-lift">Hover button</div>
<div class="animate-card-lift">Hover card</div>
<div class="animate-input-glow">Focused input</div>
<div class="animate-shake-enhanced">Error input</div>

<!-- Continuous -->
<div class="animate-pulse">Loading</div>
<div class="animate-spin">Spinner</div>
<div class="animate-bounce">Floating</div>
<div class="animate-float">Background</div>
```

### Staggered Animations

Apply delays for sequential entrance:
```html
<div class="animate-fade-in" style="animation-delay: 0ms">1st element</div>
<div class="animate-fade-in" style="animation-delay: 100ms">2nd element</div>
<div class="animate-fade-in" style="animation-delay: 200ms">3rd element</div>
<div class="animate-fade-in" style="animation-delay: 300ms">4th element</div>
```

### Accessibility: Prefers Reduced Motion

For users who prefer reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧩 Component Library

### Button Component

#### Variants

**Primary Button** (Coral)
```tsx
<Button variant="primary">Primary Action</Button>
```
- Background: Coral (#f86f4d)
- Text: White
- Hover: Darker coral (#e5512f) + lift + shadow
- Active: Scale 0.95 + press animation
- Use for: Main CTAs, save/create actions

**Secondary Button** (Teal outline)
```tsx
<Button variant="secondary">Secondary Action</Button>
```
- Border: 2px teal (#14b8a6)
- Background: White
- Text: Teal
- Hover: Light teal background + lift
- Use for: Alternative actions, sign-up

**Tertiary Button** (Text)
```tsx
<Button variant="tertiary">Tertiary Action</Button>
```
- Background: Transparent
- Text: Coral (#f86f4d)
- Hover: Light coral background
- Use for: Cancel, close, secondary links

**Danger Button** (Red)
```tsx
<Button variant="danger">Delete</Button>
```
- Background: Red (#ef4444)
- Text: White
- Hover: Darker red + lift
- Use for: Destructive actions

#### Sizes
```tsx
<Button size="sm">Small (32px)</Button>    {/* 8px padding */}
<Button size="md">Medium (40px)</Button>   {/* 10px padding (default) */}
<Button size="lg">Large (48px)</Button>    {/* 12px padding */}
```

#### States
```tsx
<Button isLoading>Saving...</Button>       {/* Shows spinner */}
<Button disabled>Disabled</Button>         {/* opacity-50, cursor-not-allowed */}
<Button hideTextWhileLoading>Icon Only</Button>  {/* Spinner without text */}
```

---

### Card Component

#### Variants

**Default Card**
```tsx
<Card variant="default">Content</Card>
```
- Shadow: sm (light)
- Hover: shadow-md
- Use for: Standard containers

**Elevated Card**
```tsx
<Card variant="elevated">Content</Card>
```
- Shadow: md (medium)
- Hover: shadow-lg
- Use for: Important content, stats cards

**Interactive Card**
```tsx
<Card variant="interactive">Content</Card>
```
- Shadow: sm → lg on hover
- Hover: Lift -4px + shadow-lg
- Cursor: pointer
- Use for: Clickable items, trip cards

#### Accent Borders
```tsx
<Card accentColor="primary">Primary accent</Card>    {/* Coral top border */}
<Card accentColor="secondary">Secondary accent</Card> {/* Teal top border */}
<Card accentColor="accent">Accent border</Card>       {/* Golden top border */}
<Card accentColor="none">No accent</Card>             {/* Default border */}
```

#### Sub-components
```tsx
<Card>
  <CardHeader>Header content</CardHeader>
  <CardContent padding="default">Body content</CardContent>
  <CardFooter>Footer with buttons</CardFooter>
</Card>
```

---

### Input Component

#### Basic Input
```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={error}
  helperText="Enter your email address"
/>
```

#### Features
- **Label**: Bold, uppercase Space Grotesk
- **Border**: 2px minimal style
- **Focus**: Coral border + 3px glow shadow + light background
- **Error**: Red border + shake animation + error icon
- **Success**: Green border + checkmark icon
- **Helper Text**: Gray, below input

#### Validation States
```tsx
<Input isValid={true} />           {/* Green checkmark */}
<Input error="Field required" />   {/* Red border + icon */}
<Input showErrorAnimation={true}/> {/* Shake on error */}
```

---

### Header Component

#### Desktop View
- Sticky navigation
- Logo + brand name (hidden on small screens)
- Nav items: Dashboard, Create Trip
- User menu: Avatar + dropdown

#### Mobile View
- Sticky header
- Logo + menu button (44x44px touch target)
- Hamburger menu slides down
- Full-height menu on overlay
- All items: 44px minimum height

#### User Menu
```tsx
User Avatar (circle, primary-100 background)
├── Username (from email)
├── Email address
└── Sign Out button
```

---

## 📏 Spacing Scale

```css
--space-0: 0rem      /* 0px */
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

### Common Spacing Patterns
- **Card padding**: 24px (--space-6)
- **Section margin**: 32px (--space-8)
- **Form gap**: 24px between inputs
- **List gap**: 12-16px between items
- **Touch target padding**: 12px minimum

---

## 🎯 Accessibility Guidelines

### Color Contrast
All text meets WCAG AA standards:
- Large text (18pt+): 3:1 contrast ratio
- Normal text: 4.5:1 contrast ratio
- UI components: 3:1 contrast ratio

### Focus Indicators
```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Touch Targets
- Minimum size: 44x44px (10mm)
- Minimum gap: 8px between targets
- Adequate padding for easy interaction

### Keyboard Navigation
- Tab order: Logical flow
- Escape: Closes modals/menus
- Enter: Submits forms/activates buttons
- Arrow keys: Navigate lists/options

### ARIA Labels
```html
<button aria-label="Toggle menu">☰</button>
<div role="alert">Error message</div>
<input aria-invalid="true" aria-describedby="error-msg">
```

### Screen Reader Support
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`
- Heading hierarchy: H1 → H2 → H3 (no skips)
- Image alt text: Descriptive text for all images
- Form labels: Associated with inputs via `htmlFor`
- ARIA roles: Applied where semantic HTML insufficient

---

## 🌐 Responsive Design

### Breakpoints
```css
/* Mobile First */
/* 0px - Mobile (default) */
/* 640px - Small tablets (sm:) */
/* 768px - Tablets (md:) */
/* 1024px - Desktops (lg:) */
/* 1280px - Large desktops (xl:) */
```

### Mobile Optimization
- Full-width containers
- Stacked layouts (1 column)
- Larger touch targets (44x44px)
- Reduced padding (16px base)
- Simplified navigation (hamburger menu)

### Tablet Optimization
- 2-column layouts where appropriate
- Balanced spacing
- Horizontal navigation appears
- Optimal readability (45-75 chars/line)

### Desktop Optimization
- 3+ column grids
- Generous whitespace
- Full navigation visible
- Large hero images/graphics

---

## 📖 Usage Guidelines

### When to Use Each Color

**Coral (Primary)**
- Call-to-action buttons
- Primary navigation highlights
- Success confirmations
- Focus indicators
- Important accent text

**Teal (Secondary)**
- Secondary action buttons
- Alternative links
- Supporting UI elements
- Form accents
- Date/time indicators

**Golden (Accent)**
- Tertiary accents
- Special highlights
- Premium features
- Subtle emphasis

**Neutrals**
- Body text (neutral-900)
- Secondary text (neutral-700)
- Disabled text (neutral-500)
- Borders (neutral-200)
- Backgrounds (neutral-50)

### When to Use Each Font

**Playfair Display**
- Main headlines (h1, h2)
- Page titles
- Brand moments
- Large display text
- Luxury/editorial feel

**Space Grotesk**
- Section headers (h3, h4)
- Button text
- Form labels
- UI labels
- Modern geometric feel

**Source Sans Pro**
- Body paragraphs
- Descriptions
- Helper text
- List items
- Professional tone

### Animation Best Practices

✅ **DO**
- Use animations to guide user attention
- Provide feedback for interactions
- Respect prefers-reduced-motion
- Keep animations under 500ms typically
- Use appropriate easing for motion type

❌ **DON'T**
- Animate on unnecessary elements
- Make animations too long/distracting
- Ignore accessibility preferences
- Use animations for initial page load (except hero)
- Animate color/position when transform/opacity works

---

**Design System Version**: 1.0.0 (Foundation)
**Last Updated**: January 12, 2026
**Status**: ✅ Foundation Complete & Stable | 🚧 Application UX Still in Development
**Note**: Design system is production-grade and stable. The application as a whole requires additional UX testing and feature refinement before launch.
