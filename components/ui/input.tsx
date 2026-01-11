'use client'

import React, { useId } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className,
  id: providedId,
  disabled,
  ...props
}: InputProps) {
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
      <input
        id={id}
        disabled={disabled}
        className={cn(
          'w-full h-11 px-4 rounded-lg text-neutral-900 placeholder:text-neutral-400',
          'border border-neutral-300 bg-white',
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
