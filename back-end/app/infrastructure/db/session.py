"""Gerenciamento de engine e sessões assíncronas."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings


def create_engine() -> AsyncEngine:
    """Cria engine assíncrona baseada nas configurações."""

    settings = get_settings()
    return create_async_engine(settings.app.database_url, echo=False, future=True)


engine: AsyncEngine = create_engine()
SessionFactory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


@asynccontextmanager
async def get_session_context() -> AsyncIterator[AsyncSession]:
    """Retorna sessão assíncrona para uso em dependências da API."""

    async with SessionFactory() as session:
        yield session


async def get_session() -> AsyncIterator[AsyncSession]:
    """Dependency para obter sessão do banco de dados."""
    async with SessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

