'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface CoverUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function CoverUpload({ value, onChange, disabled = false }: CoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log('[Component] CoverUpload - Render:', { hasValue: !!value, isUploading })

  const handleFileSelect = async (file: File) => {
    console.log('[Component] CoverUpload - File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    setUploadError(null)

    // Validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a JPG, PNG, or WebP image')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)

    try {
      // Upload to Supabase Storage
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/cover', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const { url } = await response.json()
      console.log('[Component] CoverUpload - Upload success:', { url })
      onChange(url)
    } catch (err: any) {
      console.error('[Component] CoverUpload - Upload error:', err)
      setUploadError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isUploading) {
      setDragActive(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    console.log('[Component] CoverUpload - Image removed')
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-heading font-medium text-gray-700">
        Cover Photo (Optional)
      </label>

      {value ? (
        // Preview with remove button
        <Card variant="default" className="relative overflow-hidden">
          <CardContent padding="compact">
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
              <img
                src={value}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="danger"
                size="sm"
                iconOnly
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="absolute top-2 right-2"
                aria-label="Remove cover photo"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Upload area
        <Card
          variant="default"
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            dragActive && 'border-primary-500 bg-primary-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          aria-label="Upload cover photo"
          aria-describedby="upload-requirements"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click()
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          <CardContent padding="relaxed">
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isUploading ? 'Uploading...' : 'Drop image here or click to browse'}
              </p>
              <p className="text-xs text-gray-500" id="upload-requirements">
                Recommended: 1920×1080px (16:9) • JPG, PNG, WebP • Max 5MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadError && (
        <p className="text-sm text-red-600" role="alert">
          {uploadError}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        disabled={disabled || isUploading}
        className="hidden"
      />
    </div>
  )
}
