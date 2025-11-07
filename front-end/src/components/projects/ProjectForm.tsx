/**
 * ProjectForm Component
 * 
 * Form for creating/editing projects with validation
 */

'use client'

import React, { useState } from 'react'
import { PROJECT_CONSTRAINTS } from '@/lib/api/types'
import type { ProjectFormData, ProjectStatus } from '@/lib/api/types'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ArchiveIcon from '@mui/icons-material/Archive'

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  onSubmit: (data: ProjectFormData) => Promise<void>
  submitLabel?: string
  isLoading?: boolean
}

export function ProjectForm({
  initialData = {},
  onSubmit,
  submitLabel = 'Criar Projeto',
  isLoading = false,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData.name || '',
    location: initialData.location || '',
    status: initialData.status || 'active',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do projeto é obrigatório'
    } else if (formData.name.length < PROJECT_CONSTRAINTS.NAME_MIN_LENGTH) {
      newErrors.name = `Nome deve ter no mínimo ${PROJECT_CONSTRAINTS.NAME_MIN_LENGTH} caracteres`
    } else if (formData.name.length > PROJECT_CONSTRAINTS.NAME_MAX_LENGTH) {
      newErrors.name = `Nome deve ter no máximo ${PROJECT_CONSTRAINTS.NAME_MAX_LENGTH} caracteres`
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = 'Localização é obrigatória'
    } else if (formData.location.length < PROJECT_CONSTRAINTS.LOCATION_MIN_LENGTH) {
      newErrors.location = `Localização deve ter no mínimo ${PROJECT_CONSTRAINTS.LOCATION_MIN_LENGTH} caracteres`
    } else if (formData.location.length > PROJECT_CONSTRAINTS.LOCATION_MAX_LENGTH) {
      newErrors.location = `Localização deve ter no máximo ${PROJECT_CONSTRAINTS.LOCATION_MAX_LENGTH} caracteres`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await onSubmit(formData)
  }

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Nome do Projeto *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition placeholder:text-gray-500 ${
            errors.name
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-[#001489]'
          }`}
          placeholder="Ex: Estação Vila Prudente - Reforma"
          disabled={isLoading}
          maxLength={PROJECT_CONSTRAINTS.NAME_MAX_LENGTH}
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          {formData.name.length}/{PROJECT_CONSTRAINTS.NAME_MAX_LENGTH} caracteres
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
          Localização *
        </label>
        <textarea
          id="location"
          value={formData.location}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('location', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none placeholder:text-gray-500 ${
            errors.location
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-[#001489]'
          }`}
          placeholder="Ex: Av. Prof. Luiz Ignácio Anhaia Mello, 3000"
          disabled={isLoading}
          rows={3}
          maxLength={PROJECT_CONSTRAINTS.LOCATION_MAX_LENGTH}
        />
        {errors.location && (
          <p className="text-red-600 text-sm mt-1">{errors.location}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          {formData.location.length}/{PROJECT_CONSTRAINTS.LOCATION_MAX_LENGTH} caracteres
        </p>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('status', e.target.value as ProjectStatus)}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001489] transition font-semibold ${
            formData.status === 'active' 
              ? 'bg-emerald-50 text-emerald-800' 
              : formData.status === 'paused'
              ? 'bg-amber-50 text-amber-800'
              : formData.status === 'completed'
              ? 'bg-blue-50 text-blue-800'
              : 'bg-slate-50 text-slate-700'
          }`}
          disabled={isLoading}
        >
          <option value="active" className="bg-emerald-50 text-emerald-800 font-semibold">Ativo</option>
          <option value="paused" className="bg-amber-50 text-amber-800 font-semibold">Pausado</option>
          <option value="completed" className="bg-blue-50 text-blue-800 font-semibold">Concluído</option>
          <option value="archived" className="bg-slate-50 text-slate-700 font-semibold">Arquivado</option>
        </select>
        
        {/* Status Icons Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1 text-emerald-700">
            <CheckCircleIcon sx={{ fontSize: 16 }} />
            <span>Ativo</span>
          </div>
          <div className="flex items-center gap-1 text-amber-700">
            <PauseCircleIcon sx={{ fontSize: 16 }} />
            <span>Pausado</span>
          </div>
          <div className="flex items-center gap-1 text-blue-700">
            <TaskAltIcon sx={{ fontSize: 16 }} />
            <span>Concluído</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <ArchiveIcon sx={{ fontSize: 16 }} />
            <span>Arquivado</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#001489] hover:bg-[#001489]/90'
          }`}
        >
          {isLoading ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
