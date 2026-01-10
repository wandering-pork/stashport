'use client'

import React, { useId } from 'react'

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
  ...props
}: InputProps) {
  const id = providedId || useId()

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
        } ${className || ''}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  )
}
