import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateImage, buildTemplateHTML } from '@/lib/utils/image-generator'
import { TemplateStyle, TemplateFormat } from '@/lib/constants/templates'

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/share/generate - Request received')

  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[API] POST /api/share/generate - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itineraryId, style, format } = body

    console.log('[API] POST /api/share/generate - Parameters:', {
      itineraryId,
      style,
      format,
      userId: user.id,
    })

    if (!itineraryId || !style || !format) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch itinerary with days and activities
    const { data: itinerary, error: itineraryError } = await supabase
      .from('itineraries')
      .select(
        `
        *,
        days (
          *,
          activities (*)
        )
      `
      )
      .eq('id', itineraryId)
      .single()

    if (itineraryError || !itinerary) {
      console.error('[API] POST /api/share/generate - Itinerary not found:', itineraryError)
      return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
    }

    // Verify ownership or public access
    if (itinerary.user_id !== user.id && !itinerary.is_public) {
      console.error('[API] POST /api/share/generate - Access denied')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate stats
    const dayCount = itinerary.days?.length || 0
    const activityCount =
      itinerary.days?.reduce(
        (sum: number, day: any) => sum + (day.activities?.length || 0),
        0
      ) || 0

    const templateData = {
      title: itinerary.title,
      destination: itinerary.destination || undefined,
      coverPhotoUrl: itinerary.cover_photo_url || undefined,
      dayCount: dayCount > 0 ? dayCount : undefined,
      activityCount: activityCount > 0 ? activityCount : undefined,
    }

    console.log('[API] POST /api/share/generate - Template data:', templateData)

    // Build HTML
    const html = buildTemplateHTML(
      style as TemplateStyle,
      format as TemplateFormat,
      templateData
    )

    // Generate image
    const imageBuffer = await generateImage({
      html,
      format: format as TemplateFormat,
    })

    console.log('[API] POST /api/share/generate - Image generated:', {
      size: imageBuffer.length,
    })

    // Return image - convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${itinerary.slug}-${format}.png"`,
      },
    })
  } catch (err) {
    console.error('[API] POST /api/share/generate - Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
