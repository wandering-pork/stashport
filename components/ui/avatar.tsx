'use client'

import { cn } from '@/lib/utils/cn'

interface AvatarProps {
  name: string | null
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
  'data-testid'?: string
}

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-base',
}

// Generate a deterministic color from a string
function stringToColor(str: string): string {
  const colors = [
    '#f86f4d', // primary coral
    '#14b8a6', // secondary teal
    '#f59e0b', // accent golden
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f97316', // orange
  ]

  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

// Extract initials from name
function getInitials(name: string | null): string {
  if (!name || name.trim() === '') return '?'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function Avatar({ name, size = 'md', color, className, 'data-testid': dataTestId }: AvatarProps) {
  const initials = getInitials(name)
  const bgColor = color || stringToColor(name || 'anonymous')

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-heading font-bold text-white avatar',
        SIZE_CLASSES[size],
        className
      )}
      style={{ backgroundColor: bgColor }}
      aria-label={name ? `Avatar for ${name}` : 'Anonymous avatar'}
      data-testid={dataTestId}
    >
      {initials}
    </div>
  )
}
