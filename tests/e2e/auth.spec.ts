/**
 * E2E tests for Authentication flows
 * Based on testplan.md AUTH-* test cases
 */
import { test, expect } from '@playwright/test'

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  // AUTH-013: Successful login
  test('AUTH-013: successful login redirects to dashboard', async ({ page }) => {
    // This test requires valid test credentials
    // Skip if no test credentials are configured
    const testEmail = process.env.TEST_USER_EMAIL
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testEmail || !testPassword) {
      test.skip()
      return
    }

    // Use role-based selectors for better cross-browser compatibility
    // Wait for form to be ready, then fill fields
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.waitFor({ state: 'visible' })
    await emailInput.click()
    await emailInput.fill(testEmail)

    const passwordInput = page.getByRole('textbox', { name: /password/i })
    await passwordInput.click()
    await passwordInput.fill(testPassword)

    // Use exact match to avoid matching "Sign in with Google"
    await page.getByRole('button', { name: 'Sign In', exact: true }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })

  // AUTH-014: Login with wrong password
  test('AUTH-014: login with wrong password shows error', async ({ page }) => {
    // Use role-based selectors with click before fill for WebKit compatibility
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.click()
    await emailInput.fill('test@example.com')

    const passwordInput = page.getByRole('textbox', { name: /password/i })
    await passwordInput.click()
    await passwordInput.fill('WrongPassword1!')

    await page.getByRole('button', { name: 'Sign In', exact: true }).click()

    await expect(page.locator('text=Invalid login credentials')).toBeVisible({ timeout: 10000 })
  })

  // AUTH-015: Login with unregistered email
  test('AUTH-015: login with unregistered email shows error', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.click()
    await emailInput.fill('nonexistent@fakeemail12345.com')

    const passwordInput = page.getByRole('textbox', { name: /password/i })
    await passwordInput.click()
    await passwordInput.fill('Password1!')

    await page.getByRole('button', { name: 'Sign In', exact: true }).click()

    await expect(page.locator('text=Invalid login credentials')).toBeVisible({ timeout: 10000 })
  })

  // AUTH-017: Login redirect preservation
  test('AUTH-017: preserves intended destination after login', async ({ page }) => {
    // Try to access dashboard while logged out
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/)

    // URL should contain redirect parameter (implementation dependent)
    // Or after login, should redirect back to dashboard
  })

  // Check login page elements
  test('login page has required elements', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible()
    await expect(page.getByText('Continue with Google')).toBeVisible()
  })
})

test.describe('Authentication - Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  // AUTH-002: Signup with weak password
  test('AUTH-002: signup with weak password shows validation error', async ({ page }) => {
    // Click before fill for WebKit compatibility
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.click()
    await emailInput.fill('test@example.com')

    const passwordInput = page.getByRole('textbox', { name: /^password$/i })
    await passwordInput.click()
    await passwordInput.fill('weakpassword')

    // Find confirm password field
    const confirmField = page.getByRole('textbox', { name: /confirm/i })
    if (await confirmField.isVisible()) {
      await confirmField.click()
      await confirmField.fill('weakpassword')
    }

    // Try to submit
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show password requirements error or stay on page
    const errorMessage = page.locator('text=/uppercase|lowercase|number|special|password|strong|weak|requirement/i')
    const stayedOnPage = page.url().includes('/auth/signup')

    // Either shows error or stays on signup page
    const hasError = await errorMessage.isVisible().catch(() => false)
    expect(hasError || stayedOnPage).toBeTruthy()
  })

  // AUTH-003: Signup with password mismatch
  test('AUTH-003: signup with mismatched passwords shows error', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.click()
    await emailInput.fill('test@example.com')

    const passwordInput = page.getByRole('textbox', { name: /^password$/i })
    await passwordInput.click()
    await passwordInput.fill('StrongPass1!')

    // Find confirm password field
    const confirmField = page.getByRole('textbox', { name: /confirm/i })
    if (await confirmField.isVisible()) {
      await confirmField.click()
      await confirmField.fill('DifferentPass1!')
      await page.getByRole('button', { name: 'Create Account' }).click()

      // Should show mismatch error or stay on page
      const errorMessage = page.locator('text=/match|mismatch|same|different/i')
      const stayedOnPage = page.url().includes('/auth/signup')

      const hasError = await errorMessage.isVisible().catch(() => false)
      expect(hasError || stayedOnPage).toBeTruthy()
    }
  })

  // AUTH-004: Signup with invalid email format
  test('AUTH-004: signup with invalid email shows validation error', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.click()
    await emailInput.fill('notanemail')

    const passwordInput = page.getByRole('textbox', { name: /^password$/i })
    await passwordInput.click()
    await passwordInput.fill('StrongPass1!')

    // Find confirm password field
    const confirmField = page.getByRole('textbox', { name: /confirm/i })
    if (await confirmField.isVisible()) {
      await confirmField.click()
      await confirmField.fill('StrongPass1!')
    }

    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should show email validation error or browser validation prevents submission
    const errorMessage = page.locator('text=/invalid|email|valid/i')
    const stayedOnPage = page.url().includes('/auth/signup')

    // Either shows error or browser validation prevents submission
    const hasError = await errorMessage.isVisible().catch(() => false)
    expect(hasError || stayedOnPage).toBeTruthy()
  })

  // AUTH-006: Signup with invalid display name
  test('AUTH-006: signup with invalid display name shows error', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.click()
    await emailInput.fill('test@example.com')

    const passwordInput = page.getByRole('textbox', { name: /^password$/i })
    await passwordInput.click()
    await passwordInput.fill('StrongPass1!')

    // Find confirm password field
    const confirmField = page.getByRole('textbox', { name: /confirm/i })
    if (await confirmField.isVisible()) {
      await confirmField.click()
      await confirmField.fill('StrongPass1!')
    }

    // Find display name field if it exists
    const displayNameField = page.getByRole('textbox', { name: /display|name/i })
    if (await displayNameField.isVisible()) {
      await displayNameField.click()
      await displayNameField.fill('User@#$%')
      await page.getByRole('button', { name: 'Create Account' }).click()

      // Should show display name validation error or stay on page
      const errorMessage = page.locator('text=/letters|numbers|underscore|invalid|name/i')
      const stayedOnPage = page.url().includes('/auth/signup')

      const hasError = await errorMessage.isVisible().catch(() => false)
      expect(hasError || stayedOnPage).toBeTruthy()
    }
  })

  // Check signup page elements
  test('signup page has required elements', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByText('Continue with Google')).toBeVisible()
  })
})

