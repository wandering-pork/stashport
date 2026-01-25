'use client'

import { useState } from 'react'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SECTION_PRESETS, SectionPreset, DEFAULT_SECTION_ICON } from '@/lib/constants/section-presets'
import { Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AddSectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSection: (section: { name: string; icon: string }) => void
  existingSectionNames?: string[]
}

export function AddSectionModal({
  open,
  onOpenChange,
  onAddSection,
  existingSectionNames = [],
}: AddSectionModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<SectionPreset | null>(null)
  const [customName, setCustomName] = useState('')
  const [customIcon, setCustomIcon] = useState(DEFAULT_SECTION_ICON)
  const [isCustomMode, setIsCustomMode] = useState(false)

  // Common emoji options for custom sections
  const emojiOptions = ['📍', '⭐', '🎯', '💫', '🔥', '💎', '🌟', '✨', '🎪', '🎭', '🎨', '🎵']

  const handlePresetSelect = (preset: SectionPreset) => {
    if (preset.name === 'Custom Section') {
      setIsCustomMode(true)
      setSelectedPreset(null)
      setCustomIcon(preset.icon)
    } else {
      setIsCustomMode(false)
      setSelectedPreset(preset)
      setCustomName('')
    }
  }

  const handleSubmit = () => {
    if (isCustomMode && customName.trim()) {
      onAddSection({ name: customName.trim(), icon: customIcon })
    } else if (selectedPreset) {
      onAddSection({ name: selectedPreset.name, icon: selectedPreset.icon })
    }

    // Reset state
    setSelectedPreset(null)
    setCustomName('')
    setCustomIcon(DEFAULT_SECTION_ICON)
    setIsCustomMode(false)
    onOpenChange(false)
  }

  const canSubmit = isCustomMode ? customName.trim().length > 0 : selectedPreset !== null

  // Check if preset is already used
  const isPresetUsed = (preset: SectionPreset) => {
    return existingSectionNames.includes(preset.name)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-neutral-900">Add a Section</h2>
            <p className="text-sm text-neutral-500">Choose a category or create your own</p>
          </div>
        </div>
      </DialogHeader>

      <DialogContent>
        {/* Preset Grid */}
        {!isCustomMode && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {SECTION_PRESETS.map((preset) => {
              const isUsed = isPresetUsed(preset)
              const isSelected = selectedPreset?.name === preset.name
              const isCustom = preset.name === 'Custom Section'

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => !isUsed && handlePresetSelect(preset)}
                  disabled={isUsed}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-xl',
                    'border-2 transition-all duration-200',
                    'text-center',
                    isUsed
                      ? 'opacity-50 cursor-not-allowed border-neutral-200 bg-neutral-50'
                      : isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-coral'
                        : isCustom
                          ? 'border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50/50'
                          : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                  )}
                >
                  {/* Selected Check */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Icon */}
                  <span className={cn(
                    'text-3xl',
                    isUsed && 'grayscale'
                  )}>
                    {preset.icon}
                  </span>

                  {/* Name */}
                  <span className={cn(
                    'text-sm font-heading font-semibold',
                    isSelected ? 'text-primary-700' : 'text-neutral-700'
                  )}>
                    {preset.name}
                  </span>

                  {/* Used indicator */}
                  {isUsed && (
                    <span className="text-xs text-neutral-400">Already added</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Custom Section Mode */}
        {isCustomMode && (
          <div className="space-y-6 animate-fade-in">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to presets
            </button>

            {/* Emoji selector */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Choose an icon
              </label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCustomIcon(emoji)}
                    className={cn(
                      'w-12 h-12 rounded-xl text-2xl',
                      'border-2 transition-all duration-200',
                      'flex items-center justify-center',
                      customIcon === emoji
                        ? 'border-primary-500 bg-primary-50 shadow-coral'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom name input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Section name
              </label>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{customIcon}</span>
                <Input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Local Favorites, Day Trips, Best Views..."
                  autoFocus
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <Button
          variant="tertiary"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="font-heading font-bold"
        >
          Add Section
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
