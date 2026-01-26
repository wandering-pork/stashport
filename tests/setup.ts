import { vi } from 'vitest'

// Mock File class for Node environment
if (typeof globalThis.File === 'undefined') {
  class MockFile extends Blob {
    name: string
    lastModified: number

    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
      super(bits, options)
      this.name = name
      this.lastModified = options?.lastModified ?? Date.now()
    }
  }
  // @ts-ignore
  globalThis.File = MockFile
}

// Mock window.location for share-helpers tests
const mockLocation = {
  origin: 'https://stashport.app',
  href: 'https://stashport.app',
}

// @ts-ignore
globalThis.window = globalThis.window || {}
// @ts-ignore
globalThis.window.location = mockLocation

// Mock navigator for Web Share API tests
const mockNavigator = {
  canShare: vi.fn(),
  share: vi.fn(),
}

// @ts-ignore
globalThis.navigator = mockNavigator
