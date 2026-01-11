'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CountrySelect } from '@/components/ui/country-select'
import { Toggle } from '@/components/ui/toggle'
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
}

export function ItineraryForm({ initialData, isLoading = false }: ItineraryFormProps) {
  const router = useRouter()

  // Main itinerary fields
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [destination, setDestination] = useState(initialData?.destination || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true)
  const [startDate, setStartDate] = useState(initialData?.days[0]?.date || '')
  const [endDate, setEndDate] = useState(initialData?.days[initialData?.days.length - 1]?.date || '')

  // Days and activities
  const [days, setDays] = useState<DayForm[]>(
    initialData?.days.map((day) => ({
      dayNumber: day.day_number,
      date: day.date || '',
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
                return { ...activity, [field]: value }
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
              date: day.date || '',
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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {initialData ? 'Edit Trip' : 'Create New Trip'}
        </h1>
        <p className="text-gray-600">
          {initialData
            ? 'Update your trip details and itinerary'
            : 'Plan your next adventure'}
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Itinerary Section */}
      <Card className="mb-8 border-primary-200">
        <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-primary-200">
          <h2 className="text-2xl font-bold text-primary-900">✈️ Trip Details</h2>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {/* Basic Info Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
              Trip Information
            </h3>

            <div>
              <Input
                label="Trip Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Paris Spring Break"
                required
              />
            </div>

            <div>
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your trip (optional)"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-2">
                {description.length}/2000 characters
              </p>
            </div>
          </div>

          {/* Dates and Duration Section */}
          <div className="space-y-6 bg-gradient-to-br from-secondary-50 to-transparent p-6 rounded-lg border border-secondary-100">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary-500 rounded-full"></span>
              Trip Duration
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (endDate) {
                      generateDaysFromDates(e.target.value, endDate)
                    }
                  }}
                />
              </div>
              <div>
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    if (startDate) {
                      generateDaysFromDates(startDate, e.target.value)
                    }
                  }}
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="p-4 bg-white border-2 border-secondary-300 rounded-lg flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">Trip Duration</p>
                  <p className="text-xl font-bold text-secondary-700">
                    {getDayCount()} {getDayCount() === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Location and Visibility Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-accent-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent-500 rounded-full"></span>
              Location & Settings
            </h3>

            <div>
              <CountrySelect
                label="Country"
                value={destination}
                onChange={setDestination}
                placeholder="Select a country..."
              />
            </div>

            <div className="bg-gradient-to-r from-accent-50 to-transparent p-6 rounded-lg border border-accent-100 flex items-center justify-between">
              <div>
                <p className="font-medium text-accent-900">Trip Visibility</p>
                <p className="text-xs text-accent-600 mt-1">
                  {isPublic ? '🌍 Anyone with the link can view' : '🔒 Only you can view'}
                </p>
              </div>
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

      {/* Days and Activities Section */}
      {days.length > 0 && (
        <Card className="mb-8 border-secondary-200">
          <CardHeader className="bg-gradient-to-r from-secondary-50 to-accent-50 border-b border-secondary-200">
            <h2 className="text-2xl font-bold text-secondary-900">📋 Itinerary</h2>
          </CardHeader>
          <CardContent className="pt-8">
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
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting || isLoading}
        >
          {initialData ? 'Close' : 'Cancel'}
        </Button>
        {isModified && (
          <Button
            type="submit"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {initialData ? 'Save Changes' : 'Create Trip'}
          </Button>
        )}
      </div>
    </form>
  )
}
