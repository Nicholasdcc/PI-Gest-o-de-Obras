/**
 * Exemplo de uso da API no front-end
 * 
 * Este arquivo mostra como usar as funções da API nos componentes React
 */

import { 
  getProjects, 
  createProject, 
  getProjectById,
  uploadEvidence,
  analyzeEvidence,
  getEvidence
} from '@/lib/api/endpoints'
import type { ProjectFormData } from '@/lib/api/types'

// ============================================================================
// EXEMPLO 1: Criar um projeto
// ============================================================================

async function exemploCreateProject() {
  try {
    const projectData: ProjectFormData = {
      name: "Edifício Residencial XYZ",
      location: "Rua ABC, 123 - São Paulo, SP",
      status: "active"
    }
    
    const newProject = await createProject(projectData)
    console.log("Projeto criado:", newProject.id)
    
    return newProject
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    throw error
  }
}

// ============================================================================
// EXEMPLO 2: Listar projetos
// ============================================================================

async function exemploListProjects() {
  try {
    const projects = await getProjects()
    console.log(`Total de projetos: ${projects.length}`)
    
    projects.forEach(project => {
      console.log(`- ${project.name} (${project.evidence_count} evidências)`)
    })
    
    return projects
  } catch (error) {
    console.error("Erro ao listar projetos:", error)
    throw error
  }
}

// ============================================================================
// EXEMPLO 3: Obter detalhes de um projeto
// ============================================================================

async function exemploGetProject(projectId: string) {
  try {
    const project = await getProjectById(projectId)
    console.log("Projeto:", project.name)
    console.log("Evidências:", project.evidences.length)
    
    return project
  } catch (error) {
    console.error("Erro ao obter projeto:", error)
    throw error
  }
}

// ============================================================================
// EXEMPLO 4: Upload de evidência (imagem)
// ============================================================================

async function exemploUploadEvidence(projectId: string, file: File) {
  try {
    const evidence = await uploadEvidence(
      projectId,
      file,
      "Foto da fachada principal"
    )
    
    console.log("Evidência enviada:", evidence.id)
    console.log("Status:", evidence.status) // Deve ser "pending"
    
    return evidence
  } catch (error) {
    console.error("Erro ao fazer upload:", error)
    throw error
  }
}

// ============================================================================
// EXEMPLO 5: Analisar evidência
// ============================================================================

async function exemploAnalyzeEvidence(evidenceId: string) {
  try {
    const response = await analyzeEvidence(evidenceId)
    console.log("Análise iniciada:", response.status)
    
    // Fazer polling para verificar quando a análise terminar
    let analyzing = true
    let attempts = 0
    const maxAttempts = 60 // 5 minutos
    
    while (analyzing && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Aguardar 5s
      
      const evidence = await getEvidence(evidenceId)
      console.log(`Status da análise: ${evidence.status}`)
      
      if (evidence.status === 'completed') {
        console.log("Análise concluída!")
        console.log(`Total de issues encontrados: ${evidence.issues_count}`)
        analyzing = false
        return evidence
      } else if (evidence.status === 'error') {
        throw new Error("Erro na análise")
      }
      
      attempts++
    }
    
    if (analyzing) {
      throw new Error("Timeout: análise demorou muito tempo")
    }
  } catch (error) {
    console.error("Erro ao analisar evidência:", error)
    throw error
  }
}

// ============================================================================
// EXEMPLO 6: Uso em componente React
// ============================================================================

/**
 * Exemplo de componente que cria um projeto
 */
function CreateProjectExample() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (formData: ProjectFormData) => {
    setLoading(true)
    setError(null)
    
    try {
      const project = await createProject(formData)
      console.log("Projeto criado:", project)
      // Redirecionar para a página do projeto ou mostrar mensagem de sucesso
      router.push(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar Projeto"}
      </button>
    </form>
  )
}

/**
 * Exemplo de componente que lista projetos
 */
function ProjectListExample() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error("Erro ao carregar projetos:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [])
  
  if (loading) return <div>Carregando...</div>
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.location}</p>
          <p>{project.evidence_count} evidências</p>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EXEMPLO 7: Upload com preview
// ============================================================================

function UploadEvidenceExample({ projectId }: { projectId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    try {
      const evidence = await uploadEvidence(projectId, file)
      console.log("Upload concluído:", evidence.id)
      
      // Iniciar análise automaticamente
      await analyzeEvidence(evidence.id)
    } catch (error) {
      console.error("Erro no upload:", error)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {file && (
        <div>
          <p>Arquivo selecionado: {file.name}</p>
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      )}
    </div>
  )
}

export {
  exemploCreateProject,
  exemploListProjects,
  exemploGetProject,
  exemploUploadEvidence,
  exemploAnalyzeEvidence,
}
