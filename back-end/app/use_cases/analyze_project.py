"""Caso de uso para executar análises completas de um projeto."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.domain.entities import (
    AnalysisStatus,
    BimAnalysis,
    ImageAnalysis,
    ProjectAnalysis,
)
from app.domain.repositories import ProjectAnalysisRepository
from app.infrastructure import OpenAIService, OpenAIServiceError
from app.use_cases.exceptions import AnalysisExecutionError


@dataclass(slots=True)
class AnalyzeProjectInput:
    project_name: str
    bim_url: str
    image_url: str
    requested_by: Optional[str] = None
    context: Optional[str] = None


class AnalyzeProjectUseCase:
    """Orquestra os passos de análise BIM + imagem + comparação."""

    def __init__(
        self,
        *,
        repository: ProjectAnalysisRepository,
        ai_service: OpenAIService,
    ) -> None:
        self._repository = repository
        self._ai_service = ai_service

    async def execute(self, payload: AnalyzeProjectInput) -> ProjectAnalysis:
        analysis = ProjectAnalysis(
            project_name=payload.project_name,
            requested_by=payload.requested_by,
            bim_source_uri=payload.bim_url,
            image_source_uri=payload.image_url,
            status=AnalysisStatus.RUNNING,
        )

        analysis = await self._repository.create(analysis)

        try:
            bim_result = await self._perform_bim_analysis(analysis, payload)
            image_result = await self._perform_image_analysis(analysis, payload)
            comparison = await self._ai_service.compare_results(
                project_name=analysis.project_name,
                bim_analysis=bim_result,
                image_analysis=image_result,
            )
            analysis.mark_completed(bim_result, image_result, comparison)
            analysis = await self._repository.update(analysis)
            return analysis
        except (OpenAIServiceError, Exception) as exc:
            analysis.mark_failed(str(exc))
            await self._repository.update(analysis)
            raise AnalysisExecutionError("Falha ao executar análise completa") from exc

    async def _perform_bim_analysis(
        self, analysis: ProjectAnalysis, payload: AnalyzeProjectInput
    ) -> BimAnalysis:
        return await self._ai_service.analyze_bim(
            bim_url=payload.bim_url,
            project_context=payload.context,
        )

    async def _perform_image_analysis(
        self, analysis: ProjectAnalysis, payload: AnalyzeProjectInput
    ) -> ImageAnalysis:
        return await self._ai_service.analyze_image(
            image_url=payload.image_url,
            project_context=payload.context,
        )

