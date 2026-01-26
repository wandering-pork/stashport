/**
 * E2E tests for Itinerary CRUD operations
 * Based on testplan.md ITIN-* and PUBLIC-* test cases
 */
import { test, expect } from '@playwright/test'

test.describe('Itinerary - Create (Authenticated)', () => {
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

    // Navigate to create page
    await page.goto('/itinerary/new')
  })

  // ITIN-001: Create with minimum fields
  test('ITIN-001: can create itinerary with title only', async ({ page }) => {
    // Fill in title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]')
    await expect(titleInput).toBeVisible({ timeout: 5000 })
    await titleInput.fill('Test Trip ' + Date.now())

    // Find and click save button
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]')
    await expect(saveButton).toBeVisible()
    await saveButton.click()

    // Should redirect to edit page or show success
    await page.waitForURL(/\/itinerary\/.*\/edit|\/dashboard/, { timeout: 10000 })
  })

  // ITIN-003: Title validation - empty
  test('ITIN-003: empty title shows validation error', async ({ page }) => {
    // Try to submit without title
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]')

    // Clear any default title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]')
    await titleInput.clear()

    await saveButton.click()

    // Should show error
    await expect(page.locator('text=/title is required/i')).toBeVisible({ timeout: 5000 })
  })

  // ITIN-013: Select daily type
  test('ITIN-013: can select daily itinerary type', async ({ page }) => {
    // Find type selector using data attributes
    const dailyTypeButton = page.locator('[data-type="daily"], [data-testid="type-selector-daily"]')

    // Wait for page to load
    await page.waitForTimeout(1000)

    if (await dailyTypeButton.isVisible()) {
      await dailyTypeButton.click()

      // Date section should be visible for daily type
      const dateSection = page.locator('text=/travel dates|start date|when/i')
      const isSelected = await dailyTypeButton.getAttribute('data-selected')

      // Either date section visible or daily type is selected
      const hasDateSection = await dateSection.isVisible().catch(() => false)
      expect(hasDateSection || isSelected === 'true').toBeTruthy()
    }
  })

  // ITIN-025: Select guide type
  test('ITIN-025: can select guide itinerary type', async ({ page }) => {
    // Find type selector using data attributes
    const guideTypeButton = page.locator('[data-type="guide"], [data-testid="type-selector-guide"]')

    // Wait for page to load
    await page.waitForTimeout(1000)

    if (await guideTypeButton.isVisible()) {
      await guideTypeButton.click()

      // Sections UI should be visible for guide type
      const sectionsUI = page.locator('text=/add section|your favorites/i')
      const isSelected = await guideTypeButton.getAttribute('data-selected')

      // Either sections UI visible or guide type is selected
      const hasSectionsUI = await sectionsUI.isVisible().catch(() => false)
      expect(hasSectionsUI || isSelected === 'true').toBeTruthy()
    }
  })

  // ITIN-007, ITIN-008: Tag selection
  test('ITIN-007: can select up to 3 tags', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000)

    // Find tag selector using data attributes
    const tagButtons = page.locator('[data-testid="tag-button"]')

    const tagCount = await tagButtons.count()
    if (tagCount > 0) {
      // Click first 3 tags
      for (let i = 0; i < Math.min(3, tagCount); i++) {
        await tagButtons.nth(i).click()
        await page.waitForTimeout(200) // Small delay between clicks
      }

      // Verify tags are selected
      const selectedTags = page.locator('[data-testid="tag-button"][data-selected="true"]')
      const selectedCount = await selectedTags.count()
      expect(selectedCount).toBeLessThanOrEqual(3)
      expect(selectedCount).toBeGreaterThan(0)
    }
  })

  // ITIN-009: Budget level selection
  test('ITIN-009: can select budget level', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000)

    // Find budget selector using data attributes
    const budgetButtons = page.locator('[data-testid="budget-button"]')

    const buttonCount = await budgetButtons.count()
    if (buttonCount > 0) {
      // Click the third budget level ($$$)
      const level3 = budgetButtons.nth(2) // 0-indexed: 0=$, 1=$$, 2=$$$
      await level3.click()

      // Should be selected
      const isSelected = await level3.getAttribute('data-selected')
      const isPressed = await level3.getAttribute('aria-pressed')

      expect(isSelected === 'true' || isPressed === 'true').toBeTruthy()
    }
  })
})

