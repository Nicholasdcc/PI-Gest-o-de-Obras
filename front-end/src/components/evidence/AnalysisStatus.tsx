/**
 * AnalysisStatus Component
 * 
 * Display analysis status with appropriate styling
 */

'use client'

import React from 'react'
import { formatAnalysisStatus } from '@/utils/formatting'
import type { AnalysisStatus } from '@/lib/api/types'

interface AnalysisStatusProps {
  status: AnalysisStatus
  size?: 'sm' | 'md' | 'lg'
}

export function AnalysisStatus({ status, size = 'md' }: AnalysisStatusProps) {
  const statusConfig: Record<AnalysisStatus, { bg: string; text: string; icon: string }> = {
    pending: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: '⏳',
    },
    processing: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: '⚙️',
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: '✗',
    },
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  }

  const config = statusConfig[status]
  const sizeClass = sizeClasses[size]

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold border ${config.bg} ${config.text} ${sizeClass} border-current/20`}
    >
      <span className={status === 'processing' ? 'animate-spin' : ''}>
        {config.icon}
      </span>
      {formatAnalysisStatus(status)}
    </span>
  )
}
