/**
 * Unit tests for share-helpers utility functions
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  canShareFiles,
  createShareFile,
  buildShareData,
  shareImage,
} from '@/lib/utils/share-helpers'

describe('canShareFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns false when navigator is undefined', () => {
    const originalNavigator = global.navigator
    // @ts-ignore - testing undefined case
    delete global.navigator

    // Re-import to test with undefined navigator
    // Note: This test may need adjustment based on module caching
    expect(canShareFiles()).toBe(false)

    // Restore
    global.navigator = originalNavigator
  })

  it('returns false when canShare is not available', () => {
    Object.defineProperty(navigator, 'canShare', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    expect(canShareFiles()).toBe(false)
  })

  it('returns true when canShare is a function', () => {
    Object.defineProperty(navigator, 'canShare', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
    expect(canShareFiles()).toBe(true)
  })
})

describe('createShareFile', () => {
  it('creates a File object from Blob', () => {
    const blob = new Blob(['test content'], { type: 'image/png' })
    const file = createShareFile(blob, 'test.png')

    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('test.png')
    expect(file.type).toBe('image/png')
  })

  it('uses custom mime type when provided', () => {
    const blob = new Blob(['test content'])
    const file = createShareFile(blob, 'test.jpg', 'image/jpeg')

    expect(file.type).toBe('image/jpeg')
  })

  it('sets lastModified to current time', () => {
    const before = Date.now()
    const blob = new Blob(['test'])
    const file = createShareFile(blob, 'test.png')
    const after = Date.now()

    expect(file.lastModified).toBeGreaterThanOrEqual(before)
    expect(file.lastModified).toBeLessThanOrEqual(after)
  })
})

describe('buildShareData', () => {
  beforeEach(() => {
    // Ensure window.location.origin is set
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://stashport.app' },
      writable: true,
    })
  })

  it('builds ShareData with file, title, and text', () => {
    const blob = new Blob(['test'])
    const file = new File([blob], 'test.png', { type: 'image/png' })

    const shareData = buildShareData(file, 'My Tokyo Trip', 'my-tokyo-trip')

    expect(shareData.files).toHaveLength(1)
    expect(shareData.files![0]).toBe(file)
    expect(shareData.title).toBe('My Tokyo Trip')
    expect(shareData.text).toContain('Check out my trip: My Tokyo Trip')
    expect(shareData.text).toContain('https://stashport.app/t/my-tokyo-trip')
  })

  it('generates correct trip URL', () => {
    const file = new File([''], 'test.png', { type: 'image/png' })
    const shareData = buildShareData(file, 'Test', 'test-slug-123')

    expect(shareData.text).toContain('/t/test-slug-123')
  })
})

describe('shareImage', () => {
  const mockBlob = new Blob(['test image data'], { type: 'image/png' })

  beforeEach(() => {
    vi.resetAllMocks()

    // Set up window.location
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://stashport.app' },
      writable: true,
    })
  })

  it('returns false when Web Share API is not supported', async () => {
    Object.defineProperty(navigator, 'canShare', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const result = await shareImage(mockBlob, 'Test Trip', 'test-trip', 'story')
    expect(result).toBe(false)
  })

  it('returns false when data cannot be shared', async () => {
    const canShareMock = vi.fn().mockReturnValue(false)
    Object.defineProperty(navigator, 'canShare', {
      value: canShareMock,
      writable: true,
      configurable: true,
    })

    const result = await shareImage(mockBlob, 'Test Trip', 'test-trip', 'story')
    expect(result).toBe(false)
    expect(canShareMock).toHaveBeenCalled()
  })

  it('calls navigator.share with correct data', async () => {
    const canShareMock = vi.fn().mockReturnValue(true)
    const shareMock = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'canShare', {
      value: canShareMock,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      writable: true,
      configurable: true,
    })

    const result = await shareImage(mockBlob, 'Tokyo Trip', 'tokyo-trip', 'square')

    expect(result).toBe(true)
    expect(shareMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Tokyo Trip',
        text: expect.stringContaining('Tokyo Trip'),
        files: expect.arrayContaining([
          expect.objectContaining({
            name: 'tokyo-trip-square.png',
          }),
        ]),
      })
    )
  })

  it('returns false when user cancels share (AbortError)', async () => {
    const canShareMock = vi.fn().mockReturnValue(true)
    const abortError = new Error('User cancelled')
    abortError.name = 'AbortError'
    const shareMock = vi.fn().mockRejectedValue(abortError)

    Object.defineProperty(navigator, 'canShare', {
      value: canShareMock,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      writable: true,
      configurable: true,
    })

    const result = await shareImage(mockBlob, 'Test Trip', 'test-trip', 'story')

    expect(result).toBe(false)
  })

  it('throws on actual share errors', async () => {
    const canShareMock = vi.fn().mockReturnValue(true)
    const shareMock = vi.fn().mockRejectedValue(new Error('Network error'))

    Object.defineProperty(navigator, 'canShare', {
      value: canShareMock,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      writable: true,
      configurable: true,
    })

    await expect(
      shareImage(mockBlob, 'Test Trip', 'test-trip', 'story')
    ).rejects.toThrow('Network error')
  })

  it('generates correct filename for each format', async () => {
    const canShareMock = vi.fn().mockReturnValue(true)
    const shareMock = vi.fn().mockResolvedValue(undefined)

    Object.defineProperty(navigator, 'canShare', {
      value: canShareMock,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      writable: true,
      configurable: true,
    })

    // Test each format
    const formats = ['story', 'square', 'portrait'] as const
    for (const format of formats) {
      shareMock.mockClear()
      await shareImage(mockBlob, 'Test', 'test-slug', format)

      expect(shareMock).toHaveBeenCalledWith(
        expect.objectContaining({
          files: expect.arrayContaining([
            expect.objectContaining({
              name: `test-slug-${format}.png`,
            }),
          ]),
        })
      )
    }
  })
})
