/**
 * New Project Page
 * 
 * Form for creating a new project
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProject } from '@/lib/api/endpoints'
import { getErrorMessage } from '@/utils/errors'
import { ProjectForm } from '@/components/projects/ProjectForm'
import type { ProjectFormData } from '@/lib/api/types'

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const newProject = await createProject({
        name: data.name,
        location: data.location,
        status: data.status,
      })

      // Redirect to project detail page
      router.push(`/projects/${newProject.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="text-[#001489] hover:underline mb-4 inline-flex items-center gap-2"
          >
            <span>←</span> Voltar para Projetos
          </Link>
          <h1 className="text-3xl font-bold text-[#001489] mb-2 mt-4">
            Novo Projeto
          </h1>
          <p className="text-gray-600">
            Cadastre um novo projeto de fiscalização
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <span className="text-red-600 text-xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">
                  Erro ao criar projeto
                </h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <ProjectForm
            onSubmit={handleSubmit}
            submitLabel="Criar Projeto"
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
