import React from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'interactive' | 'featured'
}

export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200',
    elevated: 'bg-white border border-neutral-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200',
    interactive: 'bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary-300 transition-all duration-200 cursor-pointer',
    featured: 'bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 rounded-xl shadow-sm',
  }

  return (
    <div
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-neutral-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-neutral-200 flex gap-2 justify-end', className)}
      {...props}
    >
      {children}
    </div>
  )
}
