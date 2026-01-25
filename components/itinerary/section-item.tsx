'use client'

import { useState } from 'react'
import { MapPin, FileText, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SectionItemData {
  title: string
  location?: string
  notes?: string
  sortOrder?: number
}

interface SectionItemProps {
  item: SectionItemData
  index: number
  onUpdate: (field: keyof SectionItemData, value: string) => void
  onRemove: () => void
  isDragging?: boolean
}

export function SectionItem({
  item,
  index,
  onUpdate,
  onRemove,
  isDragging = false,
}: SectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const hasContent = item.title || item.location || item.notes

  return (
    <div
      className={cn(
        'group relative',
        'rounded-xl border transition-all duration-200',
        isDragging
          ? 'shadow-lg border-primary-400 bg-white scale-[1.02]'
          : isFocused || isExpanded
            ? 'border-primary-300 bg-white shadow-md'
            : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300 hover:shadow-sm'
      )}
    >
      {/* Main Row */}
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-neutral-400" />
        </div>

        {/* Index Number */}
        <div className={cn(
          'flex-shrink-0 w-7 h-7 rounded-lg',
          'flex items-center justify-center',
          'text-xs font-heading font-bold',
          hasContent
            ? 'bg-primary-100 text-primary-700'
            : 'bg-neutral-200 text-neutral-500'
        )}>
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title Input */}
          <input
            type="text"
            value={item.title || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Place name (e.g., The Best Ramen Shop)"
            className={cn(
              'w-full px-0 py-0.5 bg-transparent',
              'text-sm font-heading font-bold text-neutral-900',
              'placeholder:text-neutral-400 placeholder:font-normal',
              'border-b border-transparent',
              'focus:border-primary-300 focus:outline-none',
              'transition-colors duration-200'
            )}
          />

          {/* Location Input - Always visible */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              value={item.location || ''}
              onChange={(e) => onUpdate('location', e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Location or address"
              className={cn(
                'w-full px-0 py-0.5 bg-transparent',
                'text-xs text-neutral-600',
                'placeholder:text-neutral-400',
                'focus:outline-none'
              )}
            />
          </div>

          {/* Notes - Expandable */}
          {(isExpanded || item.notes) && (
            <div className="flex items-start gap-2 animate-fade-in">
              <FileText className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
              <textarea
                value={item.notes || ''}
                onChange={(e) => onUpdate('notes', e.target.value)}
                onFocus={() => {
                  setIsFocused(true)
                  setIsExpanded(true)
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Add a tip or note..."
                rows={2}
                className={cn(
                  'w-full px-0 py-0.5 bg-transparent resize-none',
                  'text-xs text-neutral-600',
                  'placeholder:text-neutral-400',
                  'focus:outline-none'
                )}
              />
            </div>
          )}

          {/* Expand/Add Notes Toggle */}
          {!isExpanded && !item.notes && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              + Add notes
            </button>
          )}
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'flex-shrink-0 p-1.5 rounded-lg',
            'text-neutral-400 hover:text-red-500 hover:bg-red-50',
            'opacity-0 group-hover:opacity-100',
            'transition-all duration-200'
          )}
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
