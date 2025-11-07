/**
 * ProjectCard Component
 * 
 * Displays a summary card for a project
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { formatDate, formatProjectStatus } from '@/utils/formatting'
import type { Project } from '@/lib/api/types'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ImageIcon from '@mui/icons-material/Image'
import WarningIcon from '@mui/icons-material/Warning'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import ArchiveIcon from '@mui/icons-material/Archive'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    active: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircleIcon sx={{ fontSize: 14 }} />
    },
    paused: {
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <PauseCircleIcon sx={{ fontSize: 14 }} />
    },
    completed: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <TaskAltIcon sx={{ fontSize: 14 }} />
    },
    archived: {
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <ArchiveIcon sx={{ fontSize: 14 }} />
    },
  }

  const statusData = statusConfig[project.status] || statusConfig.active

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#001489] mb-2 line-clamp-2">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <LocationOnIcon sx={{ fontSize: 16 }} />
              <span className="line-clamp-1">{project.location}</span>
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusData.color}`}>
            {statusData.icon}
            {formatProjectStatus(project.status)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ImageIcon sx={{ fontSize: 20, color: '#2563eb' }} />
              <p className="text-2xl font-bold text-blue-600">
                {project.evidence_count || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500">Evidências</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <WarningIcon sx={{ fontSize: 20, color: '#ea580c' }} />
              <p className="text-2xl font-bold text-orange-600">
                {project.issues_count || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500">Problemas</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CalendarTodayIcon sx={{ fontSize: 14, color: '#6b7280' }} />
            </div>
            <p className="text-xs text-gray-500">Criado em</p>
            <p className="text-xs font-semibold text-gray-700">
              {formatDate(project.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
