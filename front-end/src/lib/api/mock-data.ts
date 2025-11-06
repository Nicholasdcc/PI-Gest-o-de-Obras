/**
 * Mock Data Module
 * 
 * Provides sample data for all entities when NEXT_PUBLIC_USE_MOCK_API=true
 * This allows frontend development without a running backend
 */

import type {
  User,
  DashboardSummary,
  Project,
  ProjectDetail,
  Evidence,
  EvidenceDetail,
  Issue,
  Report,
  AnalysisStatus,
} from './types'

// ============================================================================
// USERS
// ============================================================================

export const MOCK_USER: User = {
  id: 'usr_mock_001',
  name: 'João Silva',
  email: 'joao.silva@metro.sp.gov.br',
  role: 'inspector',
}

// ============================================================================
// DASHBOARD
// ============================================================================

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  total_projects: 5,
  total_evidences: 23,
  total_issues: 8,
}

// ============================================================================
// PROJECTS
// ============================================================================

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'prj_mock_001',
    name: 'Estação Vila Prudente - Reforma',
    location: 'Av. Prof. Luiz Ignácio Anhaia Mello, 3000',
    status: 'active',
    created_at: '2025-10-15T10:30:00Z',
    updated_at: '2025-11-05T14:20:00Z',
    evidence_count: 12,
    issues_count: 4,
  },
  {
    id: 'prj_mock_002',
    name: 'Linha 6-Laranja - Trecho Norte',
    location: 'Estação Brasilândia',
    status: 'active',
    created_at: '2025-09-20T09:00:00Z',
    updated_at: '2025-11-04T16:45:00Z',
    evidence_count: 8,
    issues_count: 2,
  },
  {
    id: 'prj_mock_003',
    name: 'Expansão Terminal Jabaquara',
    location: 'Terminal Jabaquara',
    status: 'paused',
    created_at: '2025-08-10T11:15:00Z',
    updated_at: '2025-10-30T10:00:00Z',
    evidence_count: 3,
    issues_count: 1,
  },
  {
    id: 'prj_mock_004',
    name: 'Estação Pinheiros - Acessibilidade',
    location: 'Estação Pinheiros - Linha 4',
    status: 'completed',
    created_at: '2025-07-01T08:00:00Z',
    updated_at: '2025-10-15T17:30:00Z',
    evidence_count: 0,
    issues_count: 1,
  },
  {
    id: 'prj_mock_005',
    name: 'Manutenção Preventiva - Linha 1',
    location: 'Estação Sé',
    status: 'active',
    created_at: '2025-11-01T07:30:00Z',
    updated_at: '2025-11-05T12:00:00Z',
    evidence_count: 0,
    issues_count: 0,
  },
]

// ============================================================================
// EVIDENCE
// ============================================================================

export const MOCK_EVIDENCES: Record<string, Evidence[]> = {
  prj_mock_001: [
    {
      id: 'evi_mock_001',
      project_id: 'prj_mock_001',
      file_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200',
      description: 'Rachadura na parede do corredor principal',
      status: 'completed',
      uploaded_at: '2025-11-05T14:22:00Z',
      analyzed_at: '2025-11-05T14:25:30Z',
      issues_count: 2,
    },
    {
      id: 'evi_mock_002',
      project_id: 'prj_mock_001',
      file_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200',
      description: 'Infiltração no teto da plataforma',
      status: 'completed',
      uploaded_at: '2025-11-04T10:15:00Z',
      analyzed_at: '2025-11-04T10:18:45Z',
      issues_count: 1,
    },
    {
      id: 'evi_mock_003',
      project_id: 'prj_mock_001',
      file_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=200',
      description: 'Piso irregular próximo à escada rolante',
      status: 'pending',
      uploaded_at: '2025-11-05T16:40:00Z',
      issues_count: 0,
    },
    {
      id: 'evi_mock_004',
      project_id: 'prj_mock_001',
      file_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200',
      description: 'Instalação elétrica aparente',
      status: 'error',
      uploaded_at: '2025-11-03T09:30:00Z',
      analyzed_at: '2025-11-03T09:33:15Z',
      issues_count: 0,
    },
  ],
  prj_mock_002: [
    {
      id: 'evi_mock_005',
      project_id: 'prj_mock_002',
      file_url: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800',
      thumbnail_url: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=200',
      description: 'Estrutura de concreto da estação',
      status: 'completed',
      uploaded_at: '2025-11-02T11:20:00Z',
      analyzed_at: '2025-11-02T11:23:10Z',
      issues_count: 1,
    },
  ],
}

// ============================================================================
// ISSUES
// ============================================================================

