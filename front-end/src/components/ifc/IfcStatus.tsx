/**
 * IfcStatus Component
 * 
 * Display IFC model status and information
 */

'use client'

import React from 'react'
import type { IfcModel } from '@/lib/api/types'

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
          icon: '⏳',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
        }
      case 'ready':
        return {
          label: 'Pronto',
          color: 'green',
          icon: '✓',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        }
      case 'error':
        return {
          label: 'Erro no processamento',
          color: 'red',
          icon: '⚠️',
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
            <span className="text-2xl">{statusInfo.icon}</span>
            <h3 className={`text-lg font-bold ${statusInfo.textColor}`}>
              Modelo IFC
            </h3>
          </div>
          <div className={`text-sm ${statusInfo.textColor} space-y-1`}>
            <p>
              <span className="font-semibold">Status:</span> {statusInfo.label}
            </p>
            <p>
              <span className="font-semibold">Schema:</span> {model.schema}
            </p>
            {model.elements_count !== undefined && (
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
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="text-sm text-blue-800">
            ⏳ O modelo está sendo processado. Isso pode levar alguns minutos
            dependendo do tamanho. Atualize a página para verificar o progresso.
          </p>
        </div>
      )}

      {model.status === 'error' && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-red-800">
            Ocorreu um erro ao processar o modelo IFC. Por favor, verifique se o
            arquivo está correto e tente fazer o upload novamente.
          </p>
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
          <p className="text-sm text-green-800">
            ✓ Modelo IFC processado com sucesso! Use as opções abaixo para
            visualizar elementos ou comparar com evidências.
          </p>
        </div>
      )}
    </div>
  )
}
