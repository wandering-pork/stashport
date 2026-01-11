import React, { useId } from 'react'
import { cn } from '@/lib/utils/cn'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({
  label,
  error,
  helperText,
  className,
  id: providedId,
  disabled,
  ...props
}: TextareaProps) {
  const id = providedId || useId()

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 rounded-lg text-neutral-900 placeholder:text-neutral-400',
          'border border-neutral-300 bg-white min-h-24 resize-vertical',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:border-primary-500',
          'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
          error && 'border-error focus-visible:ring-error/30 focus-visible:border-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-error mt-2">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-neutral-500 mt-2">{helperText}</p>
      )}
    </div>
  )
}
