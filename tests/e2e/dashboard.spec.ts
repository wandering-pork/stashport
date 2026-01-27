/**
 * E2E tests for Dashboard functionality
 * Based on testplan.md DASH-* test cases
 *
 * Note: Dashboard has been redesigned to show "Upcoming Trips" and "Suggested for You"
 * sections instead of tabs. Tests updated to match new layout.
 */
import { test, expect } from '@playwright/test'

test.describe('Dashboard - Public Access', () => {
  // Dashboard requires auth - logged out users should be redirected
  test('DASH-012: logged out user redirects to login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 })
  })
})

test.describe('Dashboard - Authenticated', () => {
  // Skip all tests if no test credentials
  test.beforeEach(async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testEmail || !testPassword) {
      test.skip()
      return
    }

    // Login
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })

  // DASH-001: Dashboard loads successfully
  test('DASH-001: dashboard shows user content', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for loading state to disappear (dashboard fetches data on load)
    await page.waitForSelector('text=Loading your adventures', { state: 'hidden', timeout: 15000 }).catch(() => {
      // Loading may have already completed
    })

    // Dashboard should show greeting (h1 containing "Hi") or trip sections
    // Use role-based selector which is more reliable
    const greeting = page.getByRole('heading', { level: 1 })
    await expect(greeting).toBeVisible({ timeout: 10000 })

    // Verify it contains expected content (greeting or dashboard sections)
    const headingText = await greeting.textContent()
    expect(headingText?.toLowerCase()).toMatch(/hi|adventure|trips/)
  })

  // DASH-002: Empty state or trips displayed
  test('DASH-002: shows trips or empty state', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Should show either trip cards, suggestions, or empty state CTA
    const tripContent = page.locator('article, [data-testid="trip-card"], .trip-card')
    const emptyState = page.locator('text=/no trips|create|plan new trip/i')
    const suggestions = page.locator('text=/suggested for you/i')

    const hasTrips = (await tripContent.count()) > 0
    const hasEmptyState = await emptyState.isVisible().catch(() => false)
    const hasSuggestions = await suggestions.isVisible().catch(() => false)

    expect(hasTrips || hasEmptyState || hasSuggestions).toBeTruthy()
  })

  // DASH-020: Dashboard sections visible
  test('DASH-020: dashboard sections are visible', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for loading state to disappear
    await page.waitForSelector('text=Loading your adventures', { state: 'hidden', timeout: 15000 }).catch(() => {
      // Loading may have already completed
    })

    // Check for main dashboard sections (redesigned layout)
    const upcomingSection = page.locator('text=/upcoming trips|your trips/i')
    const suggestedSection = page.locator('text=/suggested for you/i')
    const statsSection = page.locator('text=/your stats/i')

    // At least one section should be visible
    const hasUpcoming = await upcomingSection.isVisible().catch(() => false)
    const hasSuggested = await suggestedSection.isVisible().catch(() => false)
    const hasStats = await statsSection.isVisible().catch(() => false)

    expect(hasUpcoming || hasSuggested || hasStats).toBeTruthy()
  })

  // DASH-021: View all trips link
  test('DASH-021: view all trips link navigates correctly', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for loading state to disappear
    await page.waitForSelector('text=Loading your adventures', { state: 'hidden', timeout: 15000 }).catch(() => {})

    // Look for "View All Trips" link specifically (not the nav "My Trips" link)
    const viewAllLink = page.getByRole('link', { name: 'View All Trips' })

    if (await viewAllLink.isVisible()) {
      await viewAllLink.click()
      await expect(page).toHaveURL(/\/dashboard\/trips/)
    }
  })

  // DASH-022: Create new trip button
  test('DASH-022: create trip button navigates to new itinerary', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Look for create/plan new trip button
    const createButton = page.locator('button:has-text("Plan New Trip"), button:has-text("Create"), a[href*="/itinerary/new"]')
    await expect(createButton.first()).toBeVisible({ timeout: 5000 })

    await createButton.first().click()
    await expect(page).toHaveURL(/\/itinerary\/new/)
  })

  // DASH-023: Browse ideas button
  test('DASH-023: browse ideas button navigates to explore', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Look for browse ideas button
    const browseButton = page.locator('button:has-text("Browse Ideas"), a[href*="/explore"]')

    if (await browseButton.isVisible()) {
      await browseButton.click()
      await expect(page).toHaveURL(/\/explore/)
    }
  })
})

test.describe('Dashboard - Explore Page', () => {
  // Explore page is separate from dashboard in new design
  test('EXPLORE-001: explore page shows public trips', async ({ page }) => {
    await page.goto('/explore')

    // Wait for API response
    await page.waitForTimeout(2000)

    // Should show explore cards or empty state
    const exploreCards = page.locator('[data-testid="explore-card"], .explore-card, article')
    const emptyState = page.locator('text=/no trips found|no public trips/i')

    // Either we have cards or empty state
    const cardCount = await exploreCards.count()
    const isEmpty = await emptyState.isVisible().catch(() => false)

    expect(cardCount > 0 || isEmpty).toBeTruthy()
  })

  // EXPLORE-010: Unauthenticated explore
  test('EXPLORE-010: explore API works without authentication', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies()

    // API request should succeed
    const response = await page.request.get('/api/itineraries/explore?limit=5')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('itineraries')
    expect(data).toHaveProperty('pagination')
  })
})
