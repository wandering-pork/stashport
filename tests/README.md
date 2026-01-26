# Stashport Tests

## Test Structure

```
tests/
├── setup.ts           # Vitest setup (global mocks)
├── unit/              # Unit tests (Vitest)
│   ├── validation.test.ts    # Zod schema validation tests
│   └── share-helpers.test.ts # Web Share API helper tests
└── e2e/               # End-to-End tests (Playwright)
    ├── auth.spec.ts          # Authentication flows
    ├── dashboard.spec.ts     # Dashboard & Explore
    ├── itinerary.spec.ts     # CRUD operations & API
    └── share.spec.ts         # Share page & modal
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests (requires dev server)
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Run specific browser only
npx playwright test --project=chromium
```

### All Tests

```bash
npm run test:all
```

## Test Credentials

For E2E tests requiring authentication, set these environment variables:

```bash
# Create .env.test file
TEST_USER_EMAIL=your-test-email@example.com
TEST_USER_PASSWORD=your-test-password
```

Tests that require authentication will be skipped if credentials are not provided.

## Test Coverage

### Unit Tests (75 tests)
- **Validation Schemas**: 61 tests covering all Zod schemas
  - Password validation
  - Itinerary schema (title, description, tags, budget)
  - Activity and Day schemas
  - Category/Section schemas (guide type)
  - Login/Signup schemas with refinements

- **Share Helpers**: 14 tests covering Web Share API
  - Feature detection
  - File creation
  - Share data building
  - Error handling

### E2E Tests (50+ tests per browser)
- **Authentication**: Login, signup, OAuth, session management
- **Dashboard**: My Trips, Explore, navigation
- **Itinerary**: CRUD operations, type selection, validation
- **Share**: Template/format selection, download, modal

## Test Plan Reference

See `docs/testplan.md` for the comprehensive test plan with 500+ scenarios.
Test IDs in these files map to the test plan (e.g., AUTH-001, ITIN-024).

## Writing New Tests

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { mySchema } from '@/lib/utils/validation'

describe('mySchema', () => {
  it('validates correct input', () => {
    const result = mySchema.safeParse({ ... })
    expect(result.success).toBe(true)
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature', () => {
  test('does something', async ({ page }) => {
    await page.goto('/path')
    await expect(page.locator('element')).toBeVisible()
  })
})
```
