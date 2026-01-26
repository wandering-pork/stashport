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
    <div className={cn('space-y-2', className)}>
      {/* Label and helper text */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-heading font-medium text-gray-700">
          Tags (Optional)
        </label>
        <span
          className={cn(
            'text-xs font-medium',
            isMaxReached ? 'text-primary-600' : 'text-gray-500'
          )}
          aria-live="polite"
        >
          {selected.length}/{max} selected
        </span>
      </div>

      {/* Tag buttons */}
      <div className="flex flex-wrap gap-2">
        {TRIP_TAGS.map((tag) => {
          const isSelected = selected.includes(tag)
          const isDisabled = disabled || (!isSelected && isMaxReached)

          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggle(tag)}
              disabled={isDisabled}
              aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag} tag`}
              aria-pressed={isSelected}
              data-testid="tag-button"
              data-tag={tag}
              data-selected={isSelected}
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
    </div>
  )
}
