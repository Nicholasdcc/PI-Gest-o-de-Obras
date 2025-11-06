/**
 * useProjects Hook
 * 
 * Manages project data fetching with loading and error states
 */

'use client'

import { useState, useEffect } from 'react'
import { getProjects, getProjectById } from '@/lib/api/endpoints'
import { getErrorMessage } from '@/utils/errors'
import type { Project, ProjectDetail } from '@/lib/api/types'

interface ProjectsState {
  projects: Project[]
  isLoading: boolean
  error: string | null
}

interface ProjectDetailState {
  project: ProjectDetail | null
  isLoading: boolean
  error: string | null
}

export function useProjects() {
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await getProjects()
      setState({
        projects: data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        projects: [],
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  }

  const refetch = () => {
    loadProjects()
  }

  return {
    ...state,
    refetch,
  }
}

export function useProjectDetail(projectId: string) {
  const [state, setState] = useState<ProjectDetailState>({
    project: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await getProjectById(projectId)
      setState({
        project: data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        project: null,
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  }

  const refetch = () => {
    loadProject()
  }

  return {
    ...state,
    refetch,
  }
}
