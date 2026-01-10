import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}
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
    <div className={`px-6 py-4 border-b border-gray-200 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 flex gap-2 justify-end ${className || ''}`} {...props}>
      {children}
    </div>
  )
}
