'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

interface Day {
  dayNumber: number
  date: string
  title: string
  activities: any[]
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

function SortableDayCard({
  day,
  daysLength,
  onAddActivity,
  onRemoveDay,
  onUpdateDayTitle,
  onRemoveActivity,
  onActivityChange,
}: {
  day: Day
  daysLength: number
  onAddActivity: (dayNumber: number) => void
  onRemoveDay: (dayNumber: number) => void
  onUpdateDayTitle: (dayNumber: number, title: string) => void
  onRemoveActivity: (dayNumber: number, activityIndex: number) => void
  onActivityChange?: (dayNumber: number, activityIndex: number, field: string, value: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `day-${day.dayNumber}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dateObj = new Date(day.date)
  const dateString = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-gradient-to-br from-white to-gray-50 border-2 rounded-lg p-4 transition-all',
        'border-primary-200 hover:border-primary-400',
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary-400' : 'hover:shadow-lg'
      )}
    >
      {/* Card Header with Drag Handle */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-primary-100">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-primary-100 rounded-lg transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-primary-500" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-primary-900">
            Day {day.dayNumber}
          </h3>
          <p className="text-xs text-primary-600 font-medium">{dateString}</p>
        </div>

        {daysLength > 1 && (
          <button
            onClick={() => onRemoveDay(day.dayNumber)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete day"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      {/* Day Title Input */}
      <Input
        type="text"
        value={day.title || ''}
        onChange={(e) => onUpdateDayTitle(day.dayNumber, e.target.value)}
        placeholder="Add a title for this day (optional)"
        className="mb-4 border-primary-200 focus:border-primary-500 focus:ring-primary-500"
      />

      {/* Activities Summary */}
      {day.activities.length > 0 && (
        <div className="mb-4 space-y-2">
          {day.activities.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-secondary-50 p-3 rounded-lg border border-primary-100 hover:border-primary-300 transition-colors">
              <span className="text-sm font-medium text-primary-900 truncate">{activity.title || 'Untitled'}</span>
              <button
                onClick={() => onRemoveActivity(day.dayNumber, idx)}
                className="p-1 hover:bg-red-100 rounded transition-colors ml-2"
                title="Delete activity"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity Button */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => onAddActivity(day.dayNumber)}
        className="w-full gap-2 text-xs bg-primary-500 hover:bg-primary-600 text-white border-0"
      >
        <Plus className="w-3 h-3" />
        Add Activity
      </Button>
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeIndex = days.findIndex((d) => `day-${d.dayNumber}` === active.id)
      const overIndex = days.findIndex((d) => `day-${d.dayNumber}` === over.id)

      if (activeIndex !== -1 && overIndex !== -1) {
        // Reorder the days
        const reorderedDays = arrayMove(days, activeIndex, overIndex)

        // Get the starting date (first day's date)
        const firstDayDate = new Date(reorderedDays[0].date)

        // Recalculate all dates starting from first day
        const updatedDays = reorderedDays.map((day, idx) => {
          const newDate = new Date(firstDayDate)
          newDate.setDate(newDate.getDate() + idx)
          const dateString = newDate.toISOString().split('T')[0]

          return {
            ...day,
            dayNumber: idx + 1,
            date: dateString,
          }
        })
        onReorder(updatedDays)
      }
    }
  }

  const dayIds = days.map((day) => `day-${day.dayNumber}`)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={dayIds} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => (
            <SortableDayCard
              key={day.dayNumber}
              day={day}
              daysLength={days.length}
              onAddActivity={onAddActivity}
              onRemoveDay={onRemoveDay}
              onUpdateDayTitle={onUpdateDayTitle}
              onRemoveActivity={onRemoveActivity}
              onActivityChange={onActivityChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
