/**
 * IfcElementsList Component
 * 
 * Display IFC elements in a table
 */

'use client'

import React from 'react'
import type { IfcElement } from '@/lib/api/types'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ListAltIcon from '@mui/icons-material/ListAlt'

interface IfcElementsListProps {
  elements: IfcElement[]
  isLoading: boolean
  error: string | null
}

export function IfcElementsList({ elements, isLoading, error }: IfcElementsListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#001489]"></div>
          <span className="ml-3 text-gray-600">Carregando elementos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start">
          <WarningAmberIcon sx={{ fontSize: 32, color: '#dc2626', mr: 1.5 }} />
          <div>
            <h3 className="text-red-800 font-semibold mb-1">
              Erro ao carregar elementos
            </h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (elements.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <div className="text-center text-gray-600">
          <ListAltIcon sx={{ fontSize: 64, color: '#6b7280', mb: 1 }} />
          <p className="text-sm">Nenhum elemento encontrado no modelo IFC.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-bold text-[#001489]">
          Elementos do Modelo ({elements.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Código
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {elements.map((element) => (
              <tr
                key={element.id}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {element.name || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {element.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                  {element.code || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
