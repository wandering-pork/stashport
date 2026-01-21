import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { itinerarySchema, daySchema, activitySchema } from '@/lib/utils/validation'
import { generateSlug } from '@/lib/utils/slug'
import { randomUUID } from 'crypto'

// GET - Fetch all itineraries for the current user
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/itineraries - Request received')

  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[API] GET /api/itineraries - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API] GET /api/itineraries - Fetching for user:', { userId: user.id })

    // Fetch user's itineraries with nested days and activities
    const { data: itineraries, error } = await supabase
      .from('itineraries')
      .select(
        `
        *,
        days(
          *,
          activities(*)
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] GET /api/itineraries - Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch itineraries' },
        { status: 500 }
      )
    }

    console.log('[API] GET /api/itineraries - Fetched itineraries:', {
      count: itineraries?.length || 0
    })

    // Fetch tags for all itineraries
    const itineraryIds = itineraries?.map(i => i.id) || []

    let tagsMap: Record<string, string[]> = {}
    if (itineraryIds.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from('trip_tags')
        .select('itinerary_id, tag')
        .in('itinerary_id', itineraryIds)

      if (!tagsError && tags) {
        tagsMap = tags.reduce((acc, { itinerary_id, tag }) => {
          if (!acc[itinerary_id]) acc[itinerary_id] = []
          acc[itinerary_id].push(tag)
          return acc
        }, {} as Record<string, string[]>)
      }
    }

    // Merge tags into itineraries
    const itinerariesWithTags = itineraries?.map(itinerary => ({
      ...itinerary,
      tags: tagsMap[itinerary.id] || [],
    }))

    console.log('[API] GET /api/itineraries - Success:', {
      totalItineraries: itinerariesWithTags?.length || 0
    })

    return NextResponse.json(itinerariesWithTags)
  } catch (err) {
    console.error('[API] GET /api/itineraries - Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new itinerary
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/itineraries - Request received')

  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[API] POST /api/itineraries - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user profile exists
    if (user.email) {
      try {
        await supabase
          .from('users')
          .insert({
            id: user.id,
            auth_id: user.id,
            email: user.email,
          })
      } catch {
        // User record might already exist, which is fine
      }
    }

    const body = await request.json()
    const { title, description, destination, isPublic, days, tags, budgetLevel } = body

    console.log('[API] POST /api/itineraries - Payload:', {
      title,
      destination,
      daysCount: days?.length || 0,
      tagsCount: tags?.length || 0,
      budgetLevel,
      type: body.type || 'daily',
      hasCoverPhoto: !!body.cover_photo_url,
      userId: user.id
    })

    // Validate itinerary data
    const itineraryValidation = itinerarySchema.safeParse({
      title,
      description,
      destination,
      isPublic,
      budgetLevel,
      tags,
    })

    if (!itineraryValidation.success) {
      console.error('[API] POST /api/itineraries - Validation failed:', itineraryValidation.error.issues[0].message)
      return NextResponse.json(
        { error: itineraryValidation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = generateSlug(title)

    // Create itinerary
    const { data: itinerary, error: itineraryError } = await supabase
      .from('itineraries')
      .insert([
        {
          id: randomUUID(),
          user_id: user.id,
          title: itineraryValidation.data.title,
          description: itineraryValidation.data.description || null,
          destination: itineraryValidation.data.destination || null,
          slug,
          is_public: itineraryValidation.data.isPublic,
          budget_level: itineraryValidation.data.budgetLevel || null,
          type: body.type || 'daily',
          cover_photo_url: body.cover_photo_url || null,
          stashed_from_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (itineraryError) {
      console.error('[API] POST /api/itineraries - Creation error:', itineraryError)
      return NextResponse.json(
        { error: 'Failed to create itinerary' },
        { status: 500 }
      )
    }

    console.log('[API] POST /api/itineraries - Created itinerary:', {
      id: itinerary.id,
      slug: itinerary.slug
    })

    // Insert tags if provided
    const validatedTags = itineraryValidation.data.tags || []
    if (validatedTags.length > 0) {
      const tagsToInsert = validatedTags.map(tag => ({
        id: randomUUID(),
        itinerary_id: itinerary.id,
        tag,
        created_at: new Date().toISOString(),
      }))

      const { error: tagsError } = await supabase
        .from('trip_tags')
        .insert(tagsToInsert)

      if (tagsError) {
        console.error('Tags creation error:', tagsError)
        // Continue anyway - itinerary was created
      }
    }

    // Create days if provided
    if (days && Array.isArray(days) && days.length > 0) {
      const daysToInsert = days.map((day: any, index: number) => {
        // Validate day data
        const dayValidation = daySchema.safeParse({
          dayNumber: day.dayNumber || index + 1,
          date: day.date,
          title: day.title,
        })

        if (!dayValidation.success) {
          throw new Error(`Invalid day data: ${dayValidation.error.issues[0].message}`)
        }

        return {
          id: randomUUID(),
          itinerary_id: itinerary.id,
          day_number: dayValidation.data.dayNumber,
          date: dayValidation.data.date || null,
          title: dayValidation.data.title || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })

      const { data: insertedDays, error: daysError } = await supabase
        .from('days')
        .insert(daysToInsert)
        .select()

      if (daysError) {
        console.error('Days creation error:', daysError)
        // Continue anyway - itinerary was created
      }

      // Create activities if provided
      if (insertedDays) {
        const activitiesToInsert: any[] = []

        days.forEach((day: any, dayIndex: number) => {
          if (day.activities && Array.isArray(day.activities)) {
            day.activities.forEach((activity: any) => {
              // Validate activity data
              const activityValidation = activitySchema.safeParse({
                title: activity.title,
                location: activity.location,
                startTime: activity.startTime,
                endTime: activity.endTime,
                notes: activity.notes,
              })

              if (!activityValidation.success) {
                throw new Error(
                  `Invalid activity data: ${activityValidation.error.issues[0].message}`
                )
              }

              const dayId = insertedDays[dayIndex]?.id
              if (dayId) {
                activitiesToInsert.push({
                  id: randomUUID(),
                  day_id: dayId,
                  title: activityValidation.data.title,
                  location: activityValidation.data.location || null,
                  start_time: activityValidation.data.startTime || null,
                  end_time: activityValidation.data.endTime || null,
                  notes: activityValidation.data.notes || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
              }
            })
          }
        })

        if (activitiesToInsert.length > 0) {
          const { error: activitiesError } = await supabase
            .from('activities')
            .insert(activitiesToInsert)

          if (activitiesError) {
            console.error('Activities creation error:', activitiesError)
            // Continue anyway - itinerary and days were created
          }
        }
      }
    }

    // Fetch the complete itinerary with days and activities
    const { data: completeItinerary, error: fetchError } = await supabase
      .from('itineraries')
      .select(
        `
        *,
        days(
          *,
          activities(*)
        )
      `
      )
      .eq('id', itinerary.id)
      .single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json(itinerary)
    }

    // Fetch tags for the created itinerary
    const { data: insertedTags } = await supabase
      .from('trip_tags')
      .select('tag')
      .eq('itinerary_id', itinerary.id)

    const response = {
      ...completeItinerary,
      tags: insertedTags?.map(t => t.tag) || [],
    }

    console.log('[API] POST /api/itineraries - Success:', {
      id: response.id,
      slug: response.slug,
      daysCreated: response.days?.length || 0
    })

    return NextResponse.json(response, { status: 201 })
  } catch (err: any) {
    console.error('[API] POST /api/itineraries - Unexpected error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
