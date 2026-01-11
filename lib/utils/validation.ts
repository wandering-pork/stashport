import { z } from 'zod'

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

export const itinerarySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  destination: z.string().max(100, 'Destination must be less than 100 characters').optional(),
  isPublic: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const daySchema = z.object({
  dayNumber: z.number().min(1, 'Day number must be at least 1'),
  date: z.string().min(1, 'Date is required').refine(val => !isNaN(new Date(val).getTime()), 'Invalid date format'),
  title: z.string().max(200, 'Day title must be less than 200 characters').optional(),
})

export const activitySchema = z.object({
  title: z.string().min(1, 'Activity title is required').max(200, 'Activity title must be less than 200 characters'),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type ItineraryInput = z.infer<typeof itinerarySchema>
export type DayInput = z.infer<typeof daySchema>
export type ActivityInput = z.infer<typeof activitySchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
