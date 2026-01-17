'use client'

import React from 'react'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant - primary (coral solid), secondary (teal outline), tertiary (text), danger (red), ghost (transparent) */
  variant?: ButtonVariant
  /** Button size - sm: 32px, md: 40px, lg: 48px, xl: 56px */
  size?: ButtonSize
  /** Show loading state with spinner */
  isLoading?: boolean
  /** Whether to hide text during loading */
  hideTextWhileLoading?: boolean
  /** Full width button */
  fullWidth?: boolean
  /** Icon-only button (perfect square) */
  iconOnly?: boolean
}

/**
 * Production-grade Button component with editorial design system
 * Features: Multiple variants, satisfying micro-interactions, loading states, accessibility
 *
 * Typography: Space Grotesk (bold, distinctive)
 * Animations:
 *   - Hover: lift (-3px), shadow enhancement, subtle scale
 *   - Active: press down, inset feeling
 *   - Focus: visible ring with offset
 * Colors: Coral primary, Teal secondary, Text tertiary, Red danger
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  hideTextWhileLoading = false,
  fullWidth = false,
  iconOnly = false,
  children,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  // Base styles - common to all buttons
  const baseStyles = cn(
    'inline-flex items-center justify-center gap-2',
    'font-heading font-bold',
    'rounded-xl', // More rounded for modern feel
    'select-none',
    // Smooth transitions for all properties
    'transition-all duration-200 ease-out',
    // Accessible focus ring
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    // Disabled state
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    // Full width option
    fullWidth && 'w-full'
  )

  // Variant styles - distinctive with satisfying micro-interactions
  const variantStyles: Record<ButtonVariant, string> = {
    primary: cn(
      // Base colors
      'bg-primary-600 text-white',
      // Hover: lift up, enhance shadow, subtle glow
      'hover:bg-primary-500 hover:-translate-y-0.5',
      'hover:shadow-[0_8px_20px_-6px_rgba(248,111,77,0.5)]',
      // Active: press down, darker, inset feel
      'active:translate-y-0 active:bg-primary-700',
      'active:shadow-[0_2px_8px_-2px_rgba(248,111,77,0.4),inset_0_2px_4px_rgba(0,0,0,0.1)]',
      // Focus ring
      'focus-visible:ring-primary-400'
    ),
    secondary: cn(
      // Base colors
      'bg-white border-2 border-secondary-500 text-secondary-700',
      // Hover: lift, tint background, enhance border
      'hover:bg-secondary-50 hover:border-secondary-600 hover:-translate-y-0.5',
      'hover:shadow-[0_8px_20px_-6px_rgba(20,184,166,0.3)]',
      // Active: press, darker tint
      'active:translate-y-0 active:bg-secondary-100',
      'active:shadow-[0_2px_8px_-2px_rgba(20,184,166,0.3)]',
      // Focus ring
      'focus-visible:ring-secondary-400'
    ),
    tertiary: cn(
      // Base colors
      'bg-transparent text-primary-700',
      // Hover: subtle background, lift
      'hover:bg-primary-50 hover:text-primary-800 hover:-translate-y-0.5',
      // Active: press, darker
      'active:translate-y-0 active:bg-primary-100',
      // Focus ring
      'focus-visible:ring-primary-400'
    ),
    danger: cn(
      // Base colors
      'bg-red-600 text-white',
      // Hover: lift, enhance shadow
      'hover:bg-red-500 hover:-translate-y-0.5',
      'hover:shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)]',
      // Active: press, darker
      'active:translate-y-0 active:bg-red-700',
      'active:shadow-[0_2px_8px_-2px_rgba(239,68,68,0.4),inset_0_2px_4px_rgba(0,0,0,0.1)]',
      // Focus ring
      'focus-visible:ring-red-400'
    ),
    ghost: cn(
      // Base colors
      'bg-transparent text-neutral-700',
      // Hover: subtle background
      'hover:bg-neutral-100 hover:text-neutral-900',
      // Active: darker background
      'active:bg-neutral-200',
      // Focus ring
      'focus-visible:ring-neutral-400'
    ),
  }

  // Size styles - responsive sizing with proper touch targets
  const sizeStyles: Record<ButtonSize, string> = {
    sm: cn(
      'h-8 text-xs',
      iconOnly ? 'w-8 p-0' : 'px-3'
    ),
    md: cn(
      'h-10 text-sm',
      iconOnly ? 'w-10 p-0' : 'px-4'
    ),
    lg: cn(
      'h-12 text-base',
      iconOnly ? 'w-12 p-0' : 'px-6'
    ),
    xl: cn(
      'h-14 text-base',
      iconOnly ? 'w-14 p-0' : 'px-8'
    ),
  }

  // Loading spinner size based on button size
  const spinnerSizeClass: Record<ButtonSize, string> = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      disabled={isDisabled}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        // Remove hover effects when disabled
        isDisabled && 'hover:translate-y-0 hover:shadow-none active:translate-y-0',
        className
      )}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2
            className={cn(spinnerSizeClass[size], 'animate-spin')}
            aria-hidden="true"
          />
          {!hideTextWhileLoading && (
            <span className="opacity-70">{children}</span>
          )}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * IconButton - A button variant optimized for icon-only usage
 */
interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children'> {
  /** The icon to display */
  icon: React.ReactNode
  /** Accessible label for the button */
  'aria-label': string
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      iconOnly
      className={cn('rounded-xl', className)}
      {...props}
    >
      {icon}
    </Button>
  )
}
