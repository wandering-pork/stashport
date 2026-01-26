/**
 * Unit tests for Zod validation schemas
 * Tests based on testplan.md validation requirements
 */
import { describe, it, expect } from 'vitest'
import {
  passwordSchema,
  itinerarySchema,
  daySchema,
  activitySchema,
  categorySchema,
  categoryItemSchema,
  loginSchema,
  signupSchema,
  userProfileSchema,
} from '@/lib/utils/validation'

describe('passwordSchema', () => {
  it('accepts valid password with all requirements', () => {
    const result = passwordSchema.safeParse('Password1!')
    expect(result.success).toBe(true)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Pass1!')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('at least 8 characters')
  })

  it('rejects password without uppercase letter', () => {
    const result = passwordSchema.safeParse('password1!')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('uppercase')
  })

  it('rejects password without lowercase letter', () => {
    const result = passwordSchema.safeParse('PASSWORD1!')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('lowercase')
  })

  it('rejects password without number', () => {
    const result = passwordSchema.safeParse('Password!')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('number')
  })

  it('rejects password without special character', () => {
    const result = passwordSchema.safeParse('Password1')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('special character')
  })

  it('accepts all valid special characters', () => {
    const specialChars = ['@', '$', '!', '%', '*', '?', '&']
    specialChars.forEach(char => {
      const result = passwordSchema.safeParse(`Password1${char}`)
      expect(result.success).toBe(true)
    })
  })
})

describe('itinerarySchema', () => {
  const validItinerary = {
    title: 'My Tokyo Trip',
    description: 'A wonderful journey',
    destination: 'Tokyo, Japan',
    isPublic: true,
    budgetLevel: 3,
    tags: ['Adventure', 'Food Tour'],
  }

  // Title validation (ITIN-003, ITIN-004)
  describe('title', () => {
    it('requires title (ITIN-003)', () => {
      const result = itinerarySchema.safeParse({ ...validItinerary, title: '' })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('Title is required')
    })

    it('rejects title over 200 characters (ITIN-004)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        title: 'a'.repeat(201),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('less than 200')
    })

    it('accepts title at max length', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        title: 'a'.repeat(200),
      })
      expect(result.success).toBe(true)
    })
  })

  // Description validation (ITIN-005)
  describe('description', () => {
    it('rejects description over 2000 characters (ITIN-005)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        description: 'a'.repeat(2001),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('less than 2000')
    })

    it('accepts null description', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        description: null,
      })
      expect(result.success).toBe(true)
      expect(result.data?.description).toBeUndefined()
    })

    it('transforms empty string to undefined', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        description: '',
      })
      expect(result.success).toBe(true)
      expect(result.data?.description).toBeUndefined()
    })
  })

  // Destination validation (ITIN-006)
  describe('destination', () => {
    it('rejects destination over 100 characters (ITIN-006)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        destination: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('less than 100')
    })

    it('accepts null destination', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        destination: null,
      })
      expect(result.success).toBe(true)
    })
  })

  // Tags validation (ITIN-007, ITIN-008, API-014)
  describe('tags', () => {
    it('accepts up to 3 valid tags (ITIN-007)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        tags: ['Adventure', 'Romantic', 'Budget'],
      })
      expect(result.success).toBe(true)
    })

    it('rejects more than 3 tags (ITIN-008)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        tags: ['Adventure', 'Romantic', 'Budget', 'Luxury'],
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('Maximum 3 tags')
    })

    it('rejects invalid tag (API-014)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        tags: ['InvalidTag'],
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('Invalid tag')
    })

    it('accepts all valid tags', () => {
      const validTags = [
        'Adventure', 'Romantic', 'Budget', 'Luxury',
        'Family', 'Solo', 'Food Tour', 'Road Trip',
      ]
      validTags.forEach(tag => {
        const result = itinerarySchema.safeParse({
          ...validItinerary,
          tags: [tag],
        })
        expect(result.success).toBe(true)
      })
    })
  })

  // Budget level validation (API-013)
  describe('budgetLevel', () => {
    it('accepts budget levels 1-4 (ITIN-009)', () => {
      [1, 2, 3, 4].forEach(level => {
        const result = itinerarySchema.safeParse({
          ...validItinerary,
          budgetLevel: level,
        })
        expect(result.success).toBe(true)
      })
    })

    it('rejects budget level 5 (API-013)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        budgetLevel: 5,
      })
      expect(result.success).toBe(false)
    })

    it('rejects budget level 0', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        budgetLevel: 0,
      })
      expect(result.success).toBe(false)
    })

    it('accepts null budget level (ITIN-010)', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        budgetLevel: null,
      })
      expect(result.success).toBe(true)
    })
  })

  // Dates validation
  describe('dates', () => {
    it('accepts valid date strings', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        startDate: '2026-03-01',
        endDate: '2026-03-07',
      })
      expect(result.success).toBe(true)
    })

    it('transforms null dates to undefined', () => {
      const result = itinerarySchema.safeParse({
        ...validItinerary,
        startDate: null,
        endDate: null,
      })
      expect(result.success).toBe(true)
      expect(result.data?.startDate).toBeUndefined()
      expect(result.data?.endDate).toBeUndefined()
    })
  })

  // isPublic default
  it('defaults isPublic to true', () => {
    const result = itinerarySchema.safeParse({
      title: 'Test Trip',
    })
    expect(result.success).toBe(true)
    expect(result.data?.isPublic).toBe(true)
  })
})

