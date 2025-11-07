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

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    paused: 'bg-amber-100 text-amber-800 border-amber-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    archived: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  const statusColor = statusColors[project.status] || statusColors.active

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 border border-gray-200 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#001489] mb-2 line-clamp-2">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <span className="mr-2">📍</span>
              <span className="line-clamp-1">{project.location}</span>
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
            {formatProjectStatus(project.status)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {project.evidence_count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Evidências</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {project.issues_count || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Problemas</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mt-1">Criado em</p>
            <p className="text-xs font-semibold text-gray-700">
              {formatDate(project.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
