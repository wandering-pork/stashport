import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { itinerarySchema, daySchema, activitySchema, categorySchema, categoryItemSchema } from '@/lib/utils/validation'
import { randomUUID } from 'crypto'

// GET - Fetch a single itinerary
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[API] GET /api/itineraries/[id] - Request received:', { id })

    const supabase = await createServerClient()

    const { data: itinerary, error } = await supabase
      .from('itineraries')
      .select(
        `
        *,
        days(
          *,
          activities(*)
        ),
        categories(
          *,
          category_items(*)
        )
      `
      )
      .eq('id', id)
      .single()

    if (error || !itinerary) {
      console.error('[API] GET /api/itineraries/[id] - Not found:', { id, error })
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      )
    }

    // Authorization check for private itineraries
    const { data: { user } } = await supabase.auth.getUser()

    // Allow access if: itinerary is public OR user owns it
    if (!itinerary.is_public && (!user || itinerary.user_id !== user.id)) {
      console.log('[API] GET /api/itineraries/[id] - Forbidden: private itinerary, not owner')
      return NextResponse.json(
        { error: 'Forbidden - you do not have access to this itinerary' },
        { status: 403 }
      )
    }

    // Sort categories and their items by sort_order
    const sortedCategories = itinerary.categories
      ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((cat: any) => ({
        ...cat,
        items: cat.category_items?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
      })) || []

    const response = {
      ...itinerary,
      categories: sortedCategories,
    }

    console.log('[API] GET /api/itineraries/[id] - Success:', {
      id: response.id,
      slug: response.slug,
      type: response.type,
      daysCount: response.days?.length || 0,
      categoriesCount: response.categories?.length || 0,
    })

    return NextResponse.json(response)
  } catch (err) {
    console.error('[API] GET /api/itineraries/[id] - Unexpected error:', err)
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
    console.log('[API] PUT /api/itineraries/[id] - Request received:', { id })

    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[API] PUT /api/itineraries/[id] - Unauthorized')
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
      console.error('[API] PUT /api/itineraries/[id] - Forbidden:', { id, userId: user.id })
      return NextResponse.json(
        { error: 'Forbidden - you do not own this itinerary' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, destination, isPublic, days, tags, budgetLevel } = body

    console.log('[API] PUT /api/itineraries/[id] - Payload:', {
      id,
      title,
      daysCount: days?.length || 0,
      tagsCount: tags?.length || 0,
      type: body.type,
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
        type: body.type,
        cover_photo_url: body.cover_photo_url,
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

    // Handle content based on itinerary type
    const itineraryType = body.type || 'daily'
    const sections = body.sections || body.categories

    if (itineraryType === 'guide' && sections && Array.isArray(sections)) {
      // Guide type: Update categories and category items

      // Delete existing categories (cascade deletes category_items)
      const { error: deleteCategoriesError } = await supabase
        .from('categories')
        .delete()
        .eq('itinerary_id', id)

      if (deleteCategoriesError) {
        console.error('Delete categories error:', deleteCategoriesError)
      }

      // Insert new categories
      if (sections.length > 0) {
        const categoriesToInsert = sections.map((section: any, index: number) => {
          const categoryValidation = categorySchema.safeParse({
            name: section.name || section.title,
            icon: section.icon || '📍',
            sortOrder: section.sortOrder ?? index,
          })

          if (!categoryValidation.success) {
            throw new Error(
              `Invalid section data: ${categoryValidation.error.issues[0].message}`
            )
          }

          return {
            id: section.id || randomUUID(),
            itinerary_id: id,
            name: categoryValidation.data.name,
            icon: categoryValidation.data.icon,
            sort_order: categoryValidation.data.sortOrder,
            created_at: section.created_at || new Date().toISOString(),
          }
        })

        const { data: insertedCategories, error: categoriesError } = await supabase
          .from('categories')
          .insert(categoriesToInsert)
          .select()

        if (categoriesError) {
          console.error('Categories insert error:', categoriesError)
        }

        // Handle category items
        if (insertedCategories) {
          const itemsToInsert: any[] = []

          sections.forEach((section: any, sectionIndex: number) => {
            const items = section.items || []
            if (items && Array.isArray(items)) {
              items.forEach((item: any, itemIndex: number) => {
                const itemValidation = categoryItemSchema.safeParse({
                  title: item.title,
                  location: item.location,
                  notes: item.notes,
                  sortOrder: item.sortOrder ?? itemIndex,
                })

                if (!itemValidation.success) {
                  throw new Error(
                    `Invalid item data: ${itemValidation.error.issues[0].message}`
                  )
                }

                const categoryId = insertedCategories[sectionIndex]?.id
                if (categoryId) {
                  itemsToInsert.push({
                    id: item.id || randomUUID(),
                    category_id: categoryId,
                    title: itemValidation.data.title,
                    location: itemValidation.data.location || null,
                    notes: itemValidation.data.notes || null,
                    sort_order: itemValidation.data.sortOrder,
                    created_at: item.created_at || new Date().toISOString(),
                  })
                }
              })
            }
          })

          if (itemsToInsert.length > 0) {
            const { error: itemsError } = await supabase
              .from('category_items')
              .insert(itemsToInsert)

            if (itemsError) {
              console.error('Category items insert error:', itemsError)
            }
          }
        }
      }
    } else if (days && Array.isArray(days)) {
      // Daily type: Update days and activities

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
        ),
        categories(
          *,
          category_items(*)
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

    // Sort categories and their items by sort_order
    const sortedCategories = completeItinerary.categories
      ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((cat: any) => ({
        ...cat,
        items: cat.category_items?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [],
      })) || []

    const response = {
      ...completeItinerary,
      tags: updatedTags?.map(t => t.tag) || [],
      categories: sortedCategories,
    }

    console.log('[API] PUT /api/itineraries/[id] - Success:', {
      id: response.id,
      daysUpdated: response.days?.length || 0
    })

    return NextResponse.json(response)
  } catch (err: any) {
    console.error('[API] PUT /api/itineraries/[id] - Unexpected error:', err)
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
    console.log('[API] DELETE /api/itineraries/[id] - Request received:', { id })

    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[API] DELETE /api/itineraries/[id] - Unauthorized')
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
      console.error('[API] DELETE /api/itineraries/[id] - Forbidden:', { id, userId: user.id })
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
      console.error('[API] DELETE /api/itineraries/[id] - Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete itinerary' },
        { status: 500 }
      )
    }

    console.log('[API] DELETE /api/itineraries/[id] - Success:', { id })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API] DELETE /api/itineraries/[id] - Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
