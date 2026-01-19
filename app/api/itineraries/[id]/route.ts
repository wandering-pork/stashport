import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { itinerarySchema, daySchema, activitySchema } from '@/lib/utils/validation'
import { randomUUID } from 'crypto'

// GET - Fetch a single itinerary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { data: itinerary, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error || !itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(itinerary)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update an itinerary
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if itinerary belongs to user
    const { data: existingItinerary, error: fetchError } = await supabase
      .from('itineraries')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingItinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }

    if (existingItinerary.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you do not own this itinerary' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, destination, isPublic, days, tags, budgetLevel } = body

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
      return NextResponse.json(
        { error: itineraryValidation.error.issues[0].message },
        { status: 400 }
      )
    }

    // Update itinerary
    const { data: updatedItinerary, error: updateError } = await supabase
      .from('itineraries')
      .update({
        title: itineraryValidation.data.title,
        description: itineraryValidation.data.description || null,
        destination: itineraryValidation.data.destination || null,
        is_public: itineraryValidation.data.isPublic,
        budget_level: itineraryValidation.data.budgetLevel || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update itinerary' },
        { status: 500 }
      )
    }

    // Update tags - delete existing and insert new
    const { error: deleteTagsError } = await supabase
      .from('trip_tags')
      .delete()
      .eq('itinerary_id', id)

    if (deleteTagsError) {
      console.error('Delete tags error:', deleteTagsError)
    }

    const validatedTags = itineraryValidation.data.tags || []
    if (validatedTags.length > 0) {
      const tagsToInsert = validatedTags.map(tag => ({
        id: randomUUID(),
        itinerary_id: id,
        tag,
        created_at: new Date().toISOString(),
      }))

      const { error: insertTagsError } = await supabase
        .from('trip_tags')
        .insert(tagsToInsert)

      if (insertTagsError) {
        console.error('Insert tags error:', insertTagsError)
      }
    }

    // Handle days update if provided
    if (days && Array.isArray(days)) {
      // Delete existing days
      const { error: deleteError } = await supabase
        .from('days')
        .delete()
        .eq('itinerary_id', id)

      if (deleteError) {
        console.error('Delete days error:', deleteError)
      }

      // Insert new days
      if (days.length > 0) {
        const daysToInsert = days.map((day: any, index: number) => {
          const dayValidation = daySchema.safeParse({
            dayNumber: day.dayNumber || index + 1,
            date: day.date,
            title: day.title,
          })

          if (!dayValidation.success) {
            throw new Error(
              `Invalid day data: ${dayValidation.error.issues[0].message}`
            )
          }

          return {
            id: day.id || randomUUID(),
            itinerary_id: id,
            day_number: dayValidation.data.dayNumber,
            date: dayValidation.data.date || null,
            title: dayValidation.data.title || null,
            created_at: day.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })

        const { data: insertedDays, error: daysError } = await supabase
          .from('days')
          .insert(daysToInsert)
          .select()

        if (daysError) {
          console.error('Days insert error:', daysError)
        }

        // Handle activities
        if (insertedDays) {
          const activitiesToInsert: any[] = []

          days.forEach((day: any, dayIndex: number) => {
            if (day.activities && Array.isArray(day.activities)) {
              day.activities.forEach((activity: any) => {
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
                    id: activity.id || randomUUID(),
                    day_id: dayId,
                    title: activityValidation.data.title,
                    location: activityValidation.data.location || null,
                    start_time: activityValidation.data.startTime || null,
                    end_time: activityValidation.data.endTime || null,
                    notes: activityValidation.data.notes || null,
                    created_at: activity.created_at || new Date().toISOString(),
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
              console.error('Activities insert error:', activitiesError)
            }
          }
        }
      }
    }

    // Fetch updated itinerary with all relations
    const { data: completeItinerary, error: refetchError } =
      await supabase
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
        .eq('id', id)
        .single()

    if (refetchError) {
      console.error('Refetch error:', refetchError)
      return NextResponse.json(updatedItinerary)
    }

    // Fetch tags
    const { data: updatedTags } = await supabase
      .from('trip_tags')
      .select('tag')
      .eq('itinerary_id', id)

    const response = {
      ...completeItinerary,
      tags: updatedTags?.map(t => t.tag) || [],
    }

    return NextResponse.json(response)
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an itinerary
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if itinerary belongs to user
    const { data: existingItinerary, error: fetchError } = await supabase
      .from('itineraries')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingItinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }

    if (existingItinerary.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you do not own this itinerary' },
        { status: 403 }
      )
    }

    // Delete itinerary (cascade delete via RLS/foreign keys)
    const { error: deleteError } = await supabase
      .from('itineraries')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete itinerary' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
