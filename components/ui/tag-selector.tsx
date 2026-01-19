'use client'

import { cn } from '@/lib/utils/cn'
import { TRIP_TAGS } from '@/lib/constants/tags'
import { Check } from 'lucide-react'

interface TagSelectorProps {
  selected: string[]
  onChange: (tags: string[]) => void
  max?: number
  disabled?: boolean
  className?: string
}

export function TagSelector({
  selected,
  onChange,
  max = 3,
  disabled = false,
  className,
}: TagSelectorProps) {
  const handleToggle = (tag: string) => {
    if (disabled) return

    if (selected.includes(tag)) {
      // Remove tag
      onChange(selected.filter(t => t !== tag))
    } else if (selected.length < max) {
      // Add tag
      onChange([...selected, tag])
    }
  }

  const isMaxReached = selected.length >= max

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {TRIP_TAGS.map((tag) => {
        const isSelected = selected.includes(tag)
        const isDisabled = disabled || (!isSelected && isMaxReached)

        return (
          <button
            key={tag}
            type="button"
            onClick={() => handleToggle(tag)}
            disabled={isDisabled}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              'border transition-all duration-200',
              isSelected
                ? 'bg-primary-100 text-primary-700 border-primary-300'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200',
              isDisabled && !isSelected && 'opacity-50 cursor-not-allowed hover:bg-neutral-100'
            )}
          >
            {isSelected && <Check className="w-3.5 h-3.5" />}
            {tag}
          </button>
        )
      })}
    </div>
  )
}
