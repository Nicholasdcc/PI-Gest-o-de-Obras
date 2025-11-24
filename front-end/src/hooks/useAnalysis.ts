/**
 * useAnalysis Hook
 * 
 * Handle evidence analysis triggering and status polling
 */

import { useState, useCallback } from 'react'
import { analyzeEvidence, getEvidence } from '@/lib/api/endpoints'
import { EvidenceDetail, AnalysisStatus } from '@/lib/api/types'
import { usePolling } from './usePolling'

interface UseAnalysisOptions {
  evidenceId: string
  initialStatus: AnalysisStatus
  onAnalysisComplete?: (evidence: EvidenceDetail) => void
  onAnalysisError?: (error: string) => void
}

export function useAnalysis({
  evidenceId,
  initialStatus,
  onAnalysisComplete,
  onAnalysisError,
}: UseAnalysisOptions) {
  const [status, setStatus] = useState<AnalysisStatus>(initialStatus)
  const [isTriggering, setIsTriggering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldPoll, setShouldPoll] = useState(false)

  // Polling for analysis status updates
  const { start: startPolling, stop: stopPolling, attempts } = usePolling<EvidenceDetail>({
    onPoll: async () => {
      const evidence = await getEvidence(evidenceId)
      setStatus(evidence.status)
      return evidence
    },
    shouldStopPolling: (data) => {
      if (!data) return false
      return data.status === 'completed' || data.status === 'error'
    },
    enabled: shouldPoll && status === 'processing',
    interval: 5000, // 5 seconds
    maxAttempts: 60, // 5 minutes total (60 * 5s)
    onComplete: (data, reason) => {
      setShouldPoll(false)
      if (data) {
        if (data.status === 'completed') {
          onAnalysisComplete?.(data)
        } else if (data.status === 'error') {
          const errorMsg = 'Erro ao processar análise'
          setError(errorMsg)
          onAnalysisError?.(errorMsg)
        } else if (reason === 'max-attempts') {
          const errorMsg = 'Tempo limite de análise excedido'
          setError(errorMsg)
          onAnalysisError?.(errorMsg)
        }
      }
    },
    onError: (err) => {
      const errorMsg = err.message || 'Erro ao verificar status da análise'
      setError(errorMsg)
      onAnalysisError?.(errorMsg)
    },
  })

  // Trigger analysis
  const triggerAnalysis = useCallback(async () => {
    setIsTriggering(true)
    setError(null)

    try {
      const response = await analyzeEvidence(evidenceId)
      
      if (response.status === 'queued' || response.status === 'processing') {
        setStatus('processing')
        setShouldPoll(true) // Inicia o polling
        startPolling() // Força início do polling
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao iniciar análise'
      setError(errorMsg)
      onAnalysisError?.(errorMsg)
    } finally {
      setIsTriggering(false)
    }
  }, [evidenceId, onAnalysisError, startPolling])

  // Retry analysis (for error state)
  const retryAnalysis = useCallback(async () => {
    setError(null)
    await triggerAnalysis()
  }, [triggerAnalysis])

  return {
    /** Current analysis status */
    status,
    /** Whether analysis trigger is in progress */
    isTriggering,
    /** Current error message, if any */
    error,
    /** Number of polling attempts made */
    pollingAttempts: attempts,
    /** Trigger analysis for this evidence */
    triggerAnalysis,
    /** Retry analysis after an error */
    retryAnalysis,
    /** Stop polling manually */
    stopPolling,
  }
}
