/**
 * useEvidence Hook
 * 
 * Manages evidence data fetching with loading and error states
 */

'use client'

import { useState, useEffect } from 'react'
import { getProjectEvidences, getEvidence } from '@/lib/api/endpoints'
import { getErrorMessage } from '@/utils/errors'
import type { Evidence, EvidenceDetail } from '@/lib/api/types'

interface EvidencesState {
  evidences: Evidence[]
  isLoading: boolean
  error: string | null
}

interface EvidenceDetailState {
  evidence: EvidenceDetail | null
  isLoading: boolean
  error: string | null
}

export function useProjectEvidences(projectId: string) {
  const [state, setState] = useState<EvidencesState>({
    evidences: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    loadEvidences()
  }, [projectId])

  const loadEvidences = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await getProjectEvidences(projectId)
      setState({
        evidences: data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        evidences: [],
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  }

  const refetch = () => {
    loadEvidences()
  }

  return {
    ...state,
    refetch,
  }
}

export function useEvidenceDetail(evidenceId: string) {
  const [state, setState] = useState<EvidenceDetailState>({
    evidence: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    loadEvidence()
  }, [evidenceId])

  const loadEvidence = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await getEvidence(evidenceId)
      setState({
        evidence: data,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setState({
        evidence: null,
        isLoading: false,
        error: getErrorMessage(error),
      })
    }
  }

  const refetch = () => {
    loadEvidence()
  }

  return {
    ...state,
    refetch,
  }
}
