/**
 * Reports Page
 * 
 * Generate and view inspection reports for a project
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProjectDetail } from '@/hooks/useProjects'
import { generateReport, getLatestReport } from '@/lib/api/endpoints'
import { ReportFormat } from '@/lib/api/types'
import { formatDate } from '@/utils/formatting'

export default function ReportsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { project, isLoading: projectLoading } = useProjectDetail(projectId)
  
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [latestReport, setLatestReport] = useState<any>(null)
  const [isLoadingReport, setIsLoadingReport] = useState(true)

  // Load latest report on mount
  React.useEffect(() => {
    loadLatestReport()
  }, [projectId])

  const loadLatestReport = async () => {
    setIsLoadingReport(true)
    try {
      const report = await getLatestReport(projectId)
      setLatestReport(report)
    } catch (error) {
      // No report available yet
      setLatestReport(null)
    } finally {
      setIsLoadingReport(false)
    }
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    setGenerationError(null)

    try {
      await generateReport(projectId, selectedFormat)
      
      // Poll for report completion (simplified - wait 3 seconds then reload)
      setTimeout(async () => {
        await loadLatestReport()
        setIsGenerating(false)
      }, 3000)
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Erro ao gerar relatório')
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="text-[#001489] hover:underline mb-4 inline-flex items-center gap-2"
          >
            <span>←</span> Voltar para Projeto
          </Link>
          <h1 className="text-3xl font-bold text-[#001489] mb-2 mt-4">
            Relatórios de Inspeção
          </h1>
          {project && (
            <p className="text-gray-600">
              Gere relatórios detalhados para o projeto <strong>{project.name}</strong>
            </p>
          )}
        </div>

        {/* Generate Report Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Gerar Novo Relatório
          </h2>
          
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Formato do Relatório
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedFormat('pdf')}
                disabled={isGenerating}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedFormat === 'pdf'
                    ? 'border-[#001489] bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">📄</div>
                  <h3 className="font-semibold text-gray-800">PDF</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Ideal para impressão e compartilhamento
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedFormat('html')}
                disabled={isGenerating}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedFormat === 'html'
                    ? 'border-[#001489] bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🌐</div>
                  <h3 className="font-semibold text-gray-800">HTML</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Visualização interativa no navegador
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || projectLoading}
            className="w-full bg-[#001489] text-white px-6 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Gerando Relatório...
              </>
            ) : (
              <>
                <span className="text-xl">📊</span>
                Gerar Relatório {selectedFormat.toUpperCase()}
              </>
            )}
          </button>

          {/* Error Display */}
          {generationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{generationError}</p>
            </div>
          )}

          {/* Generation Status */}
          {isGenerating && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mt-0.5"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Gerando Relatório
                  </h4>
                  <p className="text-sm text-blue-700">
                    Por favor aguarde, estamos compilando todas as evidências e análises...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Latest Report Card */}
        {!isLoadingReport && latestReport && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Relatório Mais Recente
            </h2>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Formato:</span>
                    <span className="font-semibold text-gray-800 uppercase">
                      {latestReport.format || 'PDF'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Gerado em:</span>
                    <span className="font-semibold text-gray-800">
                      {formatDate(latestReport.generated_at)}
                    </span>
                  </div>
                  
                  {latestReport.file_size && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Tamanho:</span>
                      <span className="font-semibold text-gray-800">
                        {(latestReport.file_size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <a
                    href={latestReport.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#001489] text-white px-4 py-2 rounded-lg hover:bg-[#001489]/90 transition text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <span>👁️</span>
                    Visualizar
                  </a>
                  
                  <a
                    href={latestReport.url}
                    download
                    className="border-2 border-[#001489] text-[#001489] px-4 py-2 rounded-lg hover:bg-[#001489] hover:text-white transition text-sm font-semibold inline-flex items-center gap-2"
                  >
                    <span>⬇️</span>
                    Baixar
                  </a>
                </div>
              </div>
              
              <div className="text-6xl ml-6">
                📊
              </div>
            </div>
          </div>
        )}

        {/* No Report State */}
        {!isLoadingReport && !latestReport && !isGenerating && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Nenhum Relatório Disponível
            </h3>
            <p className="text-gray-600 text-sm">
              Gere o primeiro relatório para este projeto usando o formulário acima
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoadingReport && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#001489]"></div>
              <span className="ml-3 text-gray-600">Carregando relatórios...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
