'use client'

import React, { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FloatingInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'> {
  label: string
  icon?: React.ReactNode
  error?: string
  /** Whether to show error animation on invalid state */
  showErrorAnimation?: boolean
}

/**
 * Modern Floating Label Input with animated underline
 * Features:
 * - Floating label that moves up on focus/filled
 * - Animated underline indicator
 * - Optional left icon
 * - Card-style wrapper with subtle shadow
 * - Password toggle support
 */
export function FloatingInput({
  label,
  icon,
  error,
  showErrorAnimation = false,
  className,
  id: providedId,
  disabled = false,
  type = 'text',
  value,
  ...props
}: FloatingInputProps) {
  const id = providedId || useId()
  const hasError = !!error
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  // Determine if label should float (focused or has value)
  const hasValue = value !== undefined && value !== ''
  const shouldFloat = isFocused || hasValue

  return (
    <div className="w-full">
      {/* Card Wrapper */}
      <div
        className={cn(
          'relative bg-white rounded-2xl',
          'border border-[#e8e3db]',
          'transition-all duration-300 ease-out',
          // Hover lift effect
          'hover:shadow-[0_4px_20px_rgba(224,122,95,0.08)]',
          'hover:border-[#d9cfc0]',
          // Focus state
          isFocused && 'shadow-[0_4px_24px_rgba(224,122,95,0.12)]',
          isFocused && 'border-[#e07a5f]',
          // Error state
          hasError && 'border-red-400',
          hasError && 'shadow-[0_4px_20px_rgba(239,68,68,0.1)]',
          hasError && showErrorAnimation && 'animate-shake-enhanced',
          // Disabled
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'transition-colors duration-300',
              isFocused ? 'text-[#e07a5f]' : 'text-[#9d9a94]',
              hasError && 'text-red-400'
            )}
          >
            {icon}
          </div>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Floating Label */}
          <label
            htmlFor={id}
            className={cn(
              'absolute pointer-events-none',
              'font-body text-[#7d7a74]',
              'transition-all duration-300 ease-out',
              'origin-left',
              icon ? 'left-12' : 'left-4',
              // Default position (centered)
              !shouldFloat && 'top-1/2 -translate-y-1/2 text-base',
              // Floating position
              shouldFloat && 'top-2.5 -translate-y-0 text-xs font-medium',
              shouldFloat && (hasError ? 'text-red-500' : 'text-[#e07a5f]')
            )}
          >
            {label}
          </label>

          {/* Input Field */}
          <input
            id={id}
            type={inputType}
            disabled={disabled}
            value={value}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'w-full bg-transparent',
              'pt-6 pb-2.5 text-base',
              'font-body text-[#2d2a26]',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
              icon ? 'pl-12 pr-4' : 'pl-4 pr-4',
              isPassword && 'pr-12',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            {...props}
          />

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2',
                'p-1.5 rounded-lg',
                'text-[#9d9a94] hover:text-[#5d5a54]',
                'hover:bg-[#f5f0e6]',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e07a5f]'
              )}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Animated Underline */}
        <div
          className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2',
            'h-0.5 rounded-full',
            'transition-all duration-300 ease-out',
            isFocused ? 'w-[calc(100%-2rem)]' : 'w-0',
            hasError ? 'bg-red-500' : 'bg-[#e07a5f]'
          )}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm text-red-600 font-medium animate-slide-from-top pl-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