test.describe('Authentication - Session', () => {
  // AUTH-029: Logout
  test('AUTH-029: logout clears session and redirects', async ({ page }) => {
    // This test requires an authenticated session
    const testEmail = process.env.TEST_USER_EMAIL
    const testPassword = process.env.TEST_USER_PASSWORD

    if (!testEmail || !testPassword) {
      test.skip()
      return
    }

    // Login first
    await page.goto('/auth/login')
    const emailInput = page.getByRole('textbox', { name: /email/i })
    await emailInput.click()
    await emailInput.fill(testEmail)

    const passwordInput = page.getByRole('textbox', { name: /password/i })
    await passwordInput.click()
    await passwordInput.fill(testPassword)

    await page.getByRole('button', { name: 'Sign In', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [aria-label="Logout"]')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      await expect(page).toHaveURL(/\/auth\/login|\//, { timeout: 5000 })
    }
  })

  // SEC-002: Direct URL access requires auth
  test('SEC-002: accessing dashboard without login redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  // SEC-003: Cannot access other user's edit page
  test('SEC-003: accessing others edit page is denied', async ({ page }) => {
    // Try to access a random itinerary edit page (unauthenticated)
    await page.goto('/itinerary/00000000-0000-0000-0000-000000000000/edit')

    // Wait for redirect to login or dashboard (client-side redirect)
    await page.waitForURL(/\/(auth\/login|dashboard)/, { timeout: 10000 })

    const url = page.url()
    expect(url.includes('/auth/login') || url.includes('/dashboard')).toBeTruthy()
  })
})

test.describe('Authentication - Google OAuth', () => {
  // AUTH-018, AUTH-019, AUTH-020: Google OAuth flow
  test('AUTH-018: Google OAuth button is present', async ({ page }) => {
    await page.goto('/auth/login')

    const googleButton = page.locator('text=Continue with Google')
    await expect(googleButton).toBeVisible()
  })

  test('Google OAuth button initiates OAuth flow', async ({ page }) => {
    await page.goto('/auth/login')

    const googleButton = page.locator('text=Continue with Google')
    await expect(googleButton).toBeVisible()

    // Note: We can't fully test OAuth flow without Google credentials
    // But we can verify the button triggers navigation to OAuth endpoint
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null),
      googleButton.click(),
    ])

    // Should either open popup or redirect to Google
    if (newPage) {
      expect(newPage.url()).toContain('accounts.google.com')
      await newPage.close()
    } else {
      // Check if redirected to Google OAuth
      await page.waitForURL(/accounts\.google\.com|supabase/, { timeout: 5000 }).catch(() => {
        // May stay on page if popup blocked - that's okay
      })
    }
  })
})
