/**
 * ProjectList Component
 * 
 * Displays a grid of project cards
 */

'use client'

import React from 'react'
import { ProjectCard } from './ProjectCard'
import type { Project } from '@/lib/api/types'

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Nenhum projeto encontrado
        </h3>
        <p className="text-gray-600">
          Comece criando um novo projeto de fiscalização
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
