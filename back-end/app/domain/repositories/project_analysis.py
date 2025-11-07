"""Contratos de persistência para `ProjectAnalysis`."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Sequence
from uuid import UUID

from app.domain.entities import ProjectAnalysis


class ProjectAnalysisRepository(ABC):
    """Contrato para operações de leitura e escrita de análises."""

    @abstractmethod
    async def create(self, analysis: ProjectAnalysis) -> ProjectAnalysis:
        """Persiste uma nova análise no banco."""

    @abstractmethod
    async def update(self, analysis: ProjectAnalysis) -> ProjectAnalysis:
        """Atualiza os dados de uma análise existente."""

    @abstractmethod
    async def get_by_id(self, analysis_id: UUID) -> ProjectAnalysis | None:
        """Recupera análise pelo identificador."""

    @abstractmethod
    async def list_recent(self, limit: int = 20) -> Sequence[ProjectAnalysis]:
        """Retorna lista das análises mais recentes."""

