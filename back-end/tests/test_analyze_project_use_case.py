"""Testes para o caso de uso de análise completa."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, Sequence
from uuid import UUID

import pytest

from app.domain.entities import (
    AnalysisStatus,
    BimAnalysis,
    ComparisonResult,
    DetectedIssue,
    ImageAnalysis,
    IssueSeverity,
    ProjectAnalysis,
)
from app.domain.repositories import ProjectAnalysisRepository
from app.use_cases import AnalyzeProjectInput, AnalyzeProjectUseCase
from app.use_cases.exceptions import AnalysisExecutionError


class InMemoryRepository(ProjectAnalysisRepository):
    def __init__(self) -> None:
        self._items: Dict[UUID, ProjectAnalysis] = {}

    async def create(self, analysis: ProjectAnalysis) -> ProjectAnalysis:
        analysis.created_at = datetime.now(timezone.utc)
        analysis.updated_at = analysis.created_at
        self._items[analysis.id] = analysis
        return analysis

    async def update(self, analysis: ProjectAnalysis) -> ProjectAnalysis:
        analysis.updated_at = datetime.now(timezone.utc)
        self._items[analysis.id] = analysis
        return analysis

    async def get_by_id(self, analysis_id: UUID) -> ProjectAnalysis | None:
        return self._items.get(analysis_id)

    async def list_recent(self, limit: int = 20) -> Sequence[ProjectAnalysis]:
        return list(self._items.values())[:limit]


class FakeOpenAIService:
    def __init__(self, fail: bool = False) -> None:
        self.fail = fail

    async def analyze_bim(self, *, bim_url: str, project_context: str | None = None) -> BimAnalysis:
        if self.fail:
            raise RuntimeError("boom")
        return BimAnalysis(
            bim_source_uri=bim_url,
            status=AnalysisStatus.COMPLETED,
            summary="Resumo BIM",
            issues=(DetectedIssue("Crack", IssueSeverity.MEDIUM, 0.8),),
        )

    async def analyze_image(
        self, *, image_url: str, project_context: str | None = None
    ) -> ImageAnalysis:
        return ImageAnalysis(
            image_source_uri=image_url,
            status=AnalysisStatus.COMPLETED,
            summary="Resumo imagem",
            issues=(DetectedIssue("Crack", IssueSeverity.MEDIUM, 0.7),),
        )

    async def compare_results(
        self,
        *,
        project_name: str,
        bim_analysis: BimAnalysis,
        image_analysis: ImageAnalysis,
    ) -> ComparisonResult:
        return ComparisonResult(
            summary="Tudo ok",
            similarity_score=0.9,
            completion_percentage=0.85,
            mismatches=("Detalhe X",),
        )


@pytest.mark.asyncio
async def test_analyze_project_use_case_success() -> None:
    repo = InMemoryRepository()
    service = FakeOpenAIService()
    use_case = AnalyzeProjectUseCase(repository=repo, ai_service=service)

    result = await use_case.execute(
        AnalyzeProjectInput(
            project_name="Reforma Estação",
            bim_url="https://example.com/file.bim",
            image_url="https://example.com/photo.jpg",
        )
    )

    assert result.status is AnalysisStatus.COMPLETED
    assert result.bim_analysis is not None
    assert result.image_analysis is not None
    assert result.comparison_result is not None
    assert result.bim_analysis.summary == "Resumo BIM"
    assert repo._items  # type: ignore[attr-defined]


@pytest.mark.asyncio
async def test_analyze_project_use_case_failure() -> None:
    repo = InMemoryRepository()
    service = FakeOpenAIService(fail=True)
    use_case = AnalyzeProjectUseCase(repository=repo, ai_service=service)

    with pytest.raises(AnalysisExecutionError):
        await use_case.execute(
            AnalyzeProjectInput(
                project_name="Reforma Estação",
                bim_url="https://example.com/file.bim",
                image_url="https://example.com/photo.jpg",
            )
        )

    stored = next(iter(repo._items.values()))  # type: ignore[attr-defined]
    assert stored.status is AnalysisStatus.FAILED

