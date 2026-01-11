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
            if (response.status === 404) {
              setError('Itinerary not found')
            } else if (response.status === 403) {
              setError('You do not have permission to edit this itinerary')
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {error ? (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Dashboard
              </button>
            </CardContent>
          </Card>
        </div>
      ) : itinerary ? (
        <ItineraryForm initialData={itinerary} />
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-gray-600">Itinerary not found</p>
          </div>
        </div>
      )}
    </div>
  )
}
