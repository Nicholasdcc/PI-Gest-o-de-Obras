/**
 * useProjectIfc Hook
 * 
 * Manages IFC model data fetching and state for a project
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getProjectIfc, uploadIfc, getIfcElements, getIfcComparisons } from '@/lib/api/ifc'
import { getErrorMessage } from '@/utils/errors'
import type { IfcModel, IfcElement, IfcComparison } from '@/lib/api/types'

interface IfcState {
  model: IfcModel | null
  isLoading: boolean
  error: string | null
}

interface IfcElementsState {
  elements: IfcElement[]
  isLoading: boolean
  error: string | null
}

interface IfcComparisonsState {
  comparisons: IfcComparison[]
  isLoading: boolean
  error: string | null
}

export function useProjectIfc(projectId: string) {
  const [state, setState] = useState<IfcState>({
    model: null,
    isLoading: true,
    error: null,
  })

  const [uploadState, setUploadState] = useState({
    isUploading: false,
    error: null as string | null,
  })

  useEffect(() => {
    loadIfc()
  }, [projectId])

  const loadIfc = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await getProjectIfc(projectId)
      setState({
        model: data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        model: null,
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  }

  const upload = async (file: File) => {
    setUploadState({ isUploading: true, error: null })

    try {
      const data = await uploadIfc(projectId, file)
      setState({
        model: data,
        isLoading: false,
        error: null,
      })
      setUploadState({ isUploading: false, error: null })
      return data
    } catch (error) {
      const errorMsg = getErrorMessage(error)
      setUploadState({ isUploading: false, error: errorMsg })
      throw error
    }
  }

  const refetch = useCallback(() => {
    loadIfc()
  }, [projectId])

  return {
    ...state,
    ...uploadState,
    upload,
    refetch,
  }
}

export function useIfcElements(ifcId: string | null) {
  const [state, setState] = useState<IfcElementsState>({
    elements: [],
    isLoading: false,
    error: null,
  })

  const loadElements = useCallback(async () => {
    if (!ifcId) {
      setState({ elements: [], isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await getIfcElements(ifcId)
      setState({
        elements: data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        elements: [],
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  }, [ifcId])

  return {
    ...state,
    loadElements,
  }
}

export function useIfcComparisons(projectId: string) {
  const [state, setState] = useState<IfcComparisonsState>({
    comparisons: [],
    isLoading: false,
    error: null,
  })

  const loadComparisons = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await getIfcComparisons(projectId)
      setState({
        comparisons: data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        comparisons: [],
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  }, [projectId])

  return {
    ...state,
    loadComparisons,
  }
}
