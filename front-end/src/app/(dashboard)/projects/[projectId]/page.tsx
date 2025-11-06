/**
 * Project Detail Page
 * 
 * Display project details with evidence list and issue summary
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProjectDetail } from '@/hooks/useProjects'
import { formatDate, formatProjectStatus, formatAnalysisStatus } from '@/utils/formatting'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { project, isLoading, error, refetch } = useProjectDetail(projectId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001489]"></div>
            <span className="ml-4 text-gray-600">Carregando projeto...</span>
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
                  Erro ao carregar projeto
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

        {/* Project Details */}
        {project && !isLoading && !error && (
          <>
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/projects"
                className="text-[#001489] hover:underline mb-4 inline-flex items-center gap-2"
              >
                <span>←</span> Voltar para Projetos
              </Link>
              <div className="flex items-start justify-between mt-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[#001489] mb-2">
                    {project.name}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>📍</span>
                    {project.location}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-800'
                      : project.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formatProjectStatus(project.status)}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Evidências
                  </h3>
                  <span className="text-2xl">📸</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {project.evidence_count || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Problemas Detectados
                  </h3>
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  {project.issues_count || 0}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Criado em
                  </h3>
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {formatDate(project.created_at)}
                </p>
              </div>
            </div>

            {/* Evidence List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#001489]">
                  Evidências ({project.evidences?.length || 0})
                </h2>
                <div className="flex gap-2">
                  {project.evidences && project.evidences.length > 0 && (
                    <Link
                      href={`/projects/${projectId}/evidences`}
                      className="text-[#001489] px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-semibold"
                    >
                      Ver Todas
                    </Link>
                  )}
                  <Link
                    href={`/projects/${projectId}/evidences/upload`}
                    className="bg-[#001489] text-white px-4 py-2 rounded-lg hover:bg-[#001489]/90 transition text-sm font-semibold"
                  >
                    Enviar Evidência
                  </Link>
                </div>
              </div>

              {project.evidences && project.evidences.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {project.evidences.map((evidence) => (
                    <Link
                      key={evidence.id}
                      href={`/projects/${projectId}/evidences/${evidence.id}`}
                      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#001489] transition cursor-pointer"
                    >
                      {evidence.thumbnail_url ? (
                        <img
                          src={evidence.thumbnail_url}
                          alt="Evidence thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-4xl">📷</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="text-center text-white">
                          <p className="text-xs font-semibold">
                            {formatAnalysisStatus(evidence.status)}
                          </p>
                          {evidence.issues_count > 0 && (
                            <p className="text-xs mt-1">
                              {evidence.issues_count} problema
                              {evidence.issues_count !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                          evidence.status === 'completed'
                            ? 'bg-green-500'
                            : evidence.status === 'processing'
                            ? 'bg-blue-500 animate-pulse'
                            : evidence.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-5xl mb-3">📷</div>
                  <p className="mb-4">Nenhuma evidência enviada ainda</p>
                  <Link
                    href={`/projects/${projectId}/evidences/upload`}
                    className="inline-block bg-[#001489] text-white px-4 py-2 rounded-lg hover:bg-[#001489]/90 transition text-sm font-semibold"
                  >
                    Enviar Primeira Evidência
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                href={`/reports/${projectId}`}
                className="flex-1 bg-white border-2 border-[#001489] text-[#001489] px-6 py-3 rounded-lg hover:bg-[#001489] hover:text-white transition font-semibold text-center"
              >
                Ver Relatório
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
