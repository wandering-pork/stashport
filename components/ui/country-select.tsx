'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { COUNTRIES, filterCountries } from '@/lib/utils/countries'

interface CountrySelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function CountrySelect({
  label,
  value,
  onChange,
  placeholder = 'Select a country...',
  required = false,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(COUNTRIES)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFiltered(filterCountries(search))
  }, [search])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (country: string) => {
    onChange(country)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) inputRef.current?.focus()
        }}
        className={cn(
          'relative w-full px-4 py-2 h-11 border rounded-lg bg-white cursor-pointer',
          'transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500',
          'hover:border-gray-400',
          isOpen && 'ring-2 ring-primary-500/30 border-primary-500'
        )}
      >
        <div className="flex items-center justify-between h-full">
          <div className="flex-1 min-w-0">
            {value ? (
              <span className="text-gray-900">{value}</span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {value && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                type="button"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </div>

        {isOpen && (
          <input
            ref={inputRef}
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="absolute inset-0 w-full h-11 px-4 py-2 border-0 bg-white rounded-lg focus:outline-none text-gray-900 placeholder-gray-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No countries found
            </div>
          ) : (
            <ul className="py-1">
              {filtered.map((country) => (
                <li key={country}>
                  <button
                    onClick={() => handleSelect(country)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors text-gray-900',
                      'hover:bg-primary-50 hover:text-gray-900',
                      value === country && 'bg-primary-100 text-primary-700'
                    )}
                    type="button"
                  >
                    {country}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
