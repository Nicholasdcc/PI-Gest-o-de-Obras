/**
 * IssuesList Component
 * 
 * Display list of detected issues with severity and confidence indicators
 */

import React from 'react'
import { Issue, IssueSeverity } from '@/lib/api/types'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CircleIcon from '@mui/icons-material/Circle'

interface IssuesListProps {
  issues: Issue[]
  showLocation?: boolean
}

const getSeverityColor = (severity?: IssueSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 border-red-300 text-red-900'
    case 'high':
      return 'bg-orange-100 border-orange-300 text-orange-900'
    case 'medium':
      return 'bg-yellow-100 border-yellow-300 text-yellow-900'
    case 'low':
      return 'bg-blue-100 border-blue-300 text-blue-900'
    default:
      return 'bg-gray-100 border-gray-300 text-gray-900'
  }
}

const getSeverityIcon = (severity?: IssueSeverity): React.ReactNode => {
  switch (severity) {
    case 'critical':
      return <CircleIcon sx={{ fontSize: 14, color: '#dc2626' }} />
    case 'high':
      return <CircleIcon sx={{ fontSize: 14, color: '#ea580c' }} />
    case 'medium':
      return <CircleIcon sx={{ fontSize: 14, color: '#ca8a04' }} />
    case 'low':
      return <CircleIcon sx={{ fontSize: 14, color: '#2563eb' }} />
    default:
      return <CircleIcon sx={{ fontSize: 14, color: '#d1d5db' }} />
  }
}

const getSeverityLabel = (severity?: IssueSeverity): string => {
  switch (severity) {
    case 'critical':
      return 'Crítico'
    case 'high':
      return 'Alto'
    case 'medium':
      return 'Médio'
    case 'low':
      return 'Baixo'
    default:
      return 'Não definido'
  }
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'bg-green-200 text-green-900'
  if (confidence >= 0.6) return 'bg-yellow-200 text-yellow-900'
  return 'bg-orange-200 text-orange-900'
}

export const IssuesList: React.FC<IssuesListProps> = ({ 
  issues, 
  showLocation = true 
}) => {
  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircleIcon sx={{ fontSize: 80, color: '#16a34a', mb: 1.5 }} />
        <p className="text-lg font-semibold text-gray-700 mb-1">
          Nenhum Problema Detectado
        </p>
        <p className="text-sm text-gray-600">
          A análise não identificou problemas nesta evidência
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {issues.map((issue, index) => (
        <div
          key={issue.id || index}
          className={`p-4 border rounded-lg ${getSeverityColor(issue.severity)}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-2 flex-1">
              <span className="text-xl">{getSeverityIcon(issue.severity)}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {issue.type}
                </h3>
                {issue.severity && (
                  <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-white/50">
                    Severidade: {getSeverityLabel(issue.severity)}
                  </span>
                )}
              </div>
            </div>
            
            {/* Confidence Badge */}
            <div className="ml-4">
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${getConfidenceColor(issue.confidence)}`}>
                {Math.round(issue.confidence * 100)}% confiança
              </div>
            </div>
          </div>

          {/* Description */}
          {issue.description && (
            <p className="text-sm mb-3 leading-relaxed">
              {issue.description}
            </p>
          )}

          {/* Location */}
          {showLocation && issue.location && (
            <div className="flex items-center gap-4 text-xs pt-3 border-t border-current/20">
              <span className="flex items-center gap-1 font-medium">
                <span>📍</span>
                Localização:
              </span>
              <span>
                X: {issue.location.x}px, Y: {issue.location.y}px
              </span>
              <span>
                Tamanho: {issue.location.width}×{issue.location.height}px
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">
            Total de Problemas:
          </span>
          <span className="text-lg font-bold text-[#001489]">
            {issues.length}
          </span>
        </div>
        
        {/* Severity Breakdown */}
        {issues.some(issue => issue.severity) && (
          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Por Severidade:
            </p>
            <div className="flex flex-wrap gap-2">
              {['critical', 'high', 'medium', 'low'].map((severity) => {
                const count = issues.filter(
                  (issue) => issue.severity === severity
                ).length
                if (count === 0) return null
                return (
                  <span
                    key={severity}
                    className="text-xs px-2 py-1 rounded bg-white border border-gray-300"
                  >
                    {getSeverityIcon(severity as IssueSeverity)} {getSeverityLabel(severity as IssueSeverity)}: {count}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
