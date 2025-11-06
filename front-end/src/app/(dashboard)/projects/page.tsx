/**
 * Projects Listing Page
 * 
 * Display all projects with filtering and search
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useProjects } from '@/hooks/useProjects'
import { ProjectList } from '@/components/projects/ProjectList'

export default function ProjectsPage() {
  const { projects, isLoading, error, refetch } = useProjects()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#001489] mb-2">
              Projetos
            </h1>
            <p className="text-gray-600">
              Gerencie todos os projetos de fiscalização
            </p>
          </div>
          <Link
            href="/projects/new"
            className="bg-[#001489] text-white px-6 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Novo Projeto
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001489]"></div>
            <span className="ml-4 text-gray-600">Carregando projetos...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-red-800 font-semibold mb-2">
                  Erro ao carregar projetos
                </h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        {!isLoading && !error && (
          <>
            {projects.length > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'} encontrado
                {projects.length !== 1 ? 's' : ''}
              </div>
            )}
            <ProjectList projects={projects} />
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && projects.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhum projeto cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro projeto de fiscalização
            </p>
            <Link
              href="/projects/new"
              className="inline-block bg-[#001489] text-white px-6 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold"
            >
              Criar Primeiro Projeto
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
