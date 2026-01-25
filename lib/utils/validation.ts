import { z } from 'zod'
import { TRIP_TAGS } from '@/lib/constants/tags'

// Password requirements
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(
    PASSWORD_PATTERN,
    'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'
  )

// Helper to transform null/empty strings to undefined for optional fields
const optionalString = (maxLength: number, message?: string) =>
  z.string()
    .max(maxLength, message)
    .optional()
    .nullable()
    .transform(val => val || undefined)

export const itinerarySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: optionalString(2000, 'Description must be less than 2000 characters'),
  destination: optionalString(100, 'Destination must be less than 100 characters'),
  isPublic: z.boolean().default(true),
  startDate: z.string().optional().nullable().transform(val => val || undefined),
  endDate: z.string().optional().nullable().transform(val => val || undefined),
  budgetLevel: z.number().min(1).max(4).nullable().optional(),
  tags: z.array(z.string().refine(tag => TRIP_TAGS.includes(tag as any), 'Invalid tag'))
    .max(3, 'Maximum 3 tags allowed')
    .optional()
    .default([]),
})

export const daySchema = z.object({
  dayNumber: z.number().min(1, 'Day number must be at least 1'),
  date: z.string()
    .optional()
    .nullable()
    .transform(val => val || undefined)
    .refine(val => !val || !isNaN(new Date(val).getTime()), 'Invalid date format'),
  title: optionalString(200, 'Day title must be less than 200 characters'),
})

export const activitySchema = z.object({
  title: z.string().min(1, 'Activity title is required').max(200, 'Activity title must be less than 200 characters'),
  location: optionalString(200, 'Location must be less than 200 characters'),
  startTime: z.string().optional().nullable().transform(val => val || undefined),
  endTime: z.string().optional().nullable().transform(val => val || undefined),
  notes: optionalString(1000, 'Notes must be less than 1000 characters'),
})

// Category item schema for guide-type itineraries
export const categoryItemSchema = z.object({
  title: z.string().min(1, 'Item title is required').max(200, 'Item title must be less than 200 characters'),
  location: optionalString(200, 'Location must be less than 200 characters'),
  notes: optionalString(1000, 'Notes must be less than 1000 characters'),
  sortOrder: z.number().min(0).optional().default(0),
})

// Category/section schema for guide-type itineraries
export const categorySchema = z.object({
  name: z.string().min(1, 'Section name is required').max(100, 'Section name must be less than 100 characters'),
  icon: z.string().max(10, 'Icon must be an emoji or short string').optional().default('📍'),
  sortOrder: z.number().min(0).optional().default(0),
  items: z.array(categoryItemSchema).optional().default([]),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: z.string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(50, 'Nickname must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_\s]+$/, 'Nickname can only contain letters, numbers, underscores, and spaces')
    .optional()
    .transform(val => val?.trim() || undefined),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const userProfileSchema = z.object({
  displayName: z.string().max(100, 'Display name must be less than 100 characters').optional().nullable(),
})

export type ItineraryInput = z.infer<typeof itinerarySchema>
export type DayInput = z.infer<typeof daySchema>
export type ActivityInput = z.infer<typeof activitySchema>
export type CategoryItemInput = z.infer<typeof categoryItemSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
