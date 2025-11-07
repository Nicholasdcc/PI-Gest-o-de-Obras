/**
 * IfcComparisons Component
 * 
 * Display IFC vs Evidence comparisons
 */

'use client'

import React from 'react'
import type { IfcComparison } from '@/lib/api/types'

interface IfcComparisonsProps {
  comparisons: IfcComparison[]
  isLoading: boolean
  error: string | null
}

export function IfcComparisons({ comparisons, isLoading, error }: IfcComparisonsProps) {
  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          label: 'Alta',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '🔴',
        }
      case 'medium':
        return {
          label: 'Média',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🟠',
        }
      case 'low':
        return {
          label: 'Baixa',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🟡',
        }
      default:
        return {
          label: 'Indefinida',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⚪',
        }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#001489]"></div>
          <span className="ml-3 text-gray-600">Carregando comparações...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start">
          <span className="text-red-600 text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-semibold mb-1">
              Erro ao carregar comparações
            </h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (comparisons.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="text-center text-green-800">
          <span className="text-4xl mb-2 block">✓</span>
          <h3 className="font-semibold mb-1">Nenhuma inconsistência detectada</h3>
          <p className="text-sm">
            O modelo IFC está alinhado com as evidências enviadas.
          </p>
        </div>
      </div>
    )
  }

  // Group by severity
  const grouped = {
    high: comparisons.filter((c) => c.severity === 'high'),
    medium: comparisons.filter((c) => c.severity === 'medium'),
    low: comparisons.filter((c) => c.severity === 'low'),
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#001489]">
            Checagens IFC × Evidências
          </h3>
          <span className="text-sm font-semibold text-gray-600">
            {comparisons.length} inconsistência{comparisons.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-4 mt-3 text-sm">
          {grouped.high.length > 0 && (
            <span className="text-red-600">
              🔴 {grouped.high.length} Alta
            </span>
          )}
          {grouped.medium.length > 0 && (
            <span className="text-orange-600">
              🟠 {grouped.medium.length} Média
            </span>
          )}
          {grouped.low.length > 0 && (
            <span className="text-yellow-600">
              🟡 {grouped.low.length} Baixa
            </span>
          )}
        </div>
      </div>

      {/* Comparisons List */}
      <div className="space-y-3">
        {comparisons.map((comparison) => {
          const severityInfo = getSeverityInfo(comparison.severity)
          return (
            <div
              key={comparison.id}
              className={`rounded-lg p-4 border ${severityInfo.color}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{severityInfo.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase">
                      {comparison.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/50">
                      {severityInfo.label}
                    </span>
                  </div>
                  <p className="text-sm">{comparison.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
