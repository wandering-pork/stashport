'use client'

import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          checked ? 'bg-primary-500' : 'bg-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-7' : 'translate-x-1'
          )}
        />
      </button>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-900 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  )
}