describe('daySchema', () => {
  // Day number validation (daySchema.dayNumber)
  it('requires day number >= 1', () => {
    const result = daySchema.safeParse({ dayNumber: 0 })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('at least 1')
  })

  it('accepts valid day number', () => {
    const result = daySchema.safeParse({ dayNumber: 1 })
    expect(result.success).toBe(true)
  })

  // Date validation
  it('accepts valid date format', () => {
    const result = daySchema.safeParse({
      dayNumber: 1,
      date: '2026-03-01',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid date format', () => {
    const result = daySchema.safeParse({
      dayNumber: 1,
      date: 'not-a-date',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('Invalid date')
  })

  // Title validation
  it('accepts day title within limit', () => {
    const result = daySchema.safeParse({
      dayNumber: 1,
      title: 'Day 1: Exploring Tokyo',
    })
    expect(result.success).toBe(true)
  })

  it('rejects day title over 200 characters', () => {
    const result = daySchema.safeParse({
      dayNumber: 1,
      title: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })
})

describe('activitySchema', () => {
  const validActivity = {
    title: 'Visit Tokyo Tower',
    location: 'Minato, Tokyo',
    startTime: '09:00',
    endTime: '11:00',
    notes: 'Best views at sunset',
  }

  // Title validation (ITIN-018)
  it('requires activity title (ITIN-018)', () => {
    const result = activitySchema.safeParse({ ...validActivity, title: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('Activity title is required')
  })

  it('rejects activity title over 200 characters', () => {
    const result = activitySchema.safeParse({
      ...validActivity,
      title: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  // Location validation
  it('rejects location over 200 characters', () => {
    const result = activitySchema.safeParse({
      ...validActivity,
      location: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  // Notes validation (API-011)
  it('rejects notes over 1000 characters (API-011)', () => {
    const result = activitySchema.safeParse({
      ...validActivity,
      notes: 'a'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it('accepts notes at max length', () => {
    const result = activitySchema.safeParse({
      ...validActivity,
      notes: 'a'.repeat(1000),
    })
    expect(result.success).toBe(true)
  })

  // Optional fields
  it('accepts activity with only title', () => {
    const result = activitySchema.safeParse({ title: 'Quick Stop' })
    expect(result.success).toBe(true)
  })
})

describe('categorySchema', () => {
  const validCategory = {
    name: 'Best Restaurants',
    icon: '🍜',
    sortOrder: 0,
    items: [],
  }

  // Name validation (ITIN-032)
  it('requires section name', () => {
    const result = categorySchema.safeParse({ ...validCategory, name: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('Section name is required')
  })

  it('rejects name over 100 characters (API-012)', () => {
    const result = categorySchema.safeParse({
      ...validCategory,
      name: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('less than 100')
  })

  // Icon validation
  it('accepts emoji icon', () => {
    const result = categorySchema.safeParse(validCategory)
    expect(result.success).toBe(true)
  })

  it('defaults icon to 📍', () => {
    const result = categorySchema.safeParse({ name: 'Custom Section' })
    expect(result.success).toBe(true)
    expect(result.data?.icon).toBe('📍')
  })

  // Items validation
  it('accepts nested items', () => {
    const result = categorySchema.safeParse({
      ...validCategory,
      items: [
        { title: 'Sukiyabashi Jiro', location: 'Ginza', notes: 'Reserve ahead' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('defaults items to empty array', () => {
    const result = categorySchema.safeParse({ name: 'Test Section' })
    expect(result.success).toBe(true)
    expect(result.data?.items).toEqual([])
  })
})

describe('categoryItemSchema', () => {
  // Title validation (ITIN-032)
  it('requires item title', () => {
    const result = categoryItemSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('Item title is required')
  })

  it('rejects item title over 200 characters', () => {
    const result = categoryItemSchema.safeParse({ title: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  // Location and notes
  it('accepts full item with all fields', () => {
    const result = categoryItemSchema.safeParse({
      title: 'Sukiyabashi Jiro',
      location: 'Ginza, Tokyo',
      notes: 'Best sushi in the world',
      sortOrder: 1,
    })
    expect(result.success).toBe(true)
  })

  it('defaults sortOrder to 0', () => {
    const result = categoryItemSchema.safeParse({ title: 'Test Item' })
    expect(result.success).toBe(true)
    expect(result.data?.sortOrder).toBe(0)
  })
})

describe('loginSchema', () => {
  it('accepts valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1!',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email (AUTH-004)', () => {
    const result = loginSchema.safeParse({
      email: 'notanemail',
      password: 'Password1!',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('Invalid email')
  })

  it('validates password requirements', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'weak',
    })
    expect(result.success).toBe(false)
  })
})

describe('signupSchema', () => {
  const validSignup = {
    email: 'user@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
    displayName: 'JohnDoe',
  }

  // Password match validation (AUTH-003)
  it('rejects mismatched passwords (AUTH-003)', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      confirmPassword: 'Different1!',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('Passwords do not match')
  })

  // Display name validation (AUTH-006)
  it('rejects display name with special characters (AUTH-006)', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      displayName: 'User@#$',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('letters, numbers, underscores')
  })

  // Display name length (AUTH-007)
  it('rejects display name over 50 characters (AUTH-007)', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      displayName: 'a'.repeat(51),
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('less than 50')
  })

  it('rejects display name under 2 characters', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      displayName: 'J',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('at least 2')
  })

  it('accepts display name with spaces and underscores', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      displayName: 'John_Doe 123',
    })
    expect(result.success).toBe(true)
  })

  it('trims display name whitespace', () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      displayName: '  JohnDoe  ',
    })
    expect(result.success).toBe(true)
    expect(result.data?.displayName).toBe('JohnDoe')
  })

  it('allows optional display name', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    })
    expect(result.success).toBe(true)
  })
})

describe('userProfileSchema', () => {
  it('accepts valid display name', () => {
    const result = userProfileSchema.safeParse({ displayName: 'John Doe' })
    expect(result.success).toBe(true)
  })

  it('rejects display name over 100 characters', () => {
    const result = userProfileSchema.safeParse({
      displayName: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('accepts null display name', () => {
    const result = userProfileSchema.safeParse({ displayName: null })
    expect(result.success).toBe(true)
  })
})
