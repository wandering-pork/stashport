// lib/constants/section-presets.ts

/**
 * Section presets for Guide-type itineraries.
 * These provide quick-start templates when users add a new section
 * to their curated favorites collection.
 */

export interface SectionPreset {
  icon: string
  name: string
  placeholder: string
}

export const SECTION_PRESETS: SectionPreset[] = [
  { icon: '🍜', name: 'Best Restaurants', placeholder: 'Add your favorite dining spots' },
  { icon: '☕', name: 'Coffee & Cafés', placeholder: 'Cozy spots for your caffeine fix' },
  { icon: '🏛️', name: 'Must-See Attractions', placeholder: 'The essential landmarks' },
  { icon: '🌿', name: 'Hidden Gems', placeholder: 'Off-the-beaten-path discoveries' },
  { icon: '🛍️', name: 'Shopping', placeholder: 'Where to find the best goods' },
  { icon: '🌅', name: 'Viewpoints', placeholder: 'Best spots for photos' },
  { icon: '🍸', name: 'Nightlife', placeholder: 'After-dark recommendations' },
  { icon: '🎨', name: 'Art & Culture', placeholder: 'Museums, galleries, performances' },
  { icon: '🏖️', name: 'Beaches', placeholder: 'Sandy shores and coastal escapes' },
  { icon: '🥾', name: 'Hiking & Nature', placeholder: 'Trails and outdoor adventures' },
  { icon: '🏨', name: 'Where to Stay', placeholder: 'Accommodation recommendations' },
  { icon: '✨', name: 'Custom Section', placeholder: 'Create your own category' },
] as const

/**
 * Get a section preset by name
 */
export function getSectionPreset(name: string): SectionPreset | undefined {
  return SECTION_PRESETS.find(preset => preset.name === name)
}

/**
 * Get the default icon for a custom section
 */
export const DEFAULT_SECTION_ICON = '📍'

/**
 * Section preset names for quick lookup
 */
export const PRESET_NAMES = SECTION_PRESETS.map(p => p.name)

export type SectionPresetName = (typeof PRESET_NAMES)[number]
