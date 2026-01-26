'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { ItineraryForm } from '@/components/itinerary/itinerary-form'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ItineraryWithDays } from '@/lib/types/models'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function EditItineraryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [itinerary, setItinerary] = useState<ItineraryWithDays | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch itinerary data
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!authLoading && user && id) {
      const fetchItinerary = async () => {
        try {
          const response = await fetch(`/api/itineraries/${id}`)
          if (!response.ok) {
            if (response.status === 404 || response.status === 403) {
              // Redirect to dashboard when itinerary not found or user doesn't have access
              router.push('/dashboard')
              return
            } else {
              setError('Failed to load itinerary')
            }
            setIsLoading(false)
            return
          }

          const data = await response.json()
          setItinerary(data)
        } catch (err) {
          console.error('Error fetching itinerary:', err)
          setError('Failed to load itinerary')
        } finally {
          setIsLoading(false)
        }
      }

      fetchItinerary()
    }
  }, [user, authLoading, id, router])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-color-surface via-cream to-color-surface flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-6" />
          <p className="text-lg text-neutral-600 font-body">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div>
      {error ? (
        <div className="min-h-screen bg-gradient-to-b from-color-surface via-cream to-color-surface flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="border-2 border-error bg-red-50">
              <CardContent className="pt-6">
                <p className="text-error font-heading font-bold mb-6 text-lg">{error}</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-3 px-4 bg-primary-600 text-white font-heading font-bold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : itinerary ? (
        <ItineraryForm initialData={itinerary} />
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-color-surface via-cream to-color-surface flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-neutral-600 font-body">Trip not found</p>
          </div>
        </div>
      )}
    </div>
  )
}
