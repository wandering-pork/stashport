'use client'

import { Cloud, CloudOff, Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { SaveStatus } from '@/lib/hooks/use-autosave'

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved?: Date | null
  error?: string | null
  className?: string
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  error,
  className,
}: SaveStatusIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusContent = () => {
    switch (status) {
      case 'saving':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-secondary-500" />
            <span className="text-secondary-600">Saving...</span>
          </>
        )
      case 'saved':
        return (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Saved</span>
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 text-error" />
            <span className="text-error" title={error || undefined}>
              Save failed
            </span>
          </>
        )
      case 'offline':
        return (
          <>
            <CloudOff className="w-4 h-4 text-amber-500" />
            <span className="text-amber-600">Offline - saved locally</span>
          </>
        )
      case 'idle':
      default:
        if (lastSaved) {
          return (
            <>
              <Cloud className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-500">
                Last saved {formatTime(lastSaved)}
              </span>
            </>
          )
        }
        return null
    }
  }

  const content = getStatusContent()

  if (!content) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 text-sm font-heading transition-all duration-300',
        className
      )}
    >
      {content}
    </div>
  )
}
