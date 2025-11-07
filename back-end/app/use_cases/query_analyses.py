"""Casos de uso para consulta de análises."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence
from uuid import UUID

from app.domain.entities import ProjectAnalysis
from app.domain.repositories import ProjectAnalysisRepository


@dataclass(slots=True)
class GetAnalysisInput:
    analysis_id: UUID


class GetAnalysisUseCase:
    def __init__(self, repository: ProjectAnalysisRepository) -> None:
        self._repository = repository

    async def execute(self, payload: GetAnalysisInput) -> ProjectAnalysis | None:
        return await self._repository.get_by_id(payload.analysis_id)


@dataclass(slots=True)
class ListAnalysesInput:
    limit: int = 20


class ListAnalysesUseCase:
    def __init__(self, repository: ProjectAnalysisRepository) -> None:
        self._repository = repository

    async def execute(self, payload: ListAnalysesInput) -> Sequence[ProjectAnalysis]:
        return await self._repository.list_recent(limit=payload.limit)

