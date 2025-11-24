"""Dependências compartilhadas para as rotas HTTP."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import SettingsDep
from app.infrastructure import (
    LocalFileStorage,
    OpenAIService,
    OpenAIServiceError,
    SQLAlchemyProjectAnalysisRepository,
)
from app.infrastructure.db.session import get_session


def get_repository(
    session: Annotated[AsyncSession, Depends(get_session)]
) -> SQLAlchemyProjectAnalysisRepository:
    return SQLAlchemyProjectAnalysisRepository(session=session)


def get_openai_service(settings: SettingsDep) -> OpenAIService:
    try:
        return OpenAIService(settings=settings)
    except OpenAIServiceError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


def get_file_storage(settings: SettingsDep) -> LocalFileStorage:
    return LocalFileStorage(base_path=settings.app.uploads_path)

