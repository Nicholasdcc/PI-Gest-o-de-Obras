/**
 * TypeScript Type Definitions for Construction Inspection Portal API
 *
 * These types match the API contracts defined in api-contracts.md
 * Use these types throughout the frontend for type safety
 */

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface User {
  id: string
  name: string
  email: string
  role?: string  // Future: for permissions
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardSummary {
  total_projects: number
  total_evidences: number
  total_issues: number
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  location: string
  status: ProjectStatus
  created_at?: string  // ISO 8601 timestamp
  updated_at?: string  // ISO 8601 timestamp
  evidence_count?: number
  issues_count?: number
}

export interface ProjectDetail extends Project {
  evidences: EvidenceSummary[]
}

export interface CreateProjectRequest {
  name: string
  location: string
  status?: ProjectStatus
}

export interface CreateProjectResponse extends Project {}

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'error'

export interface EvidenceSummary {
  id: string
  thumbnail_url?: string
  status: AnalysisStatus
  issues_count: number
  uploaded_at?: string  // ISO 8601 timestamp
}

export interface Evidence {
  id: string
  project_id: string
  file_url: string
  thumbnail_url?: string
  description?: string | null
  status: AnalysisStatus
  uploaded_at?: string    // ISO 8601 timestamp
  analyzed_at?: string    // ISO 8601 timestamp
  issues_count?: number
}

export interface EvidenceDetail extends Evidence {
  issues: Issue[]
}

export interface UploadEvidenceRequest {
  file: File
  description?: string
}

export interface UploadEvidenceResponse extends Evidence {}

export interface AnalyzeEvidenceResponse {
  status: 'queued' | 'processing'
}

// ============================================================================
// ISSUE TYPES
// ============================================================================

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface Issue {
  id?: string
  type: string          // e.g., "structural_crack", "water_damage"
  description: string
  confidence: number    // 0.0 to 1.0
  severity?: IssueSeverity
  location?: {          // Future: bounding box in image
    x: number
    y: number
    width: number
    height: number
  }
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export type ReportFormat = 'pdf' | 'html'

export interface Report {
  project_id: string
  url: string
  format?: ReportFormat
  generated_at: string  // ISO 8601 timestamp
  file_size?: number    // in bytes
}

export interface GenerateReportResponse {
  status: 'generating'
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}

export interface ErrorResponse {
  error: ApiError
}

// Common error codes as constants
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  ALREADY_PROCESSING: 'ALREADY_PROCESSING',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

// ============================================================================
// PAGINATION TYPES (Future)
// ============================================================================

export interface PaginationMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// ============================================================================
// API RESPONSE HELPERS
// ============================================================================

/**
 * Unified success response wrapper (if backend uses envelopes)
 */
export interface ApiResponse<T> {
  data: T
  meta?: Record<string, any>
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(response: any): response is ErrorResponse {
  return response && typeof response === 'object' && 'error' in response
}

/**
 * Type guard to check if an error is a specific code
 */
export function isErrorCode(error: ApiError, code: string): boolean {
  return error.code === code
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Form state for creating/editing projects
 */
export interface ProjectFormData {
  name: string
  location: string
  status: ProjectStatus
}

/**
 * Form state for uploading evidence
 */
export interface EvidenceUploadFormData {
  file: File | null
  description: string
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Generic loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

/**
 * Extended loading state with data
 */
export interface DataState<T> extends LoadingState {
  data: T | null
}

/**
 * Polling state for analysis status
 */
export interface PollingState {
  isPolling: boolean
  intervalId: number | null
  attempts: number
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * File upload constraints
 */
export const FILE_UPLOAD_CONSTRAINTS = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024,  // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MAX_DESCRIPTION_LENGTH: 500,
} as const

/**
 * Project validation constraints
 */
export const PROJECT_CONSTRAINTS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 200,
  LOCATION_MIN_LENGTH: 3,
  LOCATION_MAX_LENGTH: 500,
} as const

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract the type of array elements
 */
export type ArrayElement<T extends readonly any[]> = T[number]

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
