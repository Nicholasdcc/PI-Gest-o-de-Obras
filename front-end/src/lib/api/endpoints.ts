/**
 * API Endpoints Module
 * 
 * All API endpoint functions centralized here
 * Supports both mock and real API modes via API_CONFIG.useMock
 */

import { API_CONFIG, API_ENDPOINTS } from './config'
import { get, post, uploadFile, ApiError } from './client'
import type {
  LoginRequest,
  LoginResponse,
  DashboardSummary,
  Project,
  ProjectDetail,
  CreateProjectRequest,
  CreateProjectResponse,
  Evidence,
  EvidenceDetail,
  UploadEvidenceResponse,
  AnalyzeEvidenceResponse,
  Report,
  ReportFormat,
  GenerateReportResponse,
} from './types'
import {
  MOCK_USER,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_PROJECTS,
  getMockProjectDetail,
  getMockProjectEvidences,
  getMockEvidenceDetail,
  getMockReport,
  mockUploadEvidence,
  mockCreateProject,
  mockAnalyzeEvidence,
} from './mock-data'

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Login with email and password
 */
export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  if (API_CONFIG.useMock) {
    // Mock: Simulate successful login
    await simulateDelay(500)
    
    // Simple mock validation
    if (credentials.email && credentials.password.length >= 8) {
      return {
        access_token: 'mock_token_' + Date.now(),
        user: MOCK_USER,
      }
    } else {
      throw new ApiError(
        'Email ou senha inválidos',
        'INVALID_CREDENTIALS'
      )
    }
  }
  
  return post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials)
}

// ============================================================================
// DASHBOARD
// ============================================================================

/**
 * Get dashboard summary statistics
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (API_CONFIG.useMock) {
    await simulateDelay(300)
    return MOCK_DASHBOARD_SUMMARY
  }
  
  return get<DashboardSummary>(API_ENDPOINTS.DASHBOARD_SUMMARY)
}

// ============================================================================
// PROJECTS
// ============================================================================

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  if (API_CONFIG.useMock) {
    await simulateDelay(400)
    return MOCK_PROJECTS
  }
  
  return get<Project[]>(API_ENDPOINTS.PROJECTS)
}

/**
 * Get project by ID with evidences
 */
export async function getProjectById(id: string): Promise<ProjectDetail> {
  if (API_CONFIG.useMock) {
    await simulateDelay(350)
    const project = getMockProjectDetail(id)
    if (!project) {
      throw new ApiError('Projeto não encontrado', 'NOT_FOUND')
    }
    return project
  }
  
  return get<ProjectDetail>(API_ENDPOINTS.PROJECT_BY_ID(id))
}

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectRequest
): Promise<CreateProjectResponse> {
  if (API_CONFIG.useMock) {
    await simulateDelay(600)
    return mockCreateProject(data.name, data.location, data.status)
  }
  
  return post<CreateProjectResponse>(API_ENDPOINTS.PROJECTS, data)
}

// ============================================================================
// EVIDENCE
// ============================================================================

/**
 * Get all evidences for a project
 */
export async function getProjectEvidences(
  projectId: string
): Promise<Evidence[]> {
  if (API_CONFIG.useMock) {
    await simulateDelay(350)
    return getMockProjectEvidences(projectId)
  }
  
  return get<Evidence[]>(API_ENDPOINTS.PROJECT_EVIDENCES(projectId))
}

/**
 * Get evidence by ID with issues
 */
export async function getEvidence(id: string): Promise<EvidenceDetail> {
  if (API_CONFIG.useMock) {
    await simulateDelay(300)
    const evidence = getMockEvidenceDetail(id)
    if (!evidence) {
      throw new ApiError('Evidência não encontrada', 'NOT_FOUND')
    }
    return evidence
  }
  
  return get<EvidenceDetail>(API_ENDPOINTS.EVIDENCE_BY_ID(id))
}

/**
 * Upload evidence (image) for a project
 */
export async function uploadEvidence(
  projectId: string,
  file: File,
  description?: string
): Promise<UploadEvidenceResponse> {
  if (API_CONFIG.useMock) {
    await simulateDelay(1000)
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new ApiError(
        'Formato de arquivo não suportado',
        'UNSUPPORTED_FORMAT'
      )
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new ApiError('Arquivo muito grande', 'FILE_TOO_LARGE')
    }
    
    return mockUploadEvidence(projectId, file, description)
  }
  
  const formData = new FormData()
  formData.append('file', file)
  if (description) {
    formData.append('description', description)
  }
  
  return uploadFile<UploadEvidenceResponse>(
    API_ENDPOINTS.PROJECT_EVIDENCES(projectId),
    formData
  )
}

/**
 * Trigger AI analysis on evidence
 */
export async function analyzeEvidence(
  evidenceId: string
): Promise<AnalyzeEvidenceResponse> {
  if (API_CONFIG.useMock) {
    await simulateDelay(400)
    mockAnalyzeEvidence(evidenceId)
    return { status: 'processing' }
  }
  
  return post<AnalyzeEvidenceResponse>(
    API_ENDPOINTS.ANALYZE_EVIDENCE(evidenceId)
  )
}

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Generate a new report for a project
 */
export async function generateReport(
  projectId: string,
  format: ReportFormat = 'pdf'
): Promise<GenerateReportResponse> {
  if (API_CONFIG.useMock) {
    await simulateDelay(500)
    // Simulate report generation
    return { status: 'generating' }
  }
  
  return post<GenerateReportResponse>(API_ENDPOINTS.GENERATE_REPORT(projectId), {
    format,
  })
}

/**
 * Get latest report for a project
 */
export async function getLatestReport(projectId: string): Promise<Report> {
  if (API_CONFIG.useMock) {
    await simulateDelay(350)
    const report = getMockReport(projectId)
    if (!report) {
      throw new ApiError('Relatório não encontrado', 'NOT_FOUND')
    }
    return report
  }
  
  return get<Report>(API_ENDPOINTS.LATEST_REPORT(projectId))
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Simulate network delay for mock API
 */
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
