"""Ponto de entrada da aplicação FastAPI."""

from fastapi import FastAPI

from app.core.config import get_settings
from app.interfaces.http.api import router as api_router


def create_app() -> FastAPI:
    """Cria instância configurada da aplicação."""

    settings = get_settings()
    app = FastAPI(title="Metro BIM Analyzer", version="0.1.0")
    app.include_router(api_router, prefix=settings.app.api_v1_prefix)
    return app


app = create_app()

