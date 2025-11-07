/**
 * IfcSection Component
 * 
 * Main IFC section that integrates all IFC components
 */

'use client'

import React, { useState } from 'react'
import { useProjectIfc, useIfcElements, useIfcComparisons } from '@/hooks/useProjectIfc'
import { IfcUpload } from './IfcUpload'
import { IfcStatus } from './IfcStatus'
import { IfcElementsList } from './IfcElementsList'
import { IfcComparisons } from './IfcComparisons'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SearchIcon from '@mui/icons-material/Search'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

interface IfcSectionProps {
  projectId: string
}

export function IfcSection({ projectId }: IfcSectionProps) {
  const { model, isLoading, error, isUploading, upload, refetch } = useProjectIfc(projectId)
  const [showUpload, setShowUpload] = useState(false)
  const [showElements, setShowElements] = useState(false)
  const [showComparisons, setShowComparisons] = useState(false)

  const {
    elements,
    isLoading: elementsLoading,
    error: elementsError,
    loadElements,
  } = useIfcElements(model?.id || null)

  const {
    comparisons,
    isLoading: comparisonsLoading,
    error: comparisonsError,
    loadComparisons,
  } = useIfcComparisons(projectId)

  const handleUpload = async (file: File) => {
    await upload(file)
    setShowUpload(false)
  }

  const handleShowElements = () => {
    if (!showElements) {
      loadElements()
    }
    setShowElements(!showElements)
  }

  const handleShowComparisons = () => {
    if (!showComparisons) {
      loadComparisons()
    }
    setShowComparisons(!showComparisons)
  }

  const handleReupload = () => {
    setShowUpload(true)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#001489]"></div>
          <span className="ml-3 text-gray-600">Carregando informações IFC...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start">
          <WarningAmberIcon sx={{ fontSize: 32, color: '#dc2626', mr: 1.5 }} />
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold mb-2">
              Erro ao carregar modelo IFC
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
    )
  }

  // No IFC model linked
  if (!model) {
    return (
      <div className="space-y-4">
        {!showUpload ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
            <div className="text-center">
              <AccountTreeIcon sx={{ fontSize: 80, color: '#6b7280', mb: 2 }} />
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Nenhum modelo IFC vinculado
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                O modelo IFC é opcional e permite comparar o projeto planejado com
                as evidências enviadas, detectando inconsistências automaticamente.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-[#001489] text-white px-6 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold"
              >
                Enviar Modelo IFC
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowUpload(false)}
              className="mb-4 text-[#001489] hover:underline text-sm flex items-center gap-1"
            >
              ← Voltar
            </button>
            <IfcUpload onUpload={handleUpload} isLoading={isUploading} />
          </div>
        )}
      </div>
    )
  }

  // IFC model exists
  return (
    <div className="space-y-6">
      {/* Status */}
      <IfcStatus model={model} onReupload={model.status === 'error' ? handleReupload : undefined} />

      {/* Upload form if reupload is active */}
      {showUpload && (
        <div>
          <button
            onClick={() => setShowUpload(false)}
            className="mb-4 text-[#001489] hover:underline text-sm flex items-center gap-1"
          >
            ← Cancelar
          </button>
          <IfcUpload onUpload={handleUpload} isLoading={isUploading} />
        </div>
      )}

      {/* Actions (only when status is ready) */}
      {model.status === 'ready' && !showUpload && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleShowElements}
            className="bg-white border-2 border-[#001489] text-[#001489] px-6 py-4 rounded-lg hover:bg-[#001489] hover:text-white transition font-semibold flex items-center justify-center gap-2"
          >
            <ListAltIcon sx={{ fontSize: 24 }} />
            {showElements ? 'Ocultar Elementos' : 'Ver Elementos do Modelo'}
          </button>
          <button
            onClick={handleShowComparisons}
            className="bg-white border-2 border-[#001489] text-[#001489] px-6 py-4 rounded-lg hover:bg-[#001489] hover:text-white transition font-semibold flex items-center justify-center gap-2"
          >
            <SearchIcon sx={{ fontSize: 24 }} />
            {showComparisons ? 'Ocultar Checagens' : 'Ver Checagens IFC × Evidências'}
          </button>
        </div>
      )}

      {/* Elements List */}
      {showElements && (
        <IfcElementsList
          elements={elements}
          isLoading={elementsLoading}
          error={elementsError}
        />
      )}

      {/* Comparisons */}
      {showComparisons && (
        <IfcComparisons
          comparisons={comparisons}
          isLoading={comparisonsLoading}
          error={comparisonsError}
        />
      )}
    </div>
  )
}
