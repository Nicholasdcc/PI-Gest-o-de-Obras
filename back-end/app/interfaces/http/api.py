"""Definição das rotas públicas da API."""

from __future__ import annotations

from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.interfaces.http.dependencies import (
    get_file_storage,
    get_openai_service,
    get_repository,
)
from app.infrastructure import FileStorageError
from app.interfaces.http.schemas import ProjectAnalysisListResponse, ProjectAnalysisResponse
from app.use_cases import (
    AnalyzeProjectInput,
    AnalyzeProjectUseCase,
    AnalysisExecutionError,
    GetAnalysisInput,
    GetAnalysisUseCase,
    ListAnalysesInput,
    ListAnalysesUseCase,
)


router = APIRouter()


@router.get("/health", summary="Verifica se o serviço está operacional")
async def healthcheck() -> dict[str, str]:
    """Endpoint simples para monitoramento."""

    return {"status": "ok"}


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
    analysis_id: UUID,
    repository=Depends(get_repository),
):
    use_case = GetAnalysisUseCase(repository=repository)
    result = await use_case.execute(GetAnalysisInput(analysis_id=analysis_id))
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

