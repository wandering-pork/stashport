/**
 * Share helpers for Web Share API integration
 */

import { TemplateFormat } from '@/lib/constants/templates'

/**
 * Check if the Web Share API is supported in the current browser
 */
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false
  return 'canShare' in navigator && typeof navigator.canShare === 'function'
}

/**
 * Create a File object from a Blob for sharing
 */
export function createShareFile(
  blob: Blob,
  filename: string,
  mimeType: string = 'image/png'
): File {
  return new File([blob], filename, {
    type: mimeType,
    lastModified: Date.now(),
  })
}

/**
 * Build share data with image, title, and text caption
 */
export function buildShareData(
  file: File,
  tripTitle: string,
  tripSlug: string
): ShareData {
  const tripUrl = `${window.location.origin}/t/${tripSlug}`

  return {
    files: [file],
    title: tripTitle,
    text: `Check out my trip: ${tripTitle} on Stashport!\n\n${tripUrl}`,
  }
}

/**
 * Attempt to share using the Web Share API
 * Returns true if share was initiated, false if cancelled or unsupported
 */
export async function shareImage(
  blob: Blob,
  tripTitle: string,
  tripSlug: string,
  format: TemplateFormat
): Promise<boolean> {
  console.log('[Share] Attempting Web Share API')

  // Check if Web Share is supported
  if (!canShareFiles()) {
    console.log('[Share] Web Share API not supported')
    return false
  }

  try {
    // Create file from blob
    const filename = `${tripSlug}-${format}.png`
    const file = createShareFile(blob, filename)

    // Build share data
    const shareData = buildShareData(file, tripTitle, tripSlug)

    // Check if this specific data can be shared
    if (!navigator.canShare(shareData)) {
      console.log('[Share] This data cannot be shared')
      return false
    }

    // Trigger native share sheet
    await navigator.share(shareData)
    console.log('[Share] Share successful or in progress')
    return true
  } catch (err: any) {
    // User cancelled the share - not an error
    if (err.name === 'AbortError') {
      console.log('[Share] User cancelled share')
      return false
    }

    // Actual error
    console.error('[Share] Share failed:', err)
    throw err
  }
}