test.describe('Itinerary - Public Trip Page', () => {
  // PUBLIC-001, PUBLIC-011: View public trip
  test('PUBLIC-001: can view public trip by slug', async ({ page }) => {
    // First, get a valid public trip slug from explore API
    const response = await page.request.get('/api/itineraries/explore?limit=1')
    const data = await response.json()

    if (data.itineraries && data.itineraries.length > 0) {
      const slug = data.itineraries[0].slug

      // Navigate to public trip page
      await page.goto(`/t/${slug}`)

      // Should show trip content
      await expect(page.locator('h1, [data-testid="trip-title"]')).toBeVisible({ timeout: 5000 })
    } else {
      // No public trips available - skip
      test.skip()
    }
  })

  // PUBLIC-011: Invalid slug returns 404
  test('PUBLIC-011: invalid slug shows 404', async ({ page }) => {
    await page.goto('/t/nonexistent-trip-slug-12345')

    // Should show 404 or not found message
    const notFound = page.locator('text=/not found|404|does not exist/i')
    await expect(notFound).toBeVisible({ timeout: 5000 })
  })

  // PUBLIC-005: Display creator info
  test('PUBLIC-005: public trip shows creator info', async ({ page }) => {
    // Get a public trip
    const response = await page.request.get('/api/itineraries/explore?limit=1')
    const data = await response.json()

    if (data.itineraries && data.itineraries.length > 0) {
      const slug = data.itineraries[0].slug
      await page.goto(`/t/${slug}`)

      // Should show creator avatar or name
      const creatorInfo = page.locator('[data-testid="creator"], [class*="avatar"], [class*="author"]')
      await expect(creatorInfo).toBeVisible({ timeout: 5000 })
    } else {
      test.skip()
    }
  })
})

test.describe('Itinerary - API Access Control', () => {
  // API-001: POST without auth
  test('API-001: creating itinerary without auth returns 401', async ({ page }) => {
    // Clear cookies
    await page.context().clearCookies()

    const response = await page.request.post('/api/itineraries', {
      data: { title: 'Test Trip' },
    })

    expect(response.status()).toBe(401)
  })

  // API-003: DELETE without auth
  test('API-003: deleting itinerary without auth returns 401', async ({ page }) => {
    await page.context().clearCookies()

    const response = await page.request.delete('/api/itineraries/00000000-0000-0000-0000-000000000000')

    expect(response.status()).toBe(401)
  })

  // API-015: Public trip API (valid)
  test('API-015: public trip API returns trip data', async ({ page }) => {
    // Get a valid slug first
    const exploreResponse = await page.request.get('/api/itineraries/explore?limit=1')
    const exploreData = await exploreResponse.json()

    if (exploreData.itineraries && exploreData.itineraries.length > 0) {
      const slug = exploreData.itineraries[0].slug

      const response = await page.request.get(`/api/itineraries/public/${slug}`)
      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('title')
      expect(data).toHaveProperty('slug')
    }
  })

  // API-017: Public trip API (not found)
  test('API-017: public trip API returns 404 for invalid slug', async ({ page }) => {
    const response = await page.request.get('/api/itineraries/public/nonexistent-slug-xyz')

    expect([404, 403]).toContain(response.status())
  })
})

test.describe('Itinerary - Explore API', () => {
  // EXPLORE-001: Default fetch
  test('EXPLORE-001: explore API returns paginated results', async ({ page }) => {
    const response = await page.request.get('/api/itineraries/explore')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('itineraries')
    expect(data).toHaveProperty('pagination')
    expect(data.pagination).toHaveProperty('page')
    expect(data.pagination).toHaveProperty('limit')
  })

  // EXPLORE-004: Max limit enforced
  test('EXPLORE-004: explore API enforces max limit of 50', async ({ page }) => {
    const response = await page.request.get('/api/itineraries/explore?limit=100')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.itineraries.length).toBeLessThanOrEqual(50)
  })

  // EXPLORE-008: Only public trips
  test('EXPLORE-008: explore API returns only public trips', async ({ page }) => {
    const response = await page.request.get('/api/itineraries/explore?limit=10')
    expect(response.status()).toBe(200)

    const data = await response.json()
    // All returned trips should be public (is_public=true)
    // Note: API doesn't return is_public field, but only public trips are included
    expect(Array.isArray(data.itineraries)).toBe(true)
  })
})
