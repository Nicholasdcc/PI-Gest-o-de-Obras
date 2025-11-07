/**
 * IfcUpload Component
 * 
 * Upload IFC file with validation
 */

'use client'

import React, { useState, useRef } from 'react'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import InfoIcon from '@mui/icons-material/Info'

interface IfcUploadProps {
  onUpload: (file: File) => Promise<void>
  isLoading?: boolean
}

export function IfcUpload({ onUpload, isLoading = false }: IfcUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (selectedFile: File): string | null => {
    // Check file extension
    const fileName = selectedFile.name.toLowerCase()
    if (!fileName.endsWith('.ifc')) {
      return 'Formato não suportado. Use arquivo .ifc'
    }

    // Check file size (max 50MB for IFC files)
    const maxSize = 50 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      return 'Arquivo muito grande. Tamanho máximo: 50MB'
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
      return
    }

    setError(null)
    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!file) {
      setError('Por favor, selecione um arquivo IFC')
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

      await onUpload(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Reset form
      setTimeout(() => {
        setFile(null)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo IFC')
    }
  }

  const handleReset = () => {
    setFile(null)
    setError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#001489]">
          Enviar Modelo IFC
        </h3>
        <AccountTreeIcon sx={{ fontSize: 32, color: '#001489' }} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Arquivo IFC
          </label>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ifc"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001489] text-sm"
            />
            {file && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="px-3 py-2 text-gray-600 hover:text-red-600 transition"
              >
                ✕
              </button>
            )}
          </div>
          {file && (
            <p className="text-xs text-gray-600 mt-1">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
        {isLoading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#001489] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">
              Enviando... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isLoading}
          className="w-full bg-[#001489] text-white py-3 rounded-lg font-semibold hover:bg-[#001489]/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Enviando...' : 'Enviar IFC'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800 flex items-start gap-2">
          <InfoIcon sx={{ fontSize: 16, mt: 0.2 }} />
          <span>
            O arquivo IFC será processado após o envio. O tempo de processamento
            depende do tamanho do modelo.
          </span>
        </p>
      </div>
    </div>
  )
}
