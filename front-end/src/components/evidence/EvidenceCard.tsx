/**
 * EvidenceCard Component
 * 
 * Displays an evidence thumbnail with status indicator
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { formatDateTime, formatAnalysisStatus } from '@/utils/formatting'
import type { Evidence } from '@/lib/api/types'
import ImageIcon from '@mui/icons-material/Image'

interface EvidenceCardProps {
  evidence: Evidence
  projectId: string
}

export function EvidenceCard({ evidence, projectId }: EvidenceCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-gray-400',
    processing: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    error: 'bg-red-500',
  }

  const statusColor = statusColors[evidence.status] || statusColors.pending

  return (
    <Link href={`/projects/${projectId}/evidences/${evidence.id}`}>
      <div className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#001489] transition cursor-pointer bg-gray-100">
        {/* Image */}
        {evidence.thumbnail_url || evidence.file_url ? (
          <img
            src={evidence.thumbnail_url || evidence.file_url}
            alt={evidence.description || 'Evidence'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon sx={{ fontSize: 80, color: '#9ca3af' }} />
          </div>
        )}

        {/* Status Indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${statusColor}`} />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white p-4">
          <p className="text-sm font-semibold mb-1">
            {formatAnalysisStatus(evidence.status)}
          </p>
          {evidence.issues_count !== undefined && evidence.issues_count > 0 && (
            <p className="text-xs">
              {evidence.issues_count} problema{evidence.issues_count !== 1 ? 's' : ''}
            </p>
          )}
          {evidence.uploaded_at && (
            <p className="text-xs mt-2 opacity-80">
              {formatDateTime(evidence.uploaded_at)}
            </p>
          )}
        </div>

        {/* Description tooltip */}
        {evidence.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition">
            <p className="line-clamp-2">{evidence.description}</p>
          </div>
        )}
      </div>
    </Link>
  )
}
