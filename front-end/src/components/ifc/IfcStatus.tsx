/**
 * IfcStatus Component
 * 
 * Display IFC model status and information
 */

'use client'

import React from 'react'
import type { IfcModel } from '@/lib/api/types'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

interface IfcStatusProps {
  model: IfcModel
  onReupload?: () => void
}

export function IfcStatus({ model, onReupload }: IfcStatusProps) {
  const getStatusInfo = () => {
    switch (model.status) {
      case 'processing':
        return {
          label: 'Processando',
          color: 'blue',
          icon: <HourglassEmptyIcon sx={{ fontSize: 32 }} />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
        }
      case 'ready':
        return {
          label: 'Pronto',
          color: 'green',
          icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        }
      case 'error':
        return {
          label: 'Erro no processamento',
          color: 'red',
          icon: <ErrorIcon sx={{ fontSize: 32 }} />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {statusInfo.icon}
            <h3 className={`text-lg font-bold ${statusInfo.textColor}`}>
              Modelo IFC
            </h3>
          </div>
          <div className={`text-sm ${statusInfo.textColor} space-y-1`}>
            <p>
              <span className="font-semibold">Status:</span> {statusInfo.label}
            </p>
            {model.schema && (
              <p>
                <span className="font-semibold">Schema:</span> {model.schema}
              </p>
            )}
            {model.elements_count !== undefined && model.elements_count !== null && (
              <p>
                <span className="font-semibold">Elementos:</span>{' '}
                {model.elements_count.toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status-specific messages */}
      {model.status === 'processing' && (
        <div className="mt-4 p-3 bg-white rounded-lg flex items-start gap-2">
          <HourglassEmptyIcon sx={{ fontSize: 20, color: '#1e40af' }} />
          <p className="text-sm text-blue-800">
            O modelo está sendo processado. Isso pode levar alguns minutos
            dependendo do tamanho. Atualize a página para verificar o progresso.
          </p>
        </div>
      )}

      {model.status === 'error' && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm text-red-800 font-semibold mb-2">
              Ocorreu um erro ao processar o modelo IFC:
            </p>
            {model.error_message && (
              <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                {model.error_message}
              </p>
            )}
            {!model.error_message && (
              <p className="text-sm text-red-700">
                Por favor, verifique se o arquivo está correto e tente fazer o upload novamente.
              </p>
            )}
          </div>
          {onReupload && (
            <button
              onClick={onReupload}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
            >
              Reenviar IFC
            </button>
          )}
        </div>
      )}

      {model.status === 'ready' && (
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <CheckCircleIcon sx={{ fontSize: 18 }} />
            Modelo IFC processado com sucesso! Use as opções abaixo para
            visualizar elementos ou comparar com evidências.
          </p>
        </div>
      )}
    </div>
  )
}
