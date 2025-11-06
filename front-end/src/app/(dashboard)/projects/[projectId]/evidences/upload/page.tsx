/**
 * Evidence Upload Page
 * 
 * Upload new evidence to a project
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { EvidenceUpload } from '@/components/evidence/EvidenceUpload'
import { uploadEvidence } from '@/lib/api/endpoints'

export default function UploadEvidencePage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleUpload = async (file: File, description: string) => {
    setIsUploading(true)
    setError(null)

    try {
      const evidence = await uploadEvidence(projectId, file, description)
      
      // Redirect to evidence detail page
      router.push(`/projects/${projectId}/evidences/${evidence.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar evidência')
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${projectId}`}
            className="text-[#001489] hover:underline mb-4 inline-flex items-center gap-2"
          >
            <span>←</span> Voltar para Projeto
          </Link>
          <h1 className="text-3xl font-bold text-[#001489] mb-2 mt-4">
            Enviar Evidência
          </h1>
          <p className="text-gray-600">
            Faça upload de fotos da obra para análise
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <EvidenceUpload
            onUpload={handleUpload}
            isLoading={isUploading}
          />

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-red-600 text-xl mr-3">⚠️</span>
                <div className="flex-1">
                  <h4 className="text-red-800 font-semibold mb-1">
                    Erro no Upload
                  </h4>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Diretrizes para Fotos
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Tire fotos nítidas e bem iluminadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Foque em áreas específicas de interesse</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Inclua referências de escala quando possível</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Capture múltiplos ângulos da mesma área</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span>Evite fotos tremidas ou desfocadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✗</span>
                <span>Não inclua informações confidenciais visíveis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
