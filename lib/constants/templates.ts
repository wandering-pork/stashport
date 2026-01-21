// lib/constants/templates.ts

// Template styles for visual sharing
export const TEMPLATE_STYLES = {
  clean: {
    id: 'clean',
    name: 'Clean',
    description: 'Cream background with elegant typography',
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Full-bleed photo with white text overlay',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, clean design with subtle borders',
  },
} as const

export type TemplateStyle = keyof typeof TEMPLATE_STYLES

// Template formats for different social platforms
export const TEMPLATE_FORMATS = {
  story: {
    id: 'story',
    name: 'Story',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Instagram/TikTok Stories',
  },
  square: {
    id: 'square',
    name: 'Square',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    description: 'Instagram Feed, Twitter',
  },
  portrait: {
    id: 'portrait',
    name: 'Portrait',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    description: 'Instagram Feed (optimal)',
  },
} as const

export type TemplateFormat = keyof typeof TEMPLATE_FORMATS

// Itinerary types
export const ITINERARY_TYPES = {
  daily: {
    id: 'daily',
    name: 'Plan My Trip',
    description: 'Create a day-by-day itinerary with activities',
    icon: 'Calendar',
  },
  guide: {
    id: 'guide',
    name: 'Share My Favorites',
    description: 'Curate a collection of your favorite spots',
    icon: 'Heart',
  },
} as const

export type ItineraryTypeKey = keyof typeof ITINERARY_TYPES

// Social platforms for sharing
export const SOCIAL_PLATFORMS = {
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    icon: 'Twitter',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'Video',
  },
} as const

export type SocialPlatform = keyof typeof SOCIAL_PLATFORMS

// Brand colors for templates (matching design tokens)
export const TEMPLATE_COLORS = {
  primary: '#f86f4d', // Coral
  secondary: '#14b8a6', // Teal
  accent: '#f59e0b', // Golden
  cream: '#fffaf5', // Background cream
  lightGray: '#f8fafc', // Minimal background
  darkOverlay: 'rgba(0, 0, 0, 0.5)', // Bold template overlay
} as const
