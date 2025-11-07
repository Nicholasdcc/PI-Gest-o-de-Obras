/**
 * Evidence List Page
 * 
 * Display all evidences for a project
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProjectEvidences } from '@/hooks/useEvidence'
import { EvidenceCard } from '@/components/evidence/EvidenceCard'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ImageIcon from '@mui/icons-material/Image'

export default function EvidencesPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { evidences, isLoading, error, refetch } = useProjectEvidences(projectId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="text-[#001489] hover:underline mb-4 inline-flex items-center gap-2 font-semibold"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} /> Voltar para Projeto
          </Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-[#001489] mb-2">
                Evidências
              </h1>
              <p className="text-gray-600">
                Todas as evidências deste projeto
              </p>
            </div>
            <Link
              href={`/projects/${projectId}/evidences/upload`}
              className="bg-[#001489] text-white px-6 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold flex items-center gap-2"
            >
              <AddCircleOutlineIcon sx={{ fontSize: 24 }} />
              Enviar Evidência
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001489]"></div>
            <span className="ml-4 text-gray-600">Carregando evidências...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <WarningAmberIcon sx={{ fontSize: 32, color: '#dc2626' }} />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-red-800 font-semibold mb-2">
                  Erro ao carregar evidências
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

        {/* Evidence Grid */}
        {!isLoading && !error && (
          <>
            {evidences.length > 0 && (
              <div className="mb-4 text-sm text-gray-600">
                {evidences.length} evidência{evidences.length !== 1 ? 's' : ''} encontrada
                {evidences.length !== 1 ? 's' : ''}
              </div>
            )}
            
            {evidences.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {evidences.map((evidence) => (
                  <EvidenceCard
                    key={evidence.id}
                    evidence={evidence}
                    projectId={projectId}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
                <ImageIcon sx={{ fontSize: 96, color: '#9ca3af', mb: 2 }} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Nenhuma evidência encontrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece enviando a primeira evidência deste projeto
                </p>
                <Link
                  href={`/projects/${projectId}/evidences/upload`}
                  className="inline-block bg-[#001489] text-white px-6 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold"
                >
                  Enviar Primeira Evidência
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
