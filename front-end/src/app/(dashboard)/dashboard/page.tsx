/**
 * Dashboard Page
 * 
 * Main dashboard with summary statistics
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getDashboardSummary } from '@/lib/api/endpoints'
import { formatNumber } from '@/utils/formatting'
import type { DashboardSummary } from '@/lib/api/types'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardSummary()
  }, [])

  const loadDashboardSummary = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err) {
      setError('Erro ao carregar dados do dashboard. Tente novamente.')
      console.error('Dashboard error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    loadDashboardSummary()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#001489] mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Visão geral do sistema de inspeção
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001489]"></div>
          <span className="ml-4 text-gray-600">Carregando dados...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <WarningAmberIcon sx={{ fontSize: 32, color: '#dc2626' }} />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-red-800 font-semibold mb-2">
                Erro ao carregar dashboard
              </h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && !isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Projects */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Total de Projetos
                </h3>
                <AccountTreeIcon sx={{ fontSize: 40, color: '#001489' }} />
              </div>
              <p className="text-4xl font-bold text-[#001489] mb-2">
                {formatNumber(summary.total_projects)}
              </p>
              <p className="text-xs text-gray-500">
                Projetos de inspeção cadastrados
              </p>
            </div>

            {/* Analyzed Evidences */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Evidências Analisadas
                </h3>
                <ImageSearchIcon sx={{ fontSize: 40, color: '#2563eb' }} />
              </div>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {formatNumber(summary.total_evidences)}
              </p>
              <p className="text-xs text-gray-500">
                Fotos processadas pela IA
              </p>
            </div>

            {/* Detected Issues */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Problemas Detectados
                </h3>
                <WarningAmberIcon sx={{ fontSize: 40, color: '#ea580c' }} />
              </div>
              <p className="text-4xl font-bold text-orange-600 mb-2">
                {formatNumber(summary.total_issues)}
              </p>
              <p className="text-xs text-gray-500">
                Issues identificadas automaticamente
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/projects/new"
                className="flex items-center p-4 border-2 border-[#001489] rounded-lg hover:bg-[#001489] hover:text-white transition group"
              >
                <AddCircleOutlineIcon 
                  sx={{ fontSize: 40 }} 
                  className="mr-4 text-[#001489] group-hover:text-white group-hover:scale-110 transition"
                />
                <div>
                  <h3 className="font-semibold text-[#001489] group-hover:text-white">
                    Novo Projeto
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/80">
                    Criar um novo projeto de inspeção
                  </p>
                </div>
              </Link>

              <Link
                href="/projects"
                className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-[#001489] hover:bg-gray-50 transition group"
              >
                <FolderOpenIcon 
                  sx={{ fontSize: 40 }} 
                  className="mr-4 text-gray-600 group-hover:text-[#001489] group-hover:scale-110 transition"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Ver Todos os Projetos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Acessar lista completa de projetos
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Empty State for New Users */}
          {summary.total_projects === 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">
                Bem-vindo ao Sistema de Inspeção!
              </h3>
              <p className="text-blue-700 mb-6">
                Comece criando seu primeiro projeto de inspeção
              </p>
              <Link
                href="/projects/new"
                className="inline-block bg-[#001489] text-white px-6 py-3 rounded-lg hover:bg-[#001489]/90 transition font-semibold"
              >
                Criar Primeiro Projeto
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
