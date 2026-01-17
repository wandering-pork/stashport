import React from 'react'
import { cn } from '@/lib/utils/cn'

type CardVariant = 'default' | 'elevated' | 'interactive' | 'glass' | 'editorial'
type AccentColor = 'primary' | 'secondary' | 'accent' | 'none'
type ShadowColor = 'neutral' | 'coral' | 'teal' | 'golden'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Visual variant - default (base), elevated (stronger shadow), interactive (hover effects), glass (frosted), editorial (gradient border) */
  variant?: CardVariant
  /** Top accent border color - primary (coral), secondary (teal), accent (golden), none */
  accentColor?: AccentColor
  /** Colored shadow - neutral (default), coral, teal, golden */
  shadowColor?: ShadowColor
  /** Add subtle grain texture overlay */
  withGrain?: boolean
}

/**
 * Production-grade Card component with editorial design system
 * Features: Multiple variants, colored shadows, grain texture, editorial borders
 *
 * Design: Cream background (#fffaf5), layered shadows, hover animations
 * Variants: default, elevated, interactive, glass, editorial
 * Shadows: Colored shadows for visual depth (coral, teal, golden)
 */
export function Card({
  children,
  className,
  variant = 'default',
  accentColor = 'none',
  shadowColor = 'neutral',
  withGrain = false,
  ...props
}: CardProps) {
  // Base card styles - cream background with subtle border
  const baseStyles = cn(
    'bg-color-surface rounded-xl',
    'transition-all duration-300 ease-out',
    'overflow-visible',
    withGrain && 'grain-overlay'
  )

  // Variant styles - different shadow and hover effects
  const variantStyles: Record<CardVariant, string> = {
    default: cn(
      'border border-neutral-200',
      'shadow-sm',
      'hover:shadow-md'
    ),
    elevated: cn(
      'border border-neutral-200/80',
      'shadow-dramatic',
      'hover:shadow-dramatic-lg'
    ),
    interactive: cn(
      'border border-neutral-200',
      'shadow-sm cursor-pointer',
      'hover:shadow-dramatic hover:-translate-y-1',
      'active:shadow-md active:translate-y-0 active:scale-[0.99]'
    ),
    glass: cn(
      'glass border border-white/30',
      'shadow-lg',
      'hover:shadow-xl'
    ),
    editorial: cn(
      'border-editorial',
      'shadow-dramatic',
      'hover:shadow-dramatic-lg hover:-translate-y-0.5'
    ),
  }

  // Accent border color styles - 4px top border
  const accentStyles: Record<AccentColor, string> = {
    primary: 'border-t-4 border-t-primary-500',
    secondary: 'border-t-4 border-t-secondary-500',
    accent: 'border-t-4 border-t-accent-500',
    none: '',
  }

  // Colored shadow styles
  const shadowStyles: Record<ShadowColor, string> = {
    neutral: '',
    coral: 'shadow-coral hover:shadow-coral-lg',
    teal: 'shadow-teal hover:shadow-teal-lg',
    golden: 'shadow-golden',
  }

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        accentStyles[accentColor],
        shadowColor !== 'neutral' && shadowStyles[shadowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Whether to show divider below header */
  withDivider?: boolean
  /** Header size - compact, default, relaxed */
  size?: 'compact' | 'default' | 'relaxed'
}

/**
 * Card header section with optional divider
 * Features: Multiple sizes, gradient background option
 */
export function CardHeader({
  children,
  className,
  withDivider = true,
  size = 'default',
  ...props
}: CardHeaderProps) {
  const sizeStyles = {
    compact: 'px-4 py-3',
    default: 'px-6 py-5',
    relaxed: 'px-8 py-6',
  }

  return (
    <div
      className={cn(
        sizeStyles[size],
        withDivider && 'border-b border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Custom padding (default: 24px) */
  padding?: 'none' | 'compact' | 'default' | 'relaxed'
}

/**
 * Card content section with flexible padding
 */
export function CardContent({
  children,
  className,
  padding = 'default',
  ...props
}: CardContentProps) {
  const paddingStyles = {
    none: '',
    compact: 'px-4 py-3',
    default: 'px-6 py-5',
    relaxed: 'px-8 py-6',
  }

  return (
    <div className={cn(paddingStyles[padding], 'overflow-visible', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Whether to show divider above footer */
  withDivider?: boolean
  /** Footer alignment */
  align?: 'left' | 'center' | 'right' | 'between'
}

/**
 * Card footer section with optional divider
 * Default: Right-aligned flex layout for buttons
 */
export function CardFooter({
  children,
  className,
  withDivider = true,
  align = 'right',
  ...props
}: CardFooterProps) {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div
      className={cn(
        'px-6 py-4 flex gap-3',
        alignStyles[align],
        withDivider && 'border-t border-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Stat Card - Specialized card for displaying statistics
 * Features: Large number display, icon, trend indicator
 */
interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; positive: boolean }
  accentColor?: 'primary' | 'secondary' | 'accent'
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  accentColor = 'primary',
  className,
}: StatCardProps) {
  const accentStyles = {
    primary: {
      border: 'border-t-primary-500',
      iconBg: 'from-primary-100 to-primary-50',
      iconColor: 'text-primary-600',
      shadow: 'shadow-coral',
      valueColor: 'text-primary-700',
    },
    secondary: {
      border: 'border-t-secondary-500',
      iconBg: 'from-secondary-100 to-secondary-50',
      iconColor: 'text-secondary-600',
      shadow: 'shadow-teal',
      valueColor: 'text-secondary-700',
    },
    accent: {
      border: 'border-t-accent-500',
      iconBg: 'from-accent-100 to-accent-50',
      iconColor: 'text-accent-600',
      shadow: 'shadow-golden',
      valueColor: 'text-accent-700',
    },
  }

  const styles = accentStyles[accentColor]

  return (
    <Card
      variant="elevated"
      className={cn('border-t-4', styles.border, 'group', className)}
    >
      <CardContent padding="relaxed">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-heading font-bold uppercase tracking-wide text-neutral-500 mb-2">
              {label}
            </p>
            <p className={cn('stat-number text-4xl lg:text-5xl', styles.valueColor)}>
              {value}
            </p>
            {trend && (
              <p className={cn(
                'text-sm font-heading font-bold mt-2',
                trend.positive ? 'text-green-600' : 'text-red-500'
              )}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          {icon && (
            <div className={cn(
              'flex items-center justify-center w-14 h-14 rounded-2xl',
              'bg-gradient-to-br',
              styles.iconBg,
              styles.shadow,
              'group-hover:scale-110 transition-transform duration-300'
            )}>
              <div className={styles.iconColor}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
