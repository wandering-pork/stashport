'use client'

import { useState } from 'react'
import { Plus, Trash2, MapPin, Clock, ChevronDown, ChevronRight, Calendar, Tent } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Activity {
  title: string
  location?: string
  startTime?: string
  endTime?: string
  notes?: string
  durationDays?: number // How many days this activity spans (1 = single day, 2+ = multi-day)
}

interface Day {
  dayNumber: number
  date: string
  title: string
  activities: Activity[]
}

interface DayCardsProps {
  days: Day[]
  onReorder: (days: Day[]) => void
  onAddActivity: (dayNumber: number) => void
  onRemoveDay: (dayNumber: number) => void
  onUpdateDayTitle: (dayNumber: number, title: string) => void
  onRemoveActivity: (dayNumber: number, activityIndex: number) => void
  onActivityChange?: (dayNumber: number, activityIndex: number, field: string, value: string) => void
}

// Format date for display
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00') // Noon to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Individual Day Section
function DaySection({
  day,
  totalDays,
  isLast,
  onAddActivity,
  onUpdateDayTitle,
  onRemoveActivity,
  onActivityChange,
}: {
  day: Day
  totalDays: number
  isLast: boolean
  onAddActivity: (dayNumber: number) => void
  onUpdateDayTitle: (dayNumber: number, title: string) => void
  onRemoveActivity: (dayNumber: number, activityIndex: number) => void
  onActivityChange?: (dayNumber: number, activityIndex: number, field: string, value: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [editingActivity, setEditingActivity] = useState<number | null>(null)

  // Calculate max possible duration for activities starting on this day
  const maxDuration = totalDays - day.dayNumber + 1

  return (
    <div className={cn('relative', !isLast && 'pb-8')}>
      {/* Timeline connector - More visible with primary color */}
      {!isLast && (
        <div className="absolute left-[23px] top-14 bottom-0 w-1 bg-gradient-to-b from-primary-300 via-primary-200 to-transparent rounded-full" />
      )}

      {/* Day Header */}
      <div className="flex items-start gap-4">
        {/* Day Number Circle - Larger with gradient */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center',
            'bg-gradient-to-br from-primary-500 to-primary-600',
            'text-white font-heading font-bold text-lg',
            'shadow-lg shadow-primary-500/25'
          )}>
            {day.dayNumber}
          </div>
        </div>

        {/* Day Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              )}
              <span className="text-sm font-heading font-semibold text-neutral-700">
                {formatDate(day.date)}
              </span>
            </button>

            <div className="flex-1" />

            {/* Activity count badge */}
            {day.activities.length > 0 && (
              <span className="text-xs px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-full font-heading font-medium">
                {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
              </span>
            )}
          </div>

          {/* Expandable Content */}
          {isExpanded && (
            <div className="space-y-4 animate-fade-in">
              {/* Day Title - Inside a subtle card container */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                <input
                  type="text"
                  value={day.title || ''}
                  onChange={(e) => onUpdateDayTitle(day.dayNumber, e.target.value)}
                  placeholder="Day theme (e.g., Beach Day, City Exploration)"
                  className={cn(
                    'w-full px-0 py-1 bg-transparent',
                    'text-lg font-display font-bold text-neutral-900',
                    'placeholder:text-neutral-400 placeholder:font-normal',
                    'border-b-2 border-transparent hover:border-neutral-200 focus:border-primary-400',
                    'transition-colors duration-200',
                    'focus:outline-none'
                  )}
                />

                {/* Activities */}
                <div className="space-y-2 mt-4">
                  {day.activities.map((activity, idx) => (
                    <ActivityItem
                      key={idx}
                      activity={activity}
                      dayNumber={day.dayNumber}
                      maxDuration={maxDuration}
                      isEditing={editingActivity === idx}
                      onStartEdit={() => setEditingActivity(idx)}
                      onEndEdit={() => setEditingActivity(null)}
                      onRemove={() => onRemoveActivity(day.dayNumber, idx)}
                      onChange={(field, value) => onActivityChange?.(day.dayNumber, idx, field, value)}
                    />
                  ))}

                  {/* Empty state */}
                  {day.activities.length === 0 && (
                    <p className="text-sm text-neutral-500 italic py-2">
                      No activities planned yet
                    </p>
                  )}

                  {/* Add Activity Button */}
                  <button
                    type="button"
                    onClick={() => onAddActivity(day.dayNumber)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 w-full',
                      'text-sm font-medium text-neutral-600 hover:text-primary-600',
                      'border-2 border-dashed border-neutral-200 hover:border-primary-300 rounded-lg',
                      'transition-all duration-200 hover:bg-primary-50/50'
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add activity</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Activity Item Component
function ActivityItem({
  activity,
  dayNumber,
  maxDuration,
  isEditing,
  onStartEdit,
  onEndEdit,
  onRemove,
  onChange,
}: {
  activity: Activity
  dayNumber: number
  maxDuration: number
  isEditing: boolean
  onStartEdit: () => void
  onEndEdit: () => void
  onRemove: () => void
  onChange: (field: string, value: string) => void
}) {
  const duration = activity.durationDays || 1
  const isMultiDay = duration > 1

  if (isEditing) {
    return (
      <div className="p-4 bg-white border-2 border-primary-300 rounded-xl shadow-md space-y-3 animate-scale-in">
        {/* Activity Title */}
        <input
          type="text"
          value={activity.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Activity name (e.g., Hiking Mt. Fuji)"
          autoFocus
          className={cn(
            'w-full px-3 py-2 text-sm font-heading font-bold',
            'border border-neutral-200 rounded-lg',
            'focus:outline-none focus:border-primary-400'
          )}
        />

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={activity.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Location"
            className={cn(
              'w-full pl-9 pr-3 py-2 text-sm',
              'border border-neutral-200 rounded-lg',
              'focus:outline-none focus:border-primary-400'
            )}
          />
        </div>

        {/* Duration & Time Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Duration Selector */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={duration}
              onChange={(e) => onChange('durationDays', e.target.value)}
              className={cn(
                'w-full pl-9 pr-3 py-2 text-sm appearance-none cursor-pointer',
                'border border-neutral-200 rounded-lg bg-white',
                'focus:outline-none focus:border-primary-400',
                duration > 1 && 'border-secondary-300 bg-secondary-50'
              )}
            >
              {Array.from({ length: maxDuration }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d === 1 ? 'Single day' : `${d} days (Day ${dayNumber}-${dayNumber + d - 1})`}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="time"
              value={activity.startTime || ''}
              onChange={(e) => onChange('startTime', e.target.value)}
              className={cn(
                'w-full pl-9 pr-3 py-2 text-sm',
                'border border-neutral-200 rounded-lg',
                'focus:outline-none focus:border-primary-400'
              )}
            />
          </div>
        </div>

        {/* Notes */}
        <textarea
          value={activity.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className={cn(
            'w-full px-3 py-2 text-sm',
            'border border-neutral-200 rounded-lg resize-none',
            'focus:outline-none focus:border-primary-400'
          )}
        />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={onEndEdit}
            className="px-4 py-1.5 text-sm font-heading font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onStartEdit}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl cursor-pointer',
        'border transition-all duration-200',
        isMultiDay
          ? 'bg-gradient-to-r from-secondary-50 to-white border-secondary-200 hover:border-secondary-400 hover:shadow-md'
          : 'bg-neutral-50 hover:bg-white border border-neutral-100 hover:border-neutral-300 hover:shadow-md'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
        isMultiDay
          ? 'bg-secondary-100 border border-secondary-300'
          : 'bg-white border border-neutral-200 shadow-sm'
      )}>
        {isMultiDay ? (
          <Tent className="w-4 h-4 text-secondary-700" />
        ) : (
          <MapPin className="w-4 h-4 text-primary-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm font-heading font-bold truncate',
            activity.title ? 'text-neutral-900' : 'text-neutral-500 italic'
          )}>
            {activity.title || 'Untitled activity'}
          </p>

          {/* Multi-day badge */}
          {isMultiDay && (
            <span className={cn(
              'flex-shrink-0 px-2 py-0.5 text-xs font-heading font-bold rounded-full',
              'bg-secondary-500 text-white'
            )}>
              {duration} days
            </span>
          )}
        </div>

        {(activity.location || activity.startTime) && (
          <div className="flex items-center gap-3 mt-1">
            {activity.location && (
              <span className="text-xs text-neutral-600 truncate">{activity.location}</span>
            )}
            {activity.startTime && (
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activity.startTime}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit hint */}
      <span className="text-xs text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
        Edit
      </span>
    </div>
  )
}

export function DayCards({
  days,
  onReorder,
  onAddActivity,
  onRemoveDay,
  onUpdateDayTitle,
  onRemoveActivity,
  onActivityChange,
}: DayCardsProps) {
  return (
    <div className="space-y-2">
      {days.map((day, index) => (
        <DaySection
          key={day.dayNumber}
          day={day}
          totalDays={days.length}
          isLast={index === days.length - 1}
          onAddActivity={onAddActivity}
          onUpdateDayTitle={onUpdateDayTitle}
          onRemoveActivity={onRemoveActivity}
          onActivityChange={onActivityChange}
        />
      ))}
    </div>
  )
}
