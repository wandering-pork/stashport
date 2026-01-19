'use client'

import { cn } from '@/lib/utils/cn'

interface TagPillProps {
  tag: string
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export function TagPill({ tag, size = 'sm', className }: TagPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        'bg-primary-50 text-primary-700 border border-primary-200',
        SIZE_CLASSES[size],
        className
      )}
    >
      {tag}
    </span>
  )
}
