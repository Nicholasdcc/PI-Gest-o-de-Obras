"""Implementação SQLAlchemy do repositório de análises."""

from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities import ProjectAnalysis
from app.domain.repositories import ProjectAnalysisRepository
from app.infrastructure.db import models
from app.infrastructure.db.mappers import (
    project_model_to_domain,
    update_project_model_from_entity,
)


class SQLAlchemyProjectAnalysisRepository(ProjectAnalysisRepository):
    """Repositório baseado em AsyncSession."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, analysis: ProjectAnalysis) -> ProjectAnalysis:
        model = models.ProjectAnalysisModel(id=analysis.id)
        update_project_model_from_entity(analysis, model)
        self._session.add(model)
        await self._session.flush()
        await self._session.commit()
        await self._session.refresh(model)
        return project_model_to_domain(model)

    async def update(self, analysis: ProjectAnalysis) -> ProjectAnalysis:
        model = await self._session.get(models.ProjectAnalysisModel, analysis.id)
        if model is None:
            raise ValueError("Análise não encontrada para atualização")
        update_project_model_from_entity(analysis, model)
        await self._session.flush()
        await self._session.commit()
        await self._session.refresh(model)
        return project_model_to_domain(model)

    async def get_by_id(self, analysis_id: UUID) -> ProjectAnalysis | None:
        stmt = (
            select(models.ProjectAnalysisModel)
            .options(
                selectinload(models.ProjectAnalysisModel.bim_analysis),
                selectinload(models.ProjectAnalysisModel.image_analysis),
                selectinload(models.ProjectAnalysisModel.comparison_result),
            )
            .where(models.ProjectAnalysisModel.id == analysis_id)
        )
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return project_model_to_domain(model)

    async def list_recent(self, limit: int = 20) -> Sequence[ProjectAnalysis]:
        stmt = (
            select(models.ProjectAnalysisModel)
            .options(
                selectinload(models.ProjectAnalysisModel.bim_analysis),
                selectinload(models.ProjectAnalysisModel.image_analysis),
                selectinload(models.ProjectAnalysisModel.comparison_result),
            )
            .order_by(models.ProjectAnalysisModel.created_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        models_list = result.scalars().all()
        return [project_model_to_domain(model) for model in models_list]

