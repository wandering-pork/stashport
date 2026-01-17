'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DateRangeCalendarProps {
  startDate?: string
  endDate?: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

// Helper: Create YYYY-MM-DD string without timezone issues
const formatDateKey = (year: number, month: number, day: number): string => {
  const y = year.toString()
  const m = (month + 1).toString().padStart(2, '0')
  const d = day.toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Helper: Parse YYYY-MM-DD (or ISO date string) to { year, month, day }
const parseDateKey = (dateStr: string): { year: number; month: number; day: number } | null => {
  if (!dateStr) return null
  // Handle ISO format by extracting just the date part (before 'T')
  const datePart = dateStr.split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  // Validate parsed values
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return { year: y, month: m - 1, day: d }
}

// Helper: Format for display
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const parsed = parseDateKey(dateStr)
  if (!parsed) return ''
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parsed.month]} ${parsed.day}, ${parsed.year}`
}

export function DateRangeCalendar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeCalendarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [hoverDateKey, setHoverDateKey] = useState<string | null>(null)
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update dropdown position when open
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        })
      }
    }
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  useEffect(() => {
    if (startDate && endDate) {
      setSelectionStep('start')
    } else if (startDate) {
      setSelectionStep('end')
    } else {
      setSelectionStep('start')
    }
  }, [startDate, endDate])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(currentYear, currentMonth, day)

    if (selectionStep === 'start') {
      onStartDateChange(dateKey)
      if (endDate && dateKey > endDate) {
        onEndDateChange('')
      }
      setSelectionStep('end')
    } else {
      if (!startDate) {
        onStartDateChange(dateKey)
        setSelectionStep('end')
        return
      }

      if (dateKey >= startDate) {
        onEndDateChange(dateKey)
        setSelectionStep('start')
        setIsOpen(false)
      } else {
        onStartDateChange(dateKey)
        onEndDateChange('')
        setSelectionStep('end')
      }
    }
  }

  const isDateInRange = (dateKey: string): boolean => {
    if (!startDate || !endDate) return false
    return dateKey >= startDate && dateKey <= endDate
  }

  const isStartDate = (dateKey: string): boolean => startDate === dateKey
  const isEndDate = (dateKey: string): boolean => endDate === dateKey

  const isHoverInRange = (dateKey: string): boolean => {
    if (!startDate || !hoverDateKey || selectionStep !== 'end') return false
    if (hoverDateKey >= startDate) {
      return dateKey >= startDate && dateKey <= hoverDateKey
    }
    return dateKey >= hoverDateKey && dateKey <= startDate
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthName = `${monthNames[currentMonth]} ${currentYear}`

  const clearDates = () => {
    onStartDateChange('')
    onEndDateChange('')
    setSelectionStep('start')
  }

  const dropdown = isOpen && typeof window !== 'undefined' ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-white rounded-xl border border-gray-200 shadow-xl animate-fade-in"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999,
      }}
    >
      {/* Selection Step Indicator */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            selectionStep === 'start' ? 'bg-primary-500' : 'bg-gray-300'
          )} />
          <span className="text-xs font-heading font-bold text-gray-600">
            {selectionStep === 'start' ? 'Select start date' : 'Select end date'}
          </span>
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={clearDates}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Month Navigation */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-sm font-heading font-bold text-gray-800">
          {monthName}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          type="button"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
            <div
              key={`day-${idx}`}
              className="text-center text-xs font-heading font-bold text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {days.map((day) => {
            const dateKey = formatDateKey(currentYear, currentMonth, day)
            const isStart = isStartDate(dateKey)
            const isEnd = isEndDate(dateKey)
            const inRange = isDateInRange(dateKey)
            const hoverRange = isHoverInRange(dateKey)

            return (
              <button
                key={dateKey}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoverDateKey(dateKey)}
                onMouseLeave={() => setHoverDateKey(null)}
                className={cn(
                  'h-9 rounded-lg text-sm font-body transition-colors duration-100',
                  (inRange || hoverRange) && !isStart && !isEnd && 'bg-primary-100 text-primary-800',
                  isStart && 'bg-primary-500 text-white font-bold',
                  isEnd && !isStart && 'bg-primary-500 text-white font-bold',
                  isStart && isEnd && 'bg-primary-600 text-white font-bold',
                  hoverRange && !inRange && !isStart && !isEnd && 'bg-primary-50',
                  !inRange && !hoverRange && !isStart && !isEnd && 'text-gray-700 hover:bg-gray-100'
                )}
                type="button"
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Range Footer */}
      {startDate && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{formatDisplayDate(startDate)}</span>
              {endDate && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-600">{formatDisplayDate(endDate)}</span>
                </>
              )}
            </div>
            {startDate && endDate && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-lg hover:bg-primary-600 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  ) : null

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg',
          'flex items-center justify-between gap-3',
          'hover:border-gray-300 transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500',
          isOpen && 'ring-2 ring-primary-500/30 border-primary-500'
        )}
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="text-left">
            {startDate || endDate ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {startDate ? formatDisplayDate(startDate) : 'Start date'}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-sm font-medium text-gray-900">
                  {endDate ? formatDisplayDate(endDate) : 'End date'}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Select travel dates</span>
            )}
          </div>
        </div>
        <ChevronRight className={cn(
          'w-4 h-4 text-gray-400 transition-transform duration-200',
          isOpen && 'rotate-90'
        )} />
      </button>

      {dropdown}
    </div>
  )
}