export const MOCK_ISSUES: Record<string, Issue[]> = {
  evi_mock_001: [
    {
      id: 'iss_mock_001',
      type: 'structural_crack',
      description: 'Rachadura estrutural detectada na parede de concreto, comprimento estimado em 80cm',
      confidence: 0.87,
      severity: 'high',
    },
    {
      id: 'iss_mock_002',
      type: 'paint_damage',
      description: 'Descascamento de pintura em área de 2m²',
      confidence: 0.72,
      severity: 'low',
    },
  ],
  evi_mock_002: [
    {
      id: 'iss_mock_003',
      type: 'water_damage',
      description: 'Manchas de umidade e possível infiltração no teto',
      confidence: 0.91,
      severity: 'high',
    },
  ],
  evi_mock_005: [
    {
      id: 'iss_mock_004',
      type: 'surface_irregularity',
      description: 'Superfície de concreto irregular com ondulações',
      confidence: 0.65,
      severity: 'medium',
    },
  ],
}

// ============================================================================
// REPORTS
// ============================================================================

export const MOCK_REPORTS: Record<string, Report> = {
  prj_mock_001: {
    project_id: 'prj_mock_001',
    url: 'https://example.com/reports/prj_mock_001.pdf',
    format: 'pdf',
    generated_at: '2025-11-05T18:00:00Z',
    file_size: 2458624, // ~2.3 MB
  },
  prj_mock_002: {
    project_id: 'prj_mock_002',
    url: 'https://example.com/reports/prj_mock_002.pdf',
    format: 'pdf',
    generated_at: '2025-11-04T20:30:00Z',
    file_size: 1843200, // ~1.7 MB
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get project by ID
 */
export function getMockProject(id: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.id === id)
}

/**
 * Get project detail with evidences
 */
export function getMockProjectDetail(id: string): ProjectDetail | undefined {
  const project = getMockProject(id)
  if (!project) return undefined
  
  const evidences = (MOCK_EVIDENCES[id] || []).map((e) => ({
    id: e.id,
    thumbnail_url: e.thumbnail_url,
    status: e.status,
    issues_count: e.issues_count || 0,
    uploaded_at: e.uploaded_at,
  }))
  
  return {
    ...project,
    evidences,
  }
}

/**
 * Get evidence by ID
 */
export function getMockEvidence(id: string): Evidence | undefined {
  for (const evidences of Object.values(MOCK_EVIDENCES)) {
    const evidence = evidences.find((e) => e.id === id)
    if (evidence) return evidence
  }
  return undefined
}

/**
 * Get evidence detail with issues
 */
export function getMockEvidenceDetail(id: string): EvidenceDetail | undefined {
  const evidence = getMockEvidence(id)
  if (!evidence) return undefined
  
  const issues = MOCK_ISSUES[id] || []
  
  return {
    ...evidence,
    issues,
  }
}

/**
 * Get evidences for a project
 */
export function getMockProjectEvidences(projectId: string): Evidence[] {
  return MOCK_EVIDENCES[projectId] || []
}

/**
 * Get report for a project
 */
export function getMockReport(projectId: string): Report | undefined {
  return MOCK_REPORTS[projectId]
}

/**
 * Simulate upload evidence (adds to mock data)
 */
export function mockUploadEvidence(
  projectId: string,
  file: File,
  description?: string
): Evidence {
  const newEvidence: Evidence = {
    id: `evi_mock_${Date.now()}`,
    project_id: projectId,
    file_url: URL.createObjectURL(file),
    thumbnail_url: URL.createObjectURL(file),
    description: description || null,
    status: 'pending' as AnalysisStatus,
    uploaded_at: new Date().toISOString(),
    issues_count: 0,
  }
  
  if (!MOCK_EVIDENCES[projectId]) {
    MOCK_EVIDENCES[projectId] = []
  }
  MOCK_EVIDENCES[projectId].push(newEvidence)
  
  return newEvidence
}

/**
 * Simulate create project (adds to mock data)
 */
export function mockCreateProject(
  name: string,
  location: string,
  status: 'active' | 'paused' | 'completed' | 'archived' = 'active'
): Project {
  const newProject: Project = {
    id: `prj_mock_${Date.now()}`,
    name,
    location,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    evidence_count: 0,
    issues_count: 0,
  }
  
  MOCK_PROJECTS.push(newProject)
  
  return newProject
}

/**
 * Simulate analysis trigger (updates evidence status)
 */
export function mockAnalyzeEvidence(evidenceId: string): void {
  for (const evidences of Object.values(MOCK_EVIDENCES)) {
    const evidence = evidences.find((e) => e.id === evidenceId)
    if (evidence) {
      evidence.status = 'processing' as AnalysisStatus
      
      // Simulate completion after 3 seconds
      setTimeout(() => {
        evidence.status = 'completed' as AnalysisStatus
        evidence.analyzed_at = new Date().toISOString()
        evidence.issues_count = 2
        
        // Add mock issues
        MOCK_ISSUES[evidenceId] = [
          {
            type: 'mock_issue',
            description: 'Issue detectada automaticamente (mock)',
            confidence: 0.85,
            severity: 'medium',
          },
        ]
      }, 3000)
      
      break
    }
  }
}
