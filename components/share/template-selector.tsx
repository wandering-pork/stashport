'use client'

import { cn } from '@/lib/utils/cn'
import { TemplateStyle, TEMPLATE_STYLES } from '@/lib/constants/templates'
import { Sparkles } from 'lucide-react'

interface TemplateSelectorProps {
  selected: TemplateStyle
  onChange: (style: TemplateStyle) => void
}

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Section Header with Editorial Typography */}
      <div className="space-y-1">
        <h3 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
          Template Style
        </h3>
        <p className="font-body text-xs text-neutral-500">
          Choose your aesthetic direction
        </p>
      </div>

      {/* Vertical Stack on Desktop, Horizontal Scroll on Mobile */}
      <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 snap-x snap-mandatory lg:snap-none">
        {Object.entries(TEMPLATE_STYLES).map(([key, config]) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              onClick={() => onChange(key as TemplateStyle)}
              className={cn(
                'group relative flex-shrink-0 w-[160px] lg:w-full p-4 rounded-xl border-2 transition-all duration-300',
                'hover:shadow-lg hover:-translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'snap-center lg:snap-align-none',
                isSelected
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 via-white to-secondary-50 shadow-md shadow-primary-200/50'
                  : 'border-neutral-200 bg-white hover:border-primary-300'
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md animate-scale-in">
                  <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              )}

              <div className="relative space-y-2">
                {/* Style Name */}
                <h4 className={cn(
                  "font-display font-bold text-base transition-colors",
                  isSelected ? "text-primary-700" : "text-neutral-900 group-hover:text-primary-600"
                )}>
                  {config.name}
                </h4>

                {/* Description */}
                <p className="font-body text-xs text-neutral-600 leading-snug line-clamp-2">
                  {config.description}
                </p>

                {/* Visual Indicator Bar */}
                <div className="pt-1">
                  <div className={cn(
                    "h-0.5 rounded-full transition-all duration-500",
                    isSelected
                      ? "w-full bg-gradient-to-r from-primary-500 to-secondary-500"
                      : "w-0 group-hover:w-1/3 bg-neutral-300"
                  )} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
