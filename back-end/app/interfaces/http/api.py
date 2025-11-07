"""Definição das rotas públicas da API."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.interfaces.http.dependencies import get_openai_service, get_repository
from app.interfaces.http.schemas import (
    AnalyzeProjectPayload,
    ProjectAnalysisListResponse,
    ProjectAnalysisResponse,
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
    payload: AnalyzeProjectPayload,
    repository=Depends(get_repository),
    ai_service=Depends(get_openai_service),
):
    use_case = AnalyzeProjectUseCase(repository=repository, ai_service=ai_service)
    try:
        result = await use_case.execute(
            AnalyzeProjectInput(
                project_name=payload.project_name,
                bim_url=str(payload.bim_url),
                image_url=str(payload.image_url),
                requested_by=payload.requested_by,
                context=payload.context,
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

