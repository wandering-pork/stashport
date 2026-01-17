'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CountrySelect } from '@/components/ui/country-select'
import { Toggle } from '@/components/ui/toggle'
import { DateRangeCalendar } from '@/components/ui/date-range-calendar'
import { DayCards } from '@/components/itinerary/day-cards'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { itinerarySchema, daySchema, activitySchema } from '@/lib/utils/validation'
import { ItineraryWithDays } from '@/lib/types/models'
import { Trash2, Plus } from 'lucide-react'

interface ItineraryFormProps {
  initialData?: ItineraryWithDays
  isLoading?: boolean
}

interface DayForm {
  dayNumber: number
  date: string
  title: string
  activities: ActivityForm[]
}

interface ActivityForm {
  title: string
  location?: string
  startTime?: string
  endTime?: string
  notes?: string
  durationDays?: number
}

export function ItineraryForm({ initialData, isLoading = false }: ItineraryFormProps) {
  const router = useRouter()

  // Main itinerary fields
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [destination, setDestination] = useState(initialData?.destination || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true)
  // Helper to normalize date strings (handle ISO format)
  const normalizeDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''
    // Extract YYYY-MM-DD from ISO format if needed
    return dateStr.split('T')[0]
  }

  const [startDate, setStartDate] = useState(normalizeDate(initialData?.days[0]?.date))
  const [endDate, setEndDate] = useState(normalizeDate(initialData?.days[initialData?.days.length - 1]?.date))

  // Days and activities
  const [days, setDays] = useState<DayForm[]>(
    initialData?.days.map((day) => ({
      dayNumber: day.day_number,
      date: normalizeDate(day.date),
      title: day.title || '',
      activities: day.activities.map((activity) => ({
        title: activity.title,
        location: activity.location || '',
        startTime: activity.start_time || '',
        endTime: activity.end_time || '',
        notes: activity.notes || '',
      })) || [],
    })) || []
  )

  const [showDaysSection, setShowDaysSection] = useState(initialData ? true : false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Generate days from date range
  const generateDaysFromDates = (start: string, end: string) => {
    if (!start || !end) return

    const startDateObj = new Date(start)
    const endDateObj = new Date(end)

    if (startDateObj > endDateObj) return

    const newDays: DayForm[] = []
    const currentDate = new Date(startDateObj)
    let dayNumber = 1

    while (currentDate <= endDateObj) {
      const dateString = currentDate.toISOString().split('T')[0]
      newDays.push({
        dayNumber,
        date: dateString,
        title: '',
        activities: [],
      })
      currentDate.setDate(currentDate.getDate() + 1)
      dayNumber++
    }

    setDays(newDays)
  }

  // Calculate number of days
  const getDayCount = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  // Detect if form has changes
  const hasChanges = () => {
    if (!initialData) return true // New trip always has changes

    // Check basic fields
    if (
      title !== initialData.title ||
      description !== initialData.description ||
      destination !== initialData.destination ||
      isPublic !== initialData.is_public
    ) {
      return true
    }

    // Check if days changed
    if (days.length !== initialData.days.length) return true

    // Check each day and its activities
    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      const initialDay = initialData.days[i]

      if (
        !initialDay ||
        day.dayNumber !== initialDay.day_number ||
        day.date !== (initialDay.date || '') ||
        day.title !== (initialDay.title || '') ||
        day.activities.length !== initialDay.activities.length
      ) {
        return true
      }

      // Check each activity
      for (let j = 0; j < day.activities.length; j++) {
        const activity = day.activities[j]
        const initialActivity = initialDay.activities[j]

        if (
          !initialActivity ||
          activity.title !== initialActivity.title ||
          activity.location !== (initialActivity.location || '') ||
          activity.startTime !== (initialActivity.start_time || '') ||
          activity.endTime !== (initialActivity.end_time || '') ||
          activity.notes !== (initialActivity.notes || '')
        ) {
          return true
        }
      }
    }

    return false
  }

  const isModified = hasChanges()

  const handleAddDay = () => {
    const maxDay = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) : 0
    const newDayNumber = maxDay + 1
    setDays([
      ...days,
      {
        dayNumber: newDayNumber,
        date: '',
        title: '',
        activities: [],
      },
    ])
  }

  const handleRemoveDay = (dayNumber: number) => {
    if (days.length > 1) {
      setDays(days.filter((d) => d.dayNumber !== dayNumber))
    }
  }

  const handleAddActivity = (dayNumber: number) => {
    setDays(
      days.map((day) => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            activities: [
              ...day.activities,
              {
                title: '',
                location: '',
                startTime: '',
                endTime: '',
                notes: '',
                durationDays: 1,
              },
            ],
          }
        }
        return day
      })
    )
  }

  const handleRemoveActivity = (dayNumber: number, activityIndex: number) => {
    setDays(
      days.map((day) => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            activities: day.activities.filter((_, index) => index !== activityIndex),
          }
        }
        return day
      })
    )
  }

  const handleActivityChange = (
    dayNumber: number,
    activityIndex: number,
    field: string,
    value: string
  ) => {
    setDays(
      days.map((day) => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            activities: day.activities.map((activity, index) => {
              if (index === activityIndex) {
                // Convert durationDays to number
                const processedValue = field === 'durationDays' ? parseInt(value, 10) || 1 : value
                return { ...activity, [field]: processedValue }
              }
              return activity
            }),
          }
        }
        return day
      })
    )
  }

  const handleDayChange = (
    dayNumber: number,
    field: keyof Omit<DayForm, 'activities'>,
    value: string
  ) => {
    setDays(
      days.map((day) => {
        if (day.dayNumber === dayNumber) {
          return { ...day, [field]: value }
        }
        return day
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate main itinerary data
      const itineraryValidation = itinerarySchema.safeParse({
        title,
        description,
        destination,
        isPublic,
      })

      if (!itineraryValidation.success) {
        setError(itineraryValidation.error.issues[0].message)
        setIsSubmitting(false)
        return
      }

      // Validate days and activities
      const validatedDays = days.map((day) => {
        const dayValidation = daySchema.safeParse({
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title,
        })

        if (!dayValidation.success) {
          throw new Error(`Day ${day.dayNumber}: ${dayValidation.error.issues[0].message}`)
        }

        const activities = day.activities.map((activity) => {
          const activityValidation = activitySchema.safeParse({
            title: activity.title,
            location: activity.location,
            startTime: activity.startTime,
            endTime: activity.endTime,
            notes: activity.notes,
          })

          if (!activityValidation.success) {
            throw new Error(
              `Activity in day ${day.dayNumber}: ${activityValidation.error.issues[0].message}`
            )
          }

          return activityValidation.data
        })

        return {
          dayNumber: dayValidation.data.dayNumber,
          date: dayValidation.data.date,
          title: dayValidation.data.title || '',
          activities,
        }
      })

      // Prepare request payload
      const payload = {
        title: itineraryValidation.data.title,
        description: itineraryValidation.data.description || null,
        destination: itineraryValidation.data.destination || null,
        isPublic: itineraryValidation.data.isPublic,
        days: validatedDays,
      }

      // Make API request
      const url = initialData
        ? `/api/itineraries/${initialData.id}`
        : '/api/itineraries'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save itinerary')
      }

      const createdItinerary = await response.json()

      // Update form state to match saved data (clears change detection)
      if (initialData && createdItinerary) {
        setTitle(createdItinerary.title)
        setDescription(createdItinerary.description || '')
        setDestination(createdItinerary.destination || '')
        setIsPublic(createdItinerary.is_public)

        if (createdItinerary.days) {
          setDays(
            createdItinerary.days.map((day: any) => ({
              dayNumber: day.day_number,
              date: normalizeDate(day.date),
              title: day.title || '',
              activities: day.activities.map((activity: any) => ({
                title: activity.title,
                location: activity.location || '',
                startTime: activity.start_time || '',
                endTime: activity.end_time || '',
                notes: activity.notes || '',
              })) || [],
            }))
          )
        }
      }

      // Only navigate away when creating new trip
      if (!initialData) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-gradient-to-b from-color-surface via-cream to-color-surface pb-32">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 animate-fade-in">
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 bg-primary-50 border border-primary-200 rounded-full">
          <span className="text-xl">✈️</span>
          <span className="text-xs font-heading font-bold uppercase text-primary-700">
            {initialData ? 'Edit' : 'Create'} Adventure
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-900 mb-4">
          {initialData ? 'Edit Your Adventure' : 'Create Your Adventure'}
        </h1>
        <p className="text-lg text-neutral-600 font-body max-w-2xl">
          {initialData
            ? 'Update your trip details and refine your itinerary day by day'
            : 'Plan every detail of your next journey and inspire other travelers'}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 mb-6 animate-shake">
          <Card className="border-2 border-error bg-red-50">
            <CardContent className="pt-6">
              <p className="text-error font-heading font-bold">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 overflow-visible">
        {/* Consolidated Trip Details Card */}
        <Card className="mb-8 border-t-4 border-t-primary-500 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {/* Card Header */}
          <CardHeader className="bg-gradient-to-r from-primary-50/80 to-transparent border-b border-primary-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-2xl">
                ✈️
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-900">Trip Details</h2>
                <p className="text-sm text-primary-700">Tell us about your adventure</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8 space-y-8">
            {/* Row 1: Title & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trip Title */}
              <div>
                <Input
                  label="Trip Title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Venice Summer Escape"
                  required
                />
              </div>

              {/* Destination */}
              <div>
                <CountrySelect
                  label="Destination"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Select a country..."
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Row 2: Travel Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Travel Dates
              </label>
              <DateRangeCalendar
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(date) => {
                  setStartDate(date)
                  if (endDate) {
                    generateDaysFromDates(date, endDate)
                  }
                }}
                onEndDateChange={(date) => {
                  setEndDate(date)
                  if (startDate) {
                    generateDaysFromDates(startDate, date)
                  }
                }}
              />

              {/* Duration Badge - Inline display when dates selected */}
              {startDate && endDate && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-full animate-scale-in">
                  <span className="text-secondary-600 text-sm font-heading font-bold">
                    {getDayCount()} {getDayCount() === 1 ? 'day' : 'days'}
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Row 3: Description */}
            <div>
              <Textarea
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the story of your trip - what inspired it, what you hope to experience..."
                maxLength={2000}
              />
              <p className="text-xs text-neutral-400 mt-2">
                {description.length}/2000
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Row 4: Visibility Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-heading font-bold text-neutral-800">Trip Visibility</p>
                <p className="text-sm text-neutral-500 mt-1">
                  {isPublic ? 'Anyone with the link can view' : 'Only you can view'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-500">
                  {isPublic ? 'Public' : 'Private'}
                </span>
                <Toggle
                  id="isPublic"
                  checked={isPublic}
                  onChange={setIsPublic}
                  label=""
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Days and Activities Section - Timeline */}
        {days.length > 0 && (
          <div className="animate-fade-in mb-12" style={{ animationDelay: '200ms' }}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-100 text-xl">
                📅
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-neutral-900">Your Itinerary</h2>
                <p className="text-sm text-neutral-500">
                  {days.length} {days.length === 1 ? 'day' : 'days'} planned
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="pl-1">
              <DayCards
                days={days}
                onReorder={setDays}
                onAddActivity={handleAddActivity}
                onRemoveDay={handleRemoveDay}
                onUpdateDayTitle={(dayNumber, title) =>
                  handleDayChange(dayNumber, 'title', title)
                }
                onRemoveActivity={handleRemoveActivity}
                onActivityChange={handleActivityChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer with Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-4 justify-end">
          <Button
            type="button"
            variant="tertiary"
            onClick={() => router.back()}
            disabled={isSubmitting || isLoading}
            className="font-heading font-bold"
          >
            {initialData ? 'Close' : 'Cancel'}
          </Button>
          {isModified && (
            <Button
              type="submit"
              isLoading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
              className="font-heading font-bold min-w-[160px]"
            >
              {initialData ? 'Save Changes' : 'Create Trip'}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
