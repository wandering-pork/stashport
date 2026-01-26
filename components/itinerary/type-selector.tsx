'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ITINERARY_TYPES, ItineraryTypeKey } from '@/lib/constants/templates'
import { Calendar, Heart, HelpCircle } from 'lucide-react'

interface TypeSelectorProps {
  value: ItineraryTypeKey
  onChange: (type: ItineraryTypeKey) => void
  disabled?: boolean
}

export function TypeSelector({ value, onChange, disabled = false }: TypeSelectorProps) {
  console.log('[Component] TypeSelector - Render:', { value, disabled })

  const icons = {
    daily: Calendar,
    guide: Heart,
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-heading font-medium text-gray-700">
        Trip Type
        <Tooltip>
          <TooltipTrigger type="button">
            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <p><strong>Daily:</strong> Day-by-day itineraries with dates</p>
              <p><strong>Guide:</strong> Curated lists without dates</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </label>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(ITINERARY_TYPES).map(([key, config]) => {
          const Icon = icons[key as ItineraryTypeKey]
          const isSelected = value === key

          return (
            <Card
              key={key}
              variant={isSelected ? 'elevated' : 'default'}
              accentColor={isSelected ? 'primary' : undefined}
              role="button"
              aria-pressed={isSelected}
              data-testid={`type-selector-${key}`}
              data-type={key}
              data-selected={isSelected}
              className={cn(
                'cursor-pointer transition-all duration-200',
                isSelected && 'ring-2 ring-primary-500 ring-offset-2',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => {
                if (!disabled) {
                  console.log('[Component] TypeSelector - Type changed:', key)
                  onChange(key as ItineraryTypeKey)
                }
              }}
            >
              <CardContent padding="relaxed" className="flex flex-col items-center text-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">{config.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
