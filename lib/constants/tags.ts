// lib/constants/tags.ts
export const TRIP_TAGS = [
  'Adventure',
  'Romantic',
  'Budget',
  'Luxury',
  'Family',
  'Solo',
  'Food Tour',
  'Road Trip',
] as const

export type TripTag = (typeof TRIP_TAGS)[number]

export const BUDGET_LEVELS = {
  1: { label: '$', description: 'Budget' },
  2: { label: '$$', description: 'Moderate' },
  3: { label: '$$$', description: 'Upscale' },
  4: { label: '$$$$', description: 'Luxury' },
} as const

export type BudgetLevel = keyof typeof BUDGET_LEVELS
