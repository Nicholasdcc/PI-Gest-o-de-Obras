/**
 * usePolling Hook
 * 
 * Generic polling hook for real-time updates
 * Polls at specified intervals with max attempts limit
 */

import { useEffect, useRef, useCallback } from 'react'

interface UsePollingOptions<T> {
  /** Function to call on each poll */
  onPoll: () => Promise<T>
  /** Interval between polls in milliseconds (default: 5000ms = 5s) */
  interval?: number
  /** Maximum number of polling attempts (default: 60) */
  maxAttempts?: number
  /** Condition to stop polling */
  shouldStopPolling: (data: T | null) => boolean
  /** Whether polling is enabled */
  enabled?: boolean
  /** Callback when polling completes (max attempts or stop condition met) */
  onComplete?: (data: T | null, reason: 'max-attempts' | 'condition-met') => void
  /** Callback when polling encounters an error */
  onError?: (error: Error) => void
}

/**
 * Custom hook for polling data at regular intervals
 * 
 * @example
 * ```tsx
 * const { start, stop, isPolling, attempts } = usePolling({
 *   onPoll: async () => await getEvidenceDetail(evidenceId),
 *   shouldStopPolling: (data) => data?.status === 'completed',
 *   enabled: status === 'processing',
 *   onComplete: (data, reason) => {
 *     if (reason === 'condition-met') {
 *       console.log('Analysis completed!', data)
 *     } else {
 *       console.log('Max attempts reached')
 *     }
 *   }
 * })
 * ```
 */
export function usePolling<T>({
  onPoll,
  interval = 5000,
  maxAttempts = 60,
  shouldStopPolling,
  enabled = true,
  onComplete,
  onError,
}: UsePollingOptions<T>) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const attemptsRef = useRef(0)
  const latestDataRef = useRef<T | null>(null)
  const isPollingRef = useRef(false)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isPollingRef.current = false
  }, [])

  const poll = useCallback(async () => {
    if (!isPollingRef.current) return

    try {
      attemptsRef.current += 1
      const data = await onPoll()
      latestDataRef.current = data

      // Check if we should stop polling
      if (shouldStopPolling(data)) {
        stop()
        onComplete?.(data, 'condition-met')
        return
      }

      // Check if we've reached max attempts
      if (attemptsRef.current >= maxAttempts) {
        stop()
        onComplete?.(data, 'max-attempts')
        return
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Polling error'))
      // Continue polling even on error, unless explicitly stopped
    }
  }, [onPoll, shouldStopPolling, maxAttempts, stop, onComplete, onError])

  const start = useCallback(() => {
    if (isPollingRef.current) return // Already polling

    isPollingRef.current = true
    attemptsRef.current = 0
    latestDataRef.current = null

    // Poll immediately on start
    poll()

    // Set up interval for subsequent polls
    intervalRef.current = setInterval(poll, interval)
  }, [poll, interval])

  // Auto-start/stop based on enabled flag
  useEffect(() => {
    if (enabled && !isPollingRef.current) {
      start()
    } else if (!enabled && isPollingRef.current) {
      stop()
    }

    return () => {
      stop()
    }
  }, [enabled, start, stop])

  return {
    /** Start polling manually */
    start,
    /** Stop polling manually */
    stop,
    /** Whether polling is currently active */
    isPolling: isPollingRef.current,
    /** Current number of polling attempts */
    attempts: attemptsRef.current,
    /** Latest polled data */
    latestData: latestDataRef.current,
  }
}
