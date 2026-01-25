'use client'

import { useState, useEffect, useCallback } from 'react'
import { ExploreCard, ExploreItinerary } from './explore-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Compass, RefreshCw, ChevronDown, Sparkles, Globe2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ExploreGridProps {
  initialItineraries?: ExploreItinerary[]
}

interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

export function ExploreGrid({ initialItineraries }: ExploreGridProps) {
  const [itineraries, setItineraries] = useState<ExploreItinerary[]>(initialItineraries || [])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(!initialItineraries)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItineraries = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      const response = await fetch(`/api/itineraries/explore?page=${page}&limit=12`)

      if (!response.ok) {
        throw new Error('Failed to fetch adventures')
      }

      const data = await response.json()

      if (append) {
        setItineraries(prev => [...prev, ...data.itineraries])
      } else {
        setItineraries(data.itineraries)
      }
      setPagination(data.pagination)
    } catch (err: any) {
      console.error('[ExploreGrid] Error fetching:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    if (!initialItineraries) {
      fetchItineraries()
    }
  }, [initialItineraries, fetchItineraries])

  const handleLoadMore = () => {
    if (pagination && pagination.hasMore) {
      fetchItineraries(pagination.page + 1, true)
    }
  }

  const handleRefresh = () => {
    fetchItineraries(1, false)
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center shadow-md">
            <Globe2 className="w-4 h-4 text-accent-600" />
          </div>
        </div>
        <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
          Discovering adventures
        </h3>
        <p className="text-neutral-500 font-body">
          Finding inspiration from travelers around the world...
        </p>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <Card variant="elevated" className="border-2 border-red-200 animate-reveal-up">
        <CardContent padding="relaxed" className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">😕</span>
          </div>
          <h3 className="text-xl font-display font-bold text-neutral-900 mb-2">
            Couldn't load adventures
          </h3>
          <p className="text-neutral-600 font-body mb-6">
            {error}
          </p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            className="shadow-coral"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Empty State
  if (itineraries.length === 0) {
    return (
      <Card variant="editorial" className="relative overflow-hidden animate-reveal-up">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary-200/30 to-transparent rounded-full blur-3xl" />

        <CardContent padding="none" className="relative z-10 py-16 px-8 text-center">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-xl mx-auto">
              <Compass className="w-12 h-12 text-primary-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center shadow-lg animate-float">
              <Sparkles className="w-5 h-5 text-accent-600" />
            </div>
          </div>

          <h3 className="text-editorial-headline text-3xl lg:text-4xl text-neutral-900 mb-4">
            No adventures to explore
            <span className="text-gradient-vibrant"> yet</span>
          </h3>

          <p className="text-lg text-neutral-600 font-body mb-8 max-w-md mx-auto">
            Be the first to share your journey! Create a public trip and inspire
            travelers around the world.
          </p>

          <Button
            size="lg"
            onClick={() => window.location.href = '/itinerary/new'}
            className="font-heading font-bold shadow-coral hover:shadow-coral-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your First Trip
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Main Grid
  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary, index) => (
          <ExploreCard
            key={itinerary.id}
            itinerary={itinerary}
            index={index}
          />
        ))}
      </div>

      {/* Load More */}
      {pagination?.hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleLoadMore}
            isLoading={isLoadingMore}
            className="font-heading font-bold min-w-[200px]"
          >
            {isLoadingMore ? (
              'Loading...'
            ) : (
              <>
                <ChevronDown className="w-5 h-5 mr-2" />
                Load More Adventures
                <span className="ml-2 text-neutral-500">
                  ({pagination.totalCount - itineraries.length} more)
                </span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* End of list indicator */}
      {pagination && !pagination.hasMore && itineraries.length > 6 && (
        <div className="text-center py-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-neutral-400 text-sm font-body">
            <span className="w-8 h-px bg-neutral-200" />
            <span>You've seen all {pagination.totalCount} adventures</span>
            <span className="w-8 h-px bg-neutral-200" />
          </div>
        </div>
      )}
    </div>
  )
}
