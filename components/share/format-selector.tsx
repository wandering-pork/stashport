'use client'

import { cn } from '@/lib/utils/cn'
import { TemplateFormat, TEMPLATE_FORMATS } from '@/lib/constants/templates'
import { Sparkles } from 'lucide-react'

interface FormatSelectorProps {
  selected: TemplateFormat
  onChange: (format: TemplateFormat) => void
}

export function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="font-display text-lg font-bold text-neutral-900 tracking-tight">
          Format
        </h3>
        <p className="font-body text-xs text-neutral-500">
          Optimize for your platform
        </p>
      </div>

      {/* Format Options */}
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
        {Object.entries(TEMPLATE_FORMATS).map(([key, config]) => {
          const isSelected = selected === key

          // Visual aspect ratio representation
          const aspectRatioStyles = {
            story: 'aspect-[9/16] w-8',
            square: 'aspect-square w-12',
            portrait: 'aspect-[4/5] w-10',
          }

          return (
            <button
              key={key}
              onClick={() => onChange(key as TemplateFormat)}
              className={cn(
                'group relative p-3 rounded-xl border-2 transition-all duration-300',
                'hover:shadow-lg hover:-translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2',
                isSelected
                  ? 'border-secondary-500 bg-gradient-to-br from-secondary-50 via-white to-accent-50 shadow-md shadow-secondary-200/50'
                  : 'border-neutral-200 bg-white hover:border-secondary-300'
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-md animate-scale-in">
                  <Sparkles className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              )}

              <div className="space-y-2">
                {/* Aspect Ratio Visual */}
                <div className="flex justify-center">
                  <div className={cn(
                    aspectRatioStyles[key as TemplateFormat],
                    "rounded-md border-2 transition-all duration-300",
                    isSelected
                      ? "border-secondary-500 bg-gradient-to-br from-secondary-100 to-secondary-200"
                      : "border-neutral-300 bg-neutral-100 group-hover:border-secondary-400"
                  )} />
                </div>

                {/* Ratio Badge */}
                <div className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-xs font-heading font-bold transition-colors",
                  isSelected
                    ? "bg-secondary-600 text-white"
                    : "bg-neutral-200 text-neutral-700 group-hover:bg-secondary-100 group-hover:text-secondary-700"
                )}>
                  {config.ratio}
                </div>

                {/* Format Name */}
                <h4 className={cn(
                  "font-display font-bold text-sm transition-colors",
                  isSelected ? "text-secondary-700" : "text-neutral-900 group-hover:text-secondary-600"
                )}>
                  {config.name}
                </h4>

                {/* Description */}
                <p className="font-body text-xs text-neutral-600 leading-snug line-clamp-2">
                  {config.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
