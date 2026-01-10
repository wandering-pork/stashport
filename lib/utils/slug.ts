import { nanoid } from 'nanoid'

export function generateSlug(title: string): string {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)

  const suffix = nanoid(6).toLowerCase()
  return `${normalized}-${suffix}`
}

// Mock storage for unique slug checking (in real app, check database)
const usedSlugs = new Set<string>()

export function ensureUniqueSlug(baseSlug: string): string {
  let slug = baseSlug
  let counter = 1

  while (usedSlugs.has(slug)) {
    const parts = baseSlug.split('-')
    const basePart = parts.slice(0, -1).join('-') || baseSlug
    slug = `${basePart}-${counter}`
    counter++
  }

  usedSlugs.add(slug)
  return slug
}
