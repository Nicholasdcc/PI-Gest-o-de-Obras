/**
 * EvidenceUpload Component
 * 
 * File upload component with validation and preview
 */

'use client'

import React, { useState, useRef } from 'react'
import { FILE_UPLOAD_CONSTRAINTS } from '@/lib/api/types'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CameraAltIcon from '@mui/icons-material/CameraAlt'

interface EvidenceUploadProps {
  onUpload: (file: File, description: string) => Promise<void>
  isLoading?: boolean
}

export function EvidenceUpload({ onUpload, isLoading = false }: EvidenceUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (selectedFile: File): string | null => {
    // Check file type
    if (!FILE_UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(selectedFile.type as any)) {
      return 'Formato não suportado. Use JPEG, PNG ou WEBP.'
    }

    // Check file size
    if (selectedFile.size > FILE_UPLOAD_CONSTRAINTS.MAX_SIZE_BYTES) {
      const maxSizeMB = FILE_UPLOAD_CONSTRAINTS.MAX_SIZE_BYTES / (1024 * 1024)
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
    }

    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      setFile(null)
      setPreview(null)
      return
    }

    setError(null)
    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!file) {
      setError('Por favor, selecione uma imagem')
      return
    }

    if (description.length > FILE_UPLOAD_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
      setError(`Descrição muito longa. Máximo: ${FILE_UPLOAD_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} caracteres`)
      return
    }

    try {
      setUploadProgress(0)
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await onUpload(file, description)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form
      setTimeout(() => {
        setFile(null)
        setPreview(null)
        setDescription('')
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)
    } catch (err) {
      setUploadProgress(0)
      // Error is handled by parent component
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setDescription('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Selecionar Imagem *
        </label>
        
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_UPLOAD_CONSTRAINTS.ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            disabled={isLoading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex-1 flex items-center justify-center px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
              file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-[#001489] bg-gray-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <span className="text-3xl mb-2 block">
                {file ? <CheckCircleIcon sx={{ fontSize: 48 }} /> : <CameraAltIcon sx={{ fontSize: 48 }} />}
              </span>
              <p className="text-sm font-semibold text-gray-700">
                {file ? file.name : 'Clique para selecionar'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG ou WEBP (máx. 10MB)
              </p>
            </div>
          </label>
          
          {file && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
            >
              Remover
            </button>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pré-visualização
          </label>
          <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain bg-gray-50"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          Descrição (opcional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001489] transition resize-none placeholder:text-gray-500"
          placeholder="Ex: Rachadura na parede do corredor principal"
          disabled={isLoading}
          rows={3}
          maxLength={FILE_UPLOAD_CONSTRAINTS.MAX_DESCRIPTION_LENGTH}
        />
        <p className="text-gray-500 text-xs mt-1">
          {description.length}/{FILE_UPLOAD_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} caracteres
        </p>
      </div>

      {/* Upload Progress */}
      {isLoading && uploadProgress > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Enviando...</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#001489] h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!file || isLoading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
          !file || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#001489] hover:bg-[#001489]/90'
        }`}
      >
        {isLoading ? 'Enviando...' : 'Enviar Evidência'}
      </button>
    </form>
  )
}
