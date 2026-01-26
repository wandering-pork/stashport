'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CountrySelect } from '@/components/ui/country-select'
import { Toggle } from '@/components/ui/toggle'
import { DateRangeCalendar } from '@/components/ui/date-range-calendar'
import { DayCards } from '@/components/itinerary/day-cards'
import { SectionCards, Section } from '@/components/itinerary/section-cards'
import { AddSectionModal } from '@/components/itinerary/add-section-modal'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SaveStatusIndicator } from '@/components/ui/save-status'
import { TagSelector } from '@/components/ui/tag-selector'
import { BudgetSelector } from '@/components/ui/budget-selector'
import { TypeSelector } from '@/components/itinerary/type-selector'
import { CoverUpload } from '@/components/itinerary/cover-upload'
import { itinerarySchema, daySchema, activitySchema } from '@/lib/utils/validation'
import { ItineraryWithDays, ItineraryType } from '@/lib/types/models'
import { ItineraryTypeKey } from '@/lib/constants/templates'
import { useAutosave } from '@/lib/hooks/use-autosave'
import { Trash2, Plus, HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

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
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [budgetLevel, setBudgetLevel] = useState<number | null>(initialData?.budget_level || null)
  const [itineraryType, setItineraryType] = useState<ItineraryTypeKey>(
    (initialData?.type as ItineraryTypeKey) || 'daily'
  )
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(
    initialData?.cover_photo_url || null
  )
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

  // Sections for guide type - initialize from initialData if available
  const [sections, setSections] = useState<Section[]>(() => {
    // If we have initialData with categories (guide type), use them
    if (initialData?.categories && Array.isArray(initialData.categories)) {
      return initialData.categories.map((cat: any, idx: number) => ({
        name: cat.name || 'Untitled Section',
        icon: cat.icon || '📍',
        sortOrder: cat.sort_order ?? idx,
        items: (cat.items || cat.category_items || []).map((item: any, itemIdx: number) => ({
          title: item.title || '',
          location: item.location || '',
          notes: item.notes || '',
          sortOrder: item.sort_order ?? itemIdx,
        })),
      }))
    }
    return []
  })

  // Show add section modal state
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftRecovered, setDraftRecovered] = useState(false)

  // Autosave configuration
  const storageKey = initialData
    ? `stashport-draft-${initialData.id}`
    : 'stashport-draft-new'

  const autosave = useAutosave<{
    title: string
    description: string
    destination: string
    isPublic: boolean
    startDate: string
    endDate: string
    days: DayForm[]
    sections: Section[]
    tags: string[]
    budgetLevel: number | null
    itineraryType: ItineraryTypeKey
    coverPhotoUrl: string | null
  }>({
    storageKey,
    debounceMs: 2000,
    syncToServer: !!initialData,
    itineraryId: initialData?.id,
  })

  // Create form data object for autosave
  const formData = useMemo(() => ({
    title,
    description,
    destination,
    isPublic,
    startDate,
    endDate,
    days,
    sections,
    tags,
    budgetLevel,
    itineraryType,
    coverPhotoUrl,
  }), [title, description, destination, isPublic, startDate, endDate, days, sections, tags, budgetLevel, itineraryType, coverPhotoUrl])

  // Trigger autosave when form data changes
  useEffect(() => {
    // Skip initial render and when data matches initial (no changes)
    if (!draftRecovered && !initialData) {
      // For new trips, check for and recover drafts on mount
      const draft = autosave.loadDraft()
      if (draft) {
        setTitle(draft.title || '')
        setDescription(draft.description || '')
        setDestination(draft.destination || '')
        setIsPublic(draft.isPublic ?? true)
        setStartDate(draft.startDate || '')
        setEndDate(draft.endDate || '')
        if (draft.days && draft.days.length > 0) {
          setDays(draft.days)
        }
        if (draft.sections && draft.sections.length > 0) {
          setSections(draft.sections)
        }
        if (draft.itineraryType) {
          setItineraryType(draft.itineraryType)
        }
        setDraftRecovered(true)
        return
      }
    }
    setDraftRecovered(true)

    // Only autosave if there are actual changes
    if (title || description || destination || days.length > 0 || sections.length > 0) {
      // Filter out incomplete activities to prevent validation errors during autosave
      const filteredDays = days.map(day => ({
        ...day,
        activities: day.activities.filter(activity => activity.title.trim() !== '')
      }))

      // Filter out incomplete section items
      const filteredSections = sections.map(section => ({
        ...section,
        items: section.items.filter(item => item.title.trim() !== '')
      }))

      autosave.updateData({
        ...formData,
        days: filteredDays,
        sections: filteredSections,
        tags,
        budgetLevel,
      })
    }
  }, [formData, initialData, draftRecovered])

  // Clear draft on successful save (for new trips)
  const clearDraftOnSuccess = useCallback(() => {
    if (!initialData) {
      autosave.clearDraft()
    }
  }, [initialData, autosave])

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

    // Check tags
    const initialTags = initialData.tags || []
    if (tags.length !== initialTags.length || !tags.every(t => initialTags.includes(t))) {
      return true
    }

    // Check budget
    if (budgetLevel !== initialData.budget_level) {
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

      // Prepare sections for guide type
      const validatedSections = itineraryType === 'guide'
        ? sections.map((section, idx) => ({
            name: section.name,
            icon: section.icon,
            sortOrder: idx,
            items: section.items
              .filter(item => item.title.trim() !== '') // Only include items with titles
              .map((item, itemIdx) => ({
                title: item.title,
                location: item.location || null,
                notes: item.notes || null,
                sortOrder: itemIdx,
              })),
          }))
        : []

      // Prepare request payload
      const payload = {
        title: itineraryValidation.data.title,
        description: itineraryValidation.data.description || null,
        destination: itineraryValidation.data.destination || null,
        isPublic: itineraryValidation.data.isPublic,
        budgetLevel,
        tags,
        type: itineraryType,
        cover_photo_url: coverPhotoUrl,
        // For daily type, send days; for guide type, send sections
        ...(itineraryType === 'daily' ? { days: validatedDays } : { sections: validatedSections }),
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
        setTags(createdItinerary.tags || [])
        setBudgetLevel(createdItinerary.budget_level || null)

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

        // Update sections for guide type
        if (createdItinerary.categories) {
          setSections(
            createdItinerary.categories.map((cat: any, idx: number) => ({
              name: cat.name || 'Untitled Section',
              icon: cat.icon || '📍',
              sortOrder: cat.sort_order ?? idx,
              items: (cat.items || cat.category_items || []).map((item: any, itemIdx: number) => ({
                title: item.title || '',
                location: item.location || '',
                notes: item.notes || '',
                sortOrder: item.sort_order ?? itemIdx,
              })),
            }))
          )
        }
      }

      // Clear draft and navigate away when creating new trip
      if (!initialData) {
        clearDraftOnSuccess()
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} noValidate className="min-h-screen bg-gradient-to-b from-color-surface via-cream to-color-surface pb-32">
        {/* Header Section - Clean and minimal */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900">
          {initialData ? 'Edit Trip' : 'Create New Trip'}
        </h1>
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
        {/* Trip Details Card - Clean, no redundant header */}
        <Card className="mb-8 border-t-4 border-t-primary-500 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-8 space-y-8">
            {/* Row 1: Title & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trip Title */}
              <div>
                <Input
                  label="Trip Title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Venice Summer Escape"
                  required
                  data-testid="title-input"
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

            {/* Row 2: Travel Dates (only for daily itineraries) */}
            {itineraryType === 'daily' && (
              <>
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
              </>
            )}

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

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Trip Categories (optional)
              </label>
              <TagSelector
                selected={tags}
                onChange={setTags}
                max={3}
              />
              <p className="text-xs text-neutral-400 mt-2">
                Select up to 3 categories to help others discover your trip
              </p>
            </div>

            {/* Budget Section */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                Budget Level (optional)
                <Tooltip>
                  <TooltipTrigger type="button">
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-1">
                      <p><strong>$</strong> = Budget-friendly</p>
                      <p><strong>$$</strong> = Moderate spending</p>
                      <p><strong>$$$</strong> = Upscale experiences</p>
                      <p><strong>$$$$</strong> = Luxury travel</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </label>
              <BudgetSelector
                value={budgetLevel}
                onChange={setBudgetLevel}
              />
            </div>

            {/* Type Section */}
            <TypeSelector
              value={itineraryType}
              onChange={setItineraryType}
              disabled={isLoading || isSubmitting}
            />

            {/* Cover Photo Section */}
            <CoverUpload
              value={coverPhotoUrl}
              onChange={setCoverPhotoUrl}
              disabled={isLoading || isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Days Section - For Daily Type */}
        {itineraryType === 'daily' && days.length > 0 && (
          <div className="animate-fade-in mb-12" style={{ animationDelay: '200ms' }}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-100 text-xl">
                📅
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-neutral-900">
                  Your Itinerary
                </h2>
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

        {/* Sections - For Guide Type */}
        {itineraryType === 'guide' && sections.length > 0 && (
          <div className="animate-fade-in mb-12" style={{ animationDelay: '200ms' }}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-xl shadow-sm">
                ❤️
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-neutral-900">
                  Your Favorites
                </h2>
                <p className="text-sm text-neutral-500">
                  {sections.length} {sections.length === 1 ? 'section' : 'sections'} with{' '}
                  {sections.reduce((acc, s) => acc + s.items.length, 0)} places
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="pl-1">
              <SectionCards
                sections={sections}
                onSectionsChange={setSections}
              />
            </div>
          </div>
        )}

        {/* Empty state for guide type when no sections exist */}
        {itineraryType === 'guide' && sections.length === 0 && (
          <div className="animate-fade-in mb-12" style={{ animationDelay: '200ms' }}>
            <Card variant="default" className="border-2 border-dashed border-secondary-200 bg-gradient-to-br from-secondary-50/50 to-primary-50/30">
              <CardContent padding="relaxed" className="text-center py-12">
                <div className="mb-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary-100 to-primary-100 flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-4xl">❤️</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center shadow-md">
                      <Plus className="w-4 h-4 text-accent-600" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
                  Start Adding Your Favorites
                </h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  Organize your favorite spots into sections like "Best Restaurants", "Hidden Gems", or "Must-See Attractions"
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setShowAddSectionModal(true)}
                  className="gap-2 font-heading font-bold shadow-coral"
                >
                  <Plus className="w-4 h-4" />
                  Add First Section
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Section Modal for Guide Type */}
        <AddSectionModal
          open={showAddSectionModal}
          onOpenChange={setShowAddSectionModal}
          onAddSection={(newSection) => {
            setSections([
              ...sections,
              {
                name: newSection.name,
                icon: newSection.icon,
                sortOrder: sections.length,
                items: [],
              },
            ])
          }}
          existingSectionNames={sections.map(s => s.name)}
        />
      </div>

      {/* Sticky Footer with Actions */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          {/* Save Status Indicator - Left Side */}
          <SaveStatusIndicator
            status={autosave.status}
            lastSaved={autosave.lastSaved}
            error={autosave.error}
            className="flex-1"
          />

          {/* Actions - Right Side */}
          <div className="flex gap-4">
          <Button
            type="button"
            variant="tertiary"
            onClick={() => router.back()}
            disabled={isSubmitting || isLoading}
            className="font-heading font-bold"
          >
            {initialData ? 'Close' : 'Cancel'}
          </Button>
          {!initialData && isModified && (
            <Button
              type="submit"
              isLoading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
              className="font-heading font-bold min-w-[160px]"
            >
              Create Trip
            </Button>
          )}
          </div>
        </div>
      </div>
    </form>
    </TooltipProvider>
  )
}
