"""Definição das rotas públicas da API."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.interfaces.http.dependencies import (
    get_file_storage,
    get_openai_service,
    get_repository,
)
from app.infrastructure import FileStorageError
from app.infrastructure.db.session import get_session
from app.infrastructure.db.models import ProjectModel, EvidenceModel, IssueModel, IfcModel, IfcElementModel, IfcComparisonModel
from app.infrastructure.services.ifc_processor import process_ifc_file
from app.infrastructure.services.evidence_processor import process_evidence_file
from app.interfaces.http.schemas import (
    ProjectAnalysisListResponse,
    ProjectAnalysisResponse,
    ProjectCreate,
    ProjectResponse,
    ProjectDetailResponse,
    EvidenceResponse,
    EvidenceDetailResponse,
    UploadEvidenceResponse,
    IfcModelResponse,
    UploadIfcResponse,
)
from app.use_cases import (
    AnalyzeProjectInput,
    AnalyzeProjectUseCase,
    AnalysisExecutionError,
    GetAnalysisInput,
    GetAnalysisUseCase,
    ListAnalysesInput,
    ListAnalysesUseCase,
)
from sqlalchemy import select, func

logger = logging.getLogger(__name__)


router = APIRouter()


def file_path_to_url(file_path: str, base_url: str = "http://localhost:8000") -> str:
    """
    Converte um caminho de arquivo relativo para uma URL completa.
    
    Args:
        file_path: Caminho do arquivo (pode ser relativo ou absoluto)
        base_url: URL base da API
        
    Returns:
        URL completa para acessar o arquivo
    """
    from pathlib import Path
    from app.core.config import get_settings
    
    settings = get_settings()
    
    # Se for caminho absoluto, extrair apenas a parte relativa ao uploads_path
    if Path(file_path).is_absolute():
        try:
            relative_path = Path(file_path).relative_to(settings.app.uploads_path)
            return f"{base_url}/uploads/{relative_path}"
        except ValueError:
            # Se não conseguir extrair caminho relativo, retornar o original
            return file_path
    
    # Se já for relativo, construir URL
    return f"{base_url}/uploads/{file_path}"


# ============================================================================
# AUTH ENDPOINTS (MOCK)
# ============================================================================

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/login", summary="Login mockado")
async def login(credentials: LoginRequest):
    """Login mockado - sempre aceita admin@example.com com senha 12345678."""
    
    if credentials.email == "admin@example.com" and credentials.password == "12345678":
        return {
            "access_token": "mock_token_admin",
            "token_type": "bearer",
            "user": {
                "id": "admin-user-id",
                "email": "admin@example.com",
                "name": "Administrator"
            }
        }
    
    raise HTTPException(status_code=401, detail="Email ou senha inválidos")


@router.get("/health", summary="Verifica se o serviço está operacional")
async def healthcheck() -> dict[str, str]:
    """Endpoint simples para monitoramento."""

    return {"status": "ok"}


@router.get("/dashboard/summary", summary="Obtém resumo do dashboard")
async def get_dashboard_summary(db: AsyncSession = Depends(get_session)):
    """Retorna estatísticas gerais do dashboard."""
    
    # Contar projetos
    projects_result = await db.execute(select(func.count(ProjectModel.id)))
    total_projects = projects_result.scalar() or 0
    
    # Contar evidências
    evidences_result = await db.execute(select(func.count(EvidenceModel.id)))
    total_evidences = evidences_result.scalar() or 0
    
    # Contar issues
    issues_result = await db.execute(select(func.count(IssueModel.id)))
    total_issues = issues_result.scalar() or 0
    
    return {
        "total_projects": total_projects,
        "total_evidences": total_evidences,
        "total_issues": total_issues,
    }


@router.post(
    "/analyses",
    response_model=ProjectAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Executa a análise completa de BIM e imagem",
)
async def run_analysis(
    project_name: str = Form(...),
    requested_by: str | None = Form(default=None),
    context: str | None = Form(default=None),
    bim_file: UploadFile = File(...),
    image_files: list[UploadFile] = File(...),
    repository=Depends(get_repository),
    ai_service=Depends(get_openai_service),
    storage=Depends(get_file_storage),
):
    if not image_files:
        raise HTTPException(status_code=422, detail="Ao menos uma imagem deve ser enviada")

    run_id = str(uuid4())
    try:
        bim_path = await storage.save_upload_file(bim_file, subdir=f"{run_id}/bim")
        image_paths = await storage.save_upload_files(image_files, subdir=f"{run_id}/images")
    except FileStorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    use_case = AnalyzeProjectUseCase(repository=repository, ai_service=ai_service)
    try:
        result = await use_case.execute(
            AnalyzeProjectInput(
                project_name=project_name,
                requested_by=requested_by,
                context=context,
                bim_file_path=bim_path,
                image_file_paths=tuple(image_paths),
            )
        )
        return ProjectAnalysisResponse.from_entity(result)
    except AnalysisExecutionError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get(
    "/analyses/{analysis_id}",
    response_model=ProjectAnalysisResponse,
    summary="Recupera resultado detalhado por ID",
)
async def get_analysis(
    analysis_id: str,
    repository=Depends(get_repository),
):
    try:
        analysis_uuid = UUID(analysis_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="`analysis_id` deve ser um UUID válido") from exc

    use_case = GetAnalysisUseCase(repository=repository)
    result = await use_case.execute(GetAnalysisInput(analysis_id=analysis_uuid))
    if result is None:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    return ProjectAnalysisResponse.from_entity(result)


@router.get(
    "/analyses",
    response_model=ProjectAnalysisListResponse,
    summary="Lista histórico recente de análises",
)
async def list_analyses(
    limit: int = Query(default=20, ge=1, le=100),
    repository=Depends(get_repository),
):
    use_case = ListAnalysesUseCase(repository=repository)
    result = await use_case.execute(ListAnalysesInput(limit=limit))
    return ProjectAnalysisListResponse.from_entities(result)


# ============================================================================
# PROJECT ENDPOINTS
# ============================================================================

@router.get("/projects", response_model=list[ProjectResponse], summary="Lista todos os projetos")
async def get_projects(db: AsyncSession = Depends(get_session)):
    """Lista todos os projetos com contadores de evidências e issues."""
    result = await db.execute(
        select(
            ProjectModel,
            func.count(EvidenceModel.id.distinct()).label("evidence_count"),
            func.count(IssueModel.id.distinct()).label("issues_count"),
        )
        .outerjoin(EvidenceModel, ProjectModel.id == EvidenceModel.project_id)
        .outerjoin(IssueModel, EvidenceModel.id == IssueModel.evidence_id)
        .group_by(ProjectModel.id)
    )
    
    projects = []
    for row in result:
        project = row[0]
        project_dict = {
            "id": project.id,
            "name": project.name,
            "location": project.location,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "evidence_count": row[1] or 0,
            "issues_count": row[2] or 0,
        }
        projects.append(ProjectResponse(**project_dict))
    
    return projects


@router.get("/projects/{project_id}", response_model=ProjectDetailResponse, summary="Obtém projeto por ID")
async def get_project(project_id: str, db: AsyncSession = Depends(get_session)):
    """Obtém detalhes de um projeto específico."""
    try:
        project_uuid = UUID(project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do projeto deve ser um UUID válido") from exc
    
    result = await db.execute(
        select(ProjectModel).where(ProjectModel.id == project_uuid)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    # Contar evidências e issues
    evidence_result = await db.execute(
        select(func.count(EvidenceModel.id)).where(EvidenceModel.project_id == project_uuid)
    )
    evidence_count = evidence_result.scalar() or 0
    
    issues_result = await db.execute(
        select(func.count(IssueModel.id))
        .join(EvidenceModel, IssueModel.evidence_id == EvidenceModel.id)
        .where(EvidenceModel.project_id == project_uuid)
    )
    issues_count = issues_result.scalar() or 0
    
    # Buscar evidências com contadores
    evidences_result = await db.execute(
        select(
            EvidenceModel,
            func.count(IssueModel.id).label("issues_count")
        )
        .outerjoin(IssueModel, EvidenceModel.id == IssueModel.evidence_id)
        .where(EvidenceModel.project_id == project_uuid)
        .group_by(EvidenceModel.id)
    )
    
    evidence_summaries = []
    for row in evidences_result:
        evidence = row[0]
        evidence_summaries.append({
            "id": evidence.id,
            "thumbnail_url": file_path_to_url(evidence.thumbnail_url) if evidence.thumbnail_url else None,
            "status": evidence.status,
            "issues_count": row[1] or 0,
            "uploaded_at": evidence.uploaded_at,
        })
    
    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        location=project.location,
        status=project.status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        evidence_count=evidence_count,
        issues_count=issues_count,
        evidences=evidence_summaries,
    )


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED, summary="Cria novo projeto")
async def create_project(project: ProjectCreate, db: AsyncSession = Depends(get_session)):
    """Cria um novo projeto."""
    new_project = ProjectModel(
        name=project.name,
        location=project.location,
        status=project.status,
    )
    
    db.add(new_project)
    await db.commit()
    await db.refresh(new_project)
    
    return ProjectResponse(
        id=new_project.id,
        name=new_project.name,
        location=new_project.location,
        status=new_project.status,
        created_at=new_project.created_at,
        updated_at=new_project.updated_at,
        evidence_count=0,
        issues_count=0,
    )


# ============================================================================
# EVIDENCE ENDPOINTS
# ============================================================================

@router.get("/projects/{project_id}/evidences", response_model=list[EvidenceResponse], summary="Lista evidências do projeto")
async def get_project_evidences(project_id: str, db: AsyncSession = Depends(get_session)):
    """Lista todas as evidências de um projeto."""
    try:
        project_uuid = UUID(project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do projeto deve ser um UUID válido") from exc
    
    # Verificar se projeto existe
    project_result = await db.execute(
        select(ProjectModel).where(ProjectModel.id == project_uuid)
    )
    if not project_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    # Buscar evidências com contadores
    result = await db.execute(
        select(
            EvidenceModel,
            func.count(IssueModel.id).label("issues_count")
        )
        .outerjoin(IssueModel, EvidenceModel.id == IssueModel.evidence_id)
        .where(EvidenceModel.project_id == project_uuid)
        .group_by(EvidenceModel.id)
    )
    
    evidences = []
    for row in result:
        evidence = row[0]
        evidences.append(EvidenceResponse(
            id=evidence.id,
            project_id=evidence.project_id,
            file_url=file_path_to_url(evidence.file_url),
            thumbnail_url=file_path_to_url(evidence.thumbnail_url) if evidence.thumbnail_url else None,
            description=evidence.description,
            status=evidence.status,
            uploaded_at=evidence.uploaded_at,
            analyzed_at=evidence.analyzed_at,
            issues_count=row[1] or 0,
        ))
    
    return evidences


@router.post("/projects/{project_id}/evidences", response_model=UploadEvidenceResponse, status_code=status.HTTP_201_CREATED, summary="Faz upload de evidência")
async def upload_evidence(
    project_id: str,
    file: UploadFile = File(...),
    description: str | None = Form(default=None),
    db: AsyncSession = Depends(get_session),
    storage=Depends(get_file_storage),
    ai_service=Depends(get_openai_service),
):
    """Faz upload de uma evidência (imagem) para um projeto e inicia análise automática."""
    try:
        project_uuid = UUID(project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do projeto deve ser um UUID válido") from exc
    
    # Verificar se projeto existe
    project_result = await db.execute(
        select(ProjectModel).where(ProjectModel.id == project_uuid)
    )
    if not project_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    # Salvar arquivo
    evidence_id = str(uuid4())
    try:
        file_path = await storage.save_upload_file(file, subdir=f"{project_id}/evidences")
    except FileStorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    
    # Criar evidência no banco
    new_evidence = EvidenceModel(
        id=UUID(evidence_id),
        project_id=project_uuid,
        file_url=file_path,
        description=description,
        status="pending",
    )
    
    db.add(new_evidence)
    await db.commit()
    await db.refresh(new_evidence)
    
    # NÃO iniciar análise automática - usuário deve clicar no botão
    logger.info(f"📷 Evidência {evidence_id} salva. Aguardando comando para análise.")
    
    return UploadEvidenceResponse(
        id=new_evidence.id,
        project_id=new_evidence.project_id,
        file_url=file_path_to_url(new_evidence.file_url),
        thumbnail_url=file_path_to_url(new_evidence.thumbnail_url) if new_evidence.thumbnail_url else None,
        description=new_evidence.description,
        status=new_evidence.status,
        uploaded_at=new_evidence.uploaded_at,
        analyzed_at=new_evidence.analyzed_at,
        issues_count=0,
    )


@router.get("/evidences/{evidence_id}", response_model=EvidenceDetailResponse, summary="Obtém evidência por ID")
async def get_evidence(evidence_id: str, db: AsyncSession = Depends(get_session)):
    """Obtém detalhes de uma evidência específica com seus issues."""
    try:
        evidence_uuid = UUID(evidence_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID da evidência deve ser um UUID válido") from exc
    
    result = await db.execute(
        select(EvidenceModel).where(EvidenceModel.id == evidence_uuid)
    )
    evidence = result.scalar_one_or_none()
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Buscar issues
    issues_result = await db.execute(
        select(IssueModel).where(IssueModel.evidence_id == evidence_uuid)
    )
    issues = issues_result.scalars().all()
    
    return EvidenceDetailResponse(
        id=evidence.id,
        project_id=evidence.project_id,
        file_url=file_path_to_url(evidence.file_url),
        thumbnail_url=file_path_to_url(evidence.thumbnail_url) if evidence.thumbnail_url else None,
        description=evidence.description,
        status=evidence.status,
        uploaded_at=evidence.uploaded_at,
        analyzed_at=evidence.analyzed_at,
        issues_count=len(issues),
        issues=[
            {
                "id": issue.id,
                "type": issue.type,
                "description": issue.description,
                "confidence": issue.confidence,
                "severity": issue.severity,
                "location": issue.location,
                "created_at": issue.created_at,
            }
            for issue in issues
        ],
    )


@router.post("/evidences/{evidence_id}/analyze", summary="Inicia análise de evidência")
async def analyze_evidence(
    evidence_id: str, 
    db: AsyncSession = Depends(get_session),
    ai_service = Depends(get_openai_service)
):
    """Inicia a análise de uma evidência usando OpenAI Vision."""
    try:
        evidence_uuid = UUID(evidence_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID da evidência deve ser um UUID válido") from exc
    
    result = await db.execute(
        select(EvidenceModel).where(EvidenceModel.id == evidence_uuid)
    )
    evidence = result.scalar_one_or_none()
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Permitir re-análise se já foi analisada ou se está travada em processing
    if evidence.status == "analyzed":
        logger.info(f"🔄 Re-análise solicitada para evidência {evidence_id}")
        evidence.status = "pending"
        await db.commit()
    elif evidence.status == "processing":
        # Se está em processing há mais de 5 minutos, permitir restart
        time_in_processing = datetime.utcnow() - evidence.uploaded_at
        if time_in_processing < timedelta(minutes=5):
            raise HTTPException(
                status_code=400, 
                detail=f"Evidência já está sendo processada há {int(time_in_processing.total_seconds())}s. Aguarde alguns minutos."
            )
        logger.warning(f"⚠️  Evidência {evidence_id} travada em processing. Reiniciando análise...")
        evidence.status = "pending"
        await db.commit()
    
    # Processar em background
    logger.info(f"🚀 Iniciando análise em background da evidência {evidence_id}")
    asyncio.create_task(
        process_evidence_file(evidence_uuid, evidence.file_url, ai_service)
    )
    
    return {
        "status": "processing",
        "message": "Análise iniciada. Acompanhe o status da evidência para ver o resultado."
    }


# ============================================================================
# IFC ENDPOINTS
# ============================================================================

@router.get("/projects/{project_id}/ifc", response_model=IfcModelResponse, summary="Obtém modelo IFC do projeto")
async def get_project_ifc(project_id: str, db: AsyncSession = Depends(get_session)):
    """Obtém o modelo IFC de um projeto."""
    try:
        project_uuid = UUID(project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do projeto deve ser um UUID válido") from exc
    
    # Buscar modelo IFC
    result = await db.execute(
        select(IfcModel).where(IfcModel.project_id == project_uuid)
    )
    ifc_model = result.scalar_one_or_none()
    
    if not ifc_model:
        raise HTTPException(status_code=404, detail="Modelo IFC não encontrado")
    
    return IfcModelResponse(
        id=ifc_model.id,
        project_id=ifc_model.project_id,
        status=ifc_model.status,
        schema=ifc_model.schema,
        elements_count=ifc_model.elements_count,
        uploaded_at=ifc_model.uploaded_at,
        processed_at=ifc_model.processed_at,
    )


@router.post("/projects/{project_id}/ifc", response_model=UploadIfcResponse, status_code=status.HTTP_201_CREATED, summary="Faz upload de arquivo IFC")
async def upload_ifc(
    project_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session),
    storage=Depends(get_file_storage),
):
    """Faz upload de um arquivo IFC para um projeto."""
    try:
        project_uuid = UUID(project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do projeto deve ser um UUID válido") from exc
    
    # Verificar se projeto existe
    project_result = await db.execute(
        select(ProjectModel).where(ProjectModel.id == project_uuid)
    )
    if not project_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    # Verificar se já existe um IFC para este projeto
    existing_result = await db.execute(
        select(IfcModel).where(IfcModel.project_id == project_uuid)
    )
    existing_ifc = existing_result.scalar_one_or_none()
    if existing_ifc:
        # Deletar o IFC existente (cascade vai deletar elementos e comparações)
        await db.delete(existing_ifc)
        await db.flush()
        logger.info(f"IFC existente {existing_ifc.id} removido para substituição")
    
    # Validar extensão do arquivo
    if not file.filename or not file.filename.lower().endswith('.ifc'):
        raise HTTPException(status_code=422, detail="Arquivo deve ser um IFC")
    
    # Salvar arquivo
    try:
        file_path = await storage.save_upload_file(file, subdir=f"{project_id}/ifc")
    except FileStorageError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    
    # Criar registro no banco
    new_ifc = IfcModel(
        project_id=project_uuid,
        file_url=file_path,
        status="processing",
    )
    
    db.add(new_ifc)
    await db.commit()
    await db.refresh(new_ifc)
    
    # Processar IFC em background (simplificado)
    # Em produção, isso deveria ser uma tarefa assíncrona (Celery, RQ, etc)
    import asyncio
    asyncio.create_task(process_ifc_background(new_ifc.id, file_path, db))
    
    return UploadIfcResponse(
        id=new_ifc.id,
        project_id=new_ifc.project_id,
        status=new_ifc.status,
        schema=new_ifc.schema,
        elements_count=new_ifc.elements_count,
        uploaded_at=new_ifc.uploaded_at,
        processed_at=new_ifc.processed_at,
    )


async def process_ifc_background(ifc_id: UUID, file_path: str, db: AsyncSession):
    """Processa o IFC em background usando ifcopenshell e OpenAI."""
    try:
        await asyncio.sleep(1)  # Pequeno delay para garantir commit
        
        # Processar arquivo IFC
        from app.infrastructure.db.session import SessionFactory
        async with SessionFactory() as session:
            # Opcionalmente usar AI service
            # ai_service = get_openai_service()
            await process_ifc_file(ifc_id, file_path, session, ai_service=None)
            
    except Exception as e:
        logger.error(f"Erro ao processar IFC {ifc_id}: {e}")


@router.get("/ifc/{ifc_id}/elements", summary="Lista elementos do modelo IFC")
async def get_ifc_elements(ifc_id: str, db: AsyncSession = Depends(get_session)):
    """Lista os elementos de um modelo IFC."""
    try:
        ifc_uuid = UUID(ifc_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do IFC deve ser um UUID válido") from exc
    
    # Verificar se IFC existe
    result = await db.execute(
        select(IfcModel).where(IfcModel.id == ifc_uuid)
    )
    ifc_model = result.scalar_one_or_none()
    
    if not ifc_model:
        raise HTTPException(status_code=404, detail="Modelo IFC não encontrado")
    
    if ifc_model.status != "ready":
        raise HTTPException(status_code=400, detail="Modelo IFC ainda não está pronto")
    
    # TODO: Implementar leitura real dos elementos do arquivo IFC
    # Por enquanto, retornar elementos mockados
    mock_elements = [
        {"id": "1a2b3c", "name": "Parede Externa Norte", "category": "IfcWall", "code": "W-001"},
        {"id": "2b3c4d", "name": "Laje Piso Térreo", "category": "IfcSlab", "code": "S-001"},
        {"id": "3c4d5e", "name": "Viga Estrutural V1", "category": "IfcBeam", "code": "B-001"},
        {"id": "4d5e6f", "name": "Coluna C1", "category": "IfcColumn", "code": "C-001"},
        {"id": "5e6f7g", "name": "Porta Principal", "category": "IfcDoor", "code": "D-001"},
    ]
    
    return mock_elements


@router.get("/ifc/{ifc_id}/comparisons", summary="Lista comparações do modelo IFC")
async def get_ifc_comparisons(ifc_id: str, db: AsyncSession = Depends(get_session)):
    """Lista as comparações realizadas em um modelo IFC."""
    try:
        ifc_uuid = UUID(ifc_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do IFC deve ser um UUID válido") from exc
    
    # Verificar se IFC existe
    result = await db.execute(
        select(IfcModel).where(IfcModel.id == ifc_uuid)
    )
    ifc_model = result.scalar_one_or_none()
    
    if not ifc_model:
        raise HTTPException(status_code=404, detail="Modelo IFC não encontrado")
    
    # TODO: Implementar comparações reais
    # Por enquanto, retornar comparações mockadas
    mock_comparisons = [
        {
            "id": "comp-1",
            "type": "dimensional",
            "description": "Espessura da parede W-001 está 5cm menor que o especificado",
            "severity": "medium"
        },
        {
            "id": "comp-2",
            "type": "material",
            "description": "Material da laje S-001 não corresponde ao projeto",
            "severity": "high"
        },
    ]
    
    return mock_comparisons


@router.get("/projects/{project_id}/ifc/elements", summary="Lista elementos do IFC por projeto")
async def get_project_ifc_elements(project_id: str, db: AsyncSession = Depends(get_session)):
    """Lista os elementos do IFC de um projeto."""
    try:
        project_uuid = UUID(project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do projeto deve ser um UUID válido") from exc
    
    # Buscar IFC do projeto
    result = await db.execute(
        select(IfcModel).where(IfcModel.project_id == project_uuid)
    )
    ifc_model = result.scalar_one_or_none()
    
    if not ifc_model:
        raise HTTPException(status_code=404, detail="Projeto não possui modelo IFC")
    
    if ifc_model.status != "ready":
        raise HTTPException(status_code=400, detail="Modelo IFC ainda não está pronto")
    
    # Buscar elementos do banco
    elements_result = await db.execute(
        select(IfcElementModel).where(IfcElementModel.ifc_model_id == ifc_model.id)
    )
    elements = elements_result.scalars().all()
    
    return [
        {
            "id": elem.ifc_id,
            "name": elem.name,
            "category": elem.category,
            "code": elem.code
        }
        for elem in elements
    ]


@router.get("/projects/{project_id}/ifc/comparisons", summary="Lista comparações do IFC por projeto")
async def get_project_ifc_comparisons(project_id: str, db: AsyncSession = Depends(get_session)):
    """Lista as comparações do IFC de um projeto."""
    try:
        project_uuid = UUID(project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="ID do projeto deve ser um UUID válido") from exc
    
    # Buscar IFC do projeto
    result = await db.execute(
        select(IfcModel).where(IfcModel.project_id == project_uuid)
    )
    ifc_model = result.scalar_one_or_none()
    
    if not ifc_model:
        raise HTTPException(status_code=404, detail="Projeto não possui modelo IFC")
    
    # Buscar comparações do banco
    comparisons_result = await db.execute(
        select(IfcComparisonModel).where(IfcComparisonModel.ifc_model_id == ifc_model.id)
    )
    comparisons = comparisons_result.scalars().all()
    
    return [
        {
            "id": str(comp.id),
            "type": comp.type,
            "description": comp.description,
            "severity": comp.severity
        }
        for comp in comparisons
    ]


# ============================================================================
# REPORTS
# ============================================================================

@router.post("/projects/{project_id}/reports/generate", summary="Gera relatório do projeto")
async def generate_report(
    project_id: UUID,
    db: AsyncSession = Depends(get_session)
):
    """Gera um relatório consolidado do projeto com evidências e IFC."""
    
    # Busca o projeto
    result = await db.execute(
        select(ProjectModel).where(ProjectModel.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    # Busca evidências com issues
    result = await db.execute(
        select(EvidenceModel).where(EvidenceModel.project_id == project_id)
    )
    evidences = result.scalars().all()
    
    # Busca IFC models
    result = await db.execute(
        select(IfcModel).where(IfcModel.project_id == project_id)
    )
    ifc_models = result.scalars().all()
    
    # Busca todos os issues
    result = await db.execute(
        select(IssueModel).where(IssueModel.evidence_id.in_([e.id for e in evidences]))
    )
    issues = result.scalars().all()
    
    # Conta estatísticas
    total_evidences = len(evidences)
    total_issues = len(issues)
    critical_issues = sum(1 for i in issues if i.severity == "critical")
    high_issues = sum(1 for i in issues if i.severity == "high")
    
    report = {
        "id": str(uuid4()),
        "project_id": str(project_id),
        "project_name": project.name,
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "total_evidences": total_evidences,
            "total_issues": total_issues,
            "critical_issues": critical_issues,
            "high_issues": high_issues,
            "ifc_models_count": len(ifc_models)
        },
        "evidences": [
            {
                "id": str(e.id),
                "file_url": e.file_url,
                "uploaded_at": e.uploaded_at.isoformat() if e.uploaded_at else None,
                "status": e.status,
                "issues_count": sum(1 for i in issues if i.evidence_id == e.id)
            }
            for e in evidences
        ],
        "issues": [
            {
                "id": str(i.id),
                "type": i.type,
                "description": i.description,
                "severity": i.severity,
                "confidence": i.confidence,
                "location": i.location
            }
            for i in issues
        ],
        "ifc_models": [
            {
                "id": str(ifc.id),
                "file_url": ifc.file_url,
                "schema": ifc.schema,
                "status": ifc.status,
                "elements_count": ifc.elements_count
            }
            for ifc in ifc_models
        ]
    }
    
    return report


@router.get("/projects/{project_id}/reports/latest", summary="Obtém último relatório do projeto")
async def get_latest_report(
    project_id: UUID,
    db: AsyncSession = Depends(get_session)
):
    """Retorna o último relatório gerado (ou gera um novo)."""
    from pathlib import Path
    
    # Gera um novo relatório
    report = await generate_report(project_id, db)
    
    # Define caminho do PDF
    reports_dir = Path("storage/reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    pdf_filename = f"relatorio-{project_id}.pdf"
    pdf_path = reports_dir / pdf_filename
    
    # Gera o PDF
    from app.infrastructure.services.pdf_generator import generate_project_report_pdf
    generate_project_report_pdf(report, pdf_path)
    
    # Adiciona URL para download e visualização
    report["url"] = f"http://localhost:8000/reports/{pdf_filename}"
    report["download_url"] = f"/api/v1/projects/{project_id}/reports/download"
    report["format"] = "pdf"
    report["file_size"] = pdf_path.stat().st_size
    
    return report


@router.get("/projects/{project_id}/reports/download", summary="Download do relatório em PDF")
async def download_report(
    project_id: UUID,
    db: AsyncSession = Depends(get_session)
):
    """Gera e retorna o relatório em PDF para download."""
    from pathlib import Path
    from fastapi.responses import FileResponse
    from app.infrastructure.services.pdf_generator import generate_project_report_pdf
    
    # Gera dados do relatório
    report = await generate_report(project_id, db)
    
    # Define caminho do PDF
    reports_dir = Path("storage/reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    pdf_filename = f"relatorio-{project_id}.pdf"
    pdf_path = reports_dir / pdf_filename
    
    # Gera o PDF
    generate_project_report_pdf(report, pdf_path)
    
    # Retorna o arquivo PDF
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=pdf_filename,
        headers={
            "Content-Disposition": f"attachment; filename={pdf_filename}"
        }
    )

