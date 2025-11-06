/**
 * Evidence Detail Page
 * 
 * View full evidence with analysis results and detected issues
 */

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEvidenceDetail } from '@/hooks/useEvidence'
import { useAnalysis } from '@/hooks/useAnalysis'
import { AnalysisStatus } from '@/components/evidence/AnalysisStatus'
import { IssuesList } from '@/components/issues/IssuesList'
import { formatDate } from '@/utils/formatting'

export default function EvidenceDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const evidenceId = params.evidenceId as string
  const { evidence, isLoading, error, refetch } = useEvidenceDetail(evidenceId)

  // Analysis management
  const {
    status: analysisStatus,
    isTriggering,
    error: analysisError,
    pollingAttempts,
    triggerAnalysis,
    retryAnalysis,
  } = useAnalysis({
    evidenceId,
    initialStatus: evidence?.status || 'pending',
    onAnalysisComplete: (updatedEvidence) => {
      console.log('Analysis completed!', updatedEvidence)
      refetch() // Refresh evidence data
    },
    onAnalysisError: (error) => {
      console.error('Analysis error:', error)
    },
  })

  // Use analysis status if available, otherwise use evidence status
  const currentStatus = analysisStatus || evidence?.status || 'pending'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="text-[#001489] hover:underline mb-4 inline-flex items-center gap-2"
          >
            <span>←</span> Voltar para Projeto
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001489]"></div>
            <span className="ml-4 text-gray-600">Carregando evidência...</span>
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
                  Erro ao carregar evidência
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

        {/* Evidence Content */}
        {evidence && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="relative w-full aspect-[4/3] bg-gray-100">
                  <Image
                    src={evidence.file_url}
                    alt="Evidence"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                
                {/* Image Info */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Enviado em
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {evidence.uploaded_at ? formatDate(evidence.uploaded_at) : 'Data não disponível'}
                      </p>
                    </div>
                    <AnalysisStatus status={evidence.status} />
                  </div>
                  
                  {evidence.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Descrição</p>
                      <p className="text-gray-900">{evidence.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Analysis Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-[#001489] mb-4">
                  Resumo da Análise
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Status</span>
                    <AnalysisStatus status={currentStatus} />
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Problemas Detectados</span>
                    <span className="text-2xl font-bold text-[#001489]">
                      {evidence.issues_count || 0}
                    </span>
                  </div>
                  
                  {evidence.analyzed_at && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600">Analisado em</span>
                      <span className="text-sm text-gray-900">
                        {formatDate(evidence.analyzed_at)}
                      </span>
                    </div>
                  )}

                  {/* Polling Status */}
                  {currentStatus === 'processing' && pollingAttempts > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Verificações:</span>
                        <span className="font-semibold">{pollingAttempts}/60</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${(pollingAttempts / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Trigger Analysis Button */}
                {currentStatus === 'pending' && (
                  <button
                    onClick={triggerAnalysis}
                    disabled={isTriggering}
                    className="mt-6 w-full bg-[#001489] text-white px-4 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isTriggering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🔍</span>
                        Analisar Evidência
                      </>
                    )}
                  </button>
                )}

                {/* Retry Button for Errors */}
                {currentStatus === 'error' && (
                  <button
                    onClick={retryAnalysis}
                    disabled={isTriggering}
                    className="mt-6 w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isTriggering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Tentando...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🔄</span>
                        Tentar Novamente
                      </>
                    )}
                  </button>
                )}

                {/* Analysis Error Display */}
                {analysisError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">{analysisError}</p>
                  </div>
                )}
              </div>

              {/* Issues List */}
              {evidence.issues && evidence.issues.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h2 className="text-lg font-bold text-[#001489] mb-4">
                    Problemas Identificados
                  </h2>
                  <IssuesList issues={evidence.issues} showLocation={true} />
                </div>
              )}

              {/* No Issues */}
              {currentStatus === 'completed' && 
               (!evidence.issues || evidence.issues.length === 0) && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">✓</span>
                    <h3 className="text-green-900 font-semibold mb-2">
                      Nenhum Problema Detectado
                    </h3>
                    <p className="text-green-700 text-sm">
                      A análise não identificou problemas nesta evidência
                    </p>
                  </div>
                </div>
              )}

              {/* Pending Analysis */}
              {evidence.status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">⏳</span>
                    <h3 className="text-blue-900 font-semibold mb-2">
                      Aguardando Análise
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Esta evidência ainda não foi analisada
                    </p>
                    <button
                      onClick={triggerAnalysis}
                      disabled={isTriggering}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTriggering ? 'Iniciando...' : 'Analisar Agora'}
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Analysis */}
              {evidence.status === 'processing' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-3"></div>
                    <h3 className="text-yellow-900 font-semibold mb-2">
                      Análise em Andamento
                    </h3>
                    <p className="text-yellow-700 text-sm mb-2">
                      A análise está sendo processada...
                    </p>
                    {pollingAttempts > 0 && (
                      <p className="text-yellow-600 text-xs">
                        Verificação {pollingAttempts} de 60
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error State */}
              {evidence.status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">⚠️</span>
                    <h3 className="text-red-900 font-semibold mb-2">
                      Erro na Análise
                    </h3>
                    <p className="text-red-700 text-sm mb-4">
                      {analysisError || 'Ocorreu um erro ao processar a análise'}
                    </p>
                    <button
                      onClick={retryAnalysis}
                      disabled={isTriggering}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTriggering ? 'Tentando...' : 'Tentar novamente'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
