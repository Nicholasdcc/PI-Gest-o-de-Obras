"""Ponto de entrada da aplicação FastAPI."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.interfaces.http.api import router as api_router


def create_app() -> FastAPI:
    """Cria instância configurada da aplicação."""

    settings = get_settings()
    app = FastAPI(title="Metro BIM Analyzer", version="0.1.0")
    
    # Configurar CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:3001"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Servir arquivos estáticos (uploads)
    app.mount(
        "/uploads",
        StaticFiles(directory=str(settings.app.uploads_path)),
        name="uploads"
    )
    
    app.include_router(api_router, prefix=settings.app.api_v1_prefix)
    return app


app = create_app()


