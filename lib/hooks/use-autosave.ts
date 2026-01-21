'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface AutosaveOptions {
  /** Unique key for localStorage draft storage */
  storageKey: string
  /** Delay in ms before autosave triggers (default: 2000) */
  debounceMs?: number
  /** Whether to sync to server (requires itineraryId) */
  syncToServer?: boolean
  /** Itinerary ID for server sync (edit mode) */
  itineraryId?: string
  /** Callback when data changes */
  onDataChange?: (data: any) => void
}

interface AutosaveReturn<T> {
  /** Current save status */
  status: SaveStatus
  /** Error message if status is 'error' */
  error: string | null
  /** Last saved timestamp */
  lastSaved: Date | null
  /** Trigger save manually */
  saveNow: () => Promise<void>
  /** Clear draft from storage */
  clearDraft: () => void
  /** Load draft from storage */
  loadDraft: () => T | null
  /** Update data and trigger debounced autosave */
  updateData: (data: T) => void
}

export function useAutosave<T extends object>(
  options: AutosaveOptions
): AutosaveReturn<T> {
  const {
    storageKey,
    debounceMs = 2000,
    syncToServer = false,
    itineraryId,
  } = options

  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const dataRef = useRef<T | null>(null)
  const isOnlineRef = useRef(true)

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true
      if (status === 'offline') {
        setStatus('idle')
      }
    }
    const handleOffline = () => {
      isOnlineRef.current = false
      setStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    isOnlineRef.current = navigator.onLine

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [status])

  // Save to localStorage
  const saveToStorage = useCallback((data: T) => {
    try {
      const draft = {
        data,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(storageKey, JSON.stringify(draft))
      return true
    } catch (err) {
      console.error('Failed to save to localStorage:', err)
      return false
    }
  }, [storageKey])

  // Save to server (for existing itineraries)
  const saveToServer = useCallback(async (data: T): Promise<boolean> => {
    if (!syncToServer || !itineraryId) return true

    try {
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      return true
    } catch (err: any) {
      console.error('Failed to save to server:', err)
      throw err
    }
  }, [syncToServer, itineraryId])

  // Main save function
  const performSave = useCallback(async () => {
    if (!dataRef.current) return

    setStatus('saving')
    setError(null)

    try {
      // Always save to localStorage first
      saveToStorage(dataRef.current)

      // If online and server sync enabled, save to server
      if (isOnlineRef.current && syncToServer && itineraryId) {
        await saveToServer(dataRef.current)
      }

      setStatus('saved')
      setLastSaved(new Date())

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setStatus((current) => (current === 'saved' ? 'idle' : current))
      }, 2000)
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'Save failed')
    }
  }, [saveToStorage, saveToServer, syncToServer, itineraryId])

  // Debounced save
  const debouncedSave = useDebouncedCallback(performSave, debounceMs)

  // Cleanup debounced save on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  // Update data and trigger autosave
  const updateData = useCallback((data: T) => {
    dataRef.current = data
    debouncedSave()
  }, [debouncedSave])

  // Save immediately
  const saveNow = useCallback(async () => {
    debouncedSave.cancel()
    await performSave()
  }, [debouncedSave, performSave])

  // Clear draft from storage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch (err) {
      console.error('Failed to clear draft:', err)
    }
  }, [storageKey])

  // Load draft from storage
  const loadDraft = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null

      const draft = JSON.parse(stored)

      // Check if draft is recent (within 24 hours)
      const timestamp = new Date(draft.timestamp)
      const now = new Date()
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        // Draft is stale, remove it
        localStorage.removeItem(storageKey)
        return null
      }

      return draft.data as T
    } catch (err) {
      console.error('Failed to load draft:', err)
      return null
    }
  }, [storageKey])

  return {
    status,
    error,
    lastSaved,
    saveNow,
    clearDraft,
    loadDraft,
    updateData,
  }
}
