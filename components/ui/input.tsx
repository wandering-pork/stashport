'use client'

import React, { useId, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  /** Whether to show success state with checkmark */
  isValid?: boolean
  /** Whether to show error animation on invalid state */
  showErrorAnimation?: boolean
  /** Input size */
  size?: InputSize
  /** Show character count for inputs with maxLength */
  showCharCount?: boolean
  /** Left icon/addon */
  leftIcon?: React.ReactNode
  /** Right icon/addon (will be replaced by validation icons when applicable) */
  rightIcon?: React.ReactNode
}

/**
 * Production-grade Input component with editorial design system
 * Features: Minimal design, smooth focus states, error/success feedback, password toggle
 *
 * Design: 2px border minimal style, coral focus state, refined typography
 * Focus: Border color transition, subtle glow, background highlight
 * Error: Red border, shake animation, error message with icon
 * Success: Green checkmark icon, smooth fade-in
 */
export function Input({
  label,
  error,
  helperText,
  isValid = false,
  showErrorAnimation = false,
  size = 'md',
  showCharCount = false,
  leftIcon,
  rightIcon,
  className,
  id: providedId,
  disabled = false,
  type = 'text',
  maxLength,
  value,
  ...props
}: InputProps) {
  const id = providedId || useId()
  const hasError = !!error
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  // Calculate character count
  const charCount = typeof value === 'string' ? value.length : 0

  // Size configurations
  const sizeConfig: Record<InputSize, { input: string; label: string; helper: string; icon: string }> = {
    sm: {
      input: 'h-9 px-3 text-sm',
      label: 'text-xs mb-1.5',
      helper: 'text-xs mt-1.5',
      icon: 'w-4 h-4',
    },
    md: {
      input: 'h-11 px-4 text-base',
      label: 'text-xs mb-2',
      helper: 'text-sm mt-2',
      icon: 'w-5 h-5',
    },
    lg: {
      input: 'h-14 px-5 text-lg',
      label: 'text-sm mb-2.5',
      helper: 'text-sm mt-2',
      icon: 'w-5 h-5',
    },
  }

  const config = sizeConfig[size]

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'block font-heading font-bold uppercase tracking-wider',
            config.label,
            'transition-colors duration-200',
            hasError ? 'text-red-600' : 'text-neutral-600',
            isFocused && !hasError && 'text-primary-600'
          )}
        >
          {label}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2',
            'text-neutral-400 transition-colors duration-200',
            isFocused && 'text-primary-500',
            hasError && 'text-red-400'
          )}>
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          id={id}
          type={inputType}
          disabled={disabled}
          maxLength={maxLength}
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
            // Base styles
            'w-full rounded-xl',
            'font-body text-neutral-900',
            'placeholder:text-neutral-400 placeholder:font-normal',
            config.input,

            // Border - 2px style
            'border-2 border-neutral-200',

            // Transitions
            'transition-all duration-200 ease-out',

            // Focus state - coral border, glow, background
            'focus-visible:outline-none',
            'focus-visible:border-primary-500',
            'focus-visible:shadow-[0_0_0_4px_rgba(248,111,77,0.1)]',
            'focus-visible:bg-white',

            // Hover state (when not focused)
            'hover:border-neutral-300',

            // Error state
            hasError && 'border-red-500',
            hasError && 'bg-red-50/50',
            hasError && 'focus-visible:border-red-500',
            hasError && 'focus-visible:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]',
            hasError && showErrorAnimation && 'animate-shake-enhanced',

            // Success state
            isValid && !hasError && 'border-green-500',
            isValid && !hasError && 'bg-green-50/30',
            isValid && !hasError && 'focus-visible:border-green-500',
            isValid && !hasError && 'focus-visible:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]',

            // Disabled state
            'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:border-neutral-200',

            // Padding adjustments for icons
            !!leftIcon && 'pl-10',
            (!!rightIcon || isPassword || isValid || hasError) && 'pr-10',

            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />

        {/* Right Side Icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'p-1 rounded-lg transition-all duration-200',
                'text-neutral-400 hover:text-neutral-600',
                'hover:bg-neutral-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400'
              )}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className={config.icon} />
              ) : (
                <Eye className={config.icon} />
              )}
            </button>
          )}

          {/* Success Checkmark */}
          {isValid && !hasError && !isPassword && (
            <div className="animate-scale-in">
              <CheckCircle2 className={cn(config.icon, 'text-green-500')} aria-hidden="true" />
            </div>
          )}

          {/* Error Icon */}
          {hasError && !isPassword && (
            <div className="animate-scale-in">
              <AlertCircle className={cn(config.icon, 'text-red-500')} aria-hidden="true" />
            </div>
          )}

          {/* Custom Right Icon (when no validation icons) */}
          {rightIcon && !isPassword && !isValid && !hasError && (
            <div className="text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
      </div>

      {/* Helper Text / Error Message / Character Count */}
      <div className={cn('flex items-start justify-between gap-2', config.helper)}>
        <div className="flex-1 min-h-[1.25rem]">
          {error && (
            <p
              id={`${id}-error`}
              className="text-red-600 font-medium animate-slide-from-top"
              role="alert"
            >
              {error}
            </p>
          )}
          {helperText && !error && (
            <p id={`${id}-helper`} className="text-neutral-500">
              {helperText}
            </p>
          )}
        </div>

        {/* Character Count */}
        {showCharCount && maxLength && (
          <p className={cn(
            'text-neutral-400 font-heading font-bold tabular-nums',
            charCount >= maxLength && 'text-red-500'
          )}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * SearchInput - Specialized input for search functionality
 */
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onClear?: () => void
}

export function SearchInput({
  value,
  onClear,
  placeholder = 'Search...',
  ...props
}: SearchInputProps) {
  const hasValue = typeof value === 'string' && value.length > 0

  return (
    <div className="relative">
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        leftIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        rightIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                'p-1 rounded-lg transition-all duration-200',
                'text-neutral-400 hover:text-neutral-600',
                'hover:bg-neutral-100'
              )}
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : undefined
        }
        {...props}
      />
    </div>
  )
}
