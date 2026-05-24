'use client'
import { useState, useRef } from 'react'
import { getToken } from '@/lib/auth-client'

interface PhotoUploadProps {
  onUploaded: (url: string) => void
  disabled?: boolean
}

export default function PhotoUpload({ onUploaded, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Tampilkan preview lokal
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setError('')
    setUploading(true)

    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Upload gagal')
      }

      const { url } = await res.json()
      onUploaded(url)
    } catch (err: any) {
      setError(err.message)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {preview ? (
        <div className="relative w-full aspect-square">
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-cover rounded-lg border"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
              <span className="text-white text-xs">Mengupload...</span>
            </div>
          )}
          {!uploading && (
            <button
              onClick={() => {
                setPreview(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded"
            >
              Ganti
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition disabled:opacity-50"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm text-gray-500">Klik untuk pilih foto</span>
          <span className="text-xs text-gray-400">JPG, PNG, WebP • Maks 5MB</span>
        </button>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}