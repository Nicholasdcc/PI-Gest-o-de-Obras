/**
 * API Configuration Module
 * 
 * Manages API base URL and mock mode settings from environment variables
 */

// Access environment variables at module load time
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: use process.env
    return (globalThis as any).process?.env?.[key] || defaultValue
  }
  // Client-side: Next.js injects NEXT_PUBLIC_ vars at build time
  return defaultValue
}

const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  if (typeof window === 'undefined') {
    return (globalThis as any).process?.env?.[key] === 'true' || defaultValue
  }
  return defaultValue
}

export const API_CONFIG = {
  /**
   * Base URL for the API
   * Defaults to localhost if not set in environment
   */
  baseURL: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:3001/api'),
  
  /**
   * Whether to use mock data instead of real API calls
   * Useful for development when backend is not available
   */
  useMock: getEnvBool('NEXT_PUBLIC_USE_MOCK_API', true),
  
  /**
   * Request timeout in milliseconds
   */
  timeout: 30000,
  
  /**
   * Polling interval for analysis status (in milliseconds)
   */
  pollingInterval: 5000,
  
  /**
   * Maximum polling attempts before timing out
   */
  maxPollingAttempts: 60, // 5 minutes at 5-second intervals
} as const

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  
  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  
  // Projects
  PROJECTS: '/projects',
  PROJECT_BY_ID: (id: string) => `/projects/${id}`,
  
  // Evidence
  PROJECT_EVIDENCES: (projectId: string) => `/projects/${projectId}/evidences`,
  EVIDENCE_BY_ID: (evidenceId: string) => `/evidences/${evidenceId}`,
  ANALYZE_EVIDENCE: (evidenceId: string) => `/evidences/${evidenceId}/analyze`,
  
  // Reports
  GENERATE_REPORT: (projectId: string) => `/projects/${projectId}/reports/generate`,
  LATEST_REPORT: (projectId: string) => `/projects/${projectId}/reports/latest`,
} as const
