'use client'

import { cn } from '@/lib/utils/cn'
import { BUDGET_LEVELS } from '@/lib/constants/tags'

interface BudgetSelectorProps {
  value: number | null
  onChange: (level: number | null) => void
  disabled?: boolean
  className?: string
}

export function BudgetSelector({
  value,
  onChange,
  disabled = false,
  className,
}: BudgetSelectorProps) {
  const handleClick = (level: number) => {
    if (disabled) return

    // Toggle off if clicking same value
    if (value === level) {
      onChange(null)
    } else {
      onChange(level)
    }
  }

  return (
    <div className={cn('flex gap-2', className)}>
      {Object.entries(BUDGET_LEVELS).map(([levelStr, { label, description }]) => {
        const level = parseInt(levelStr, 10)
        const isSelected = value === level

        return (
          <button
            key={level}
            type="button"
            onClick={() => handleClick(level)}
            disabled={disabled}
            aria-pressed={isSelected}
            data-testid="budget-button"
            data-budget={level}
            data-selected={isSelected}
            className={cn(
              'flex flex-col items-center px-4 py-2 rounded-lg',
              'border transition-all duration-200 min-w-[70px]',
              isSelected
                ? 'bg-accent-100 text-accent-700 border-accent-300 ring-2 ring-accent-400'
                : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="font-bold text-lg">{label}</span>
            <span className="text-xs mt-0.5">{description}</span>
          </button>
        )
      })}
    </div>
  )
}
