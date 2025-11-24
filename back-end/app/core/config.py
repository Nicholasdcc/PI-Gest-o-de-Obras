"""Configurações gerais da aplicação."""

from functools import lru_cache
from pathlib import Path
from typing import Annotated

from fastapi import Depends
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseSettings):
    """Configurações carregadas a partir de variáveis de ambiente."""

    model_config = SettingsConfigDict(env_prefix="APP_", env_file=".env", extra="ignore")

    environment: str = Field(default="development")
    api_v1_prefix: str = Field(default="/api/v1")

    mysql_user: str = Field(default="metro")
    mysql_password: str = Field(default="metro")
    mysql_host: str = Field(default="127.0.0.1")
    mysql_port: int = Field(default=3306)
    mysql_db: str = Field(default="metro_bim")
    uploads_dir: str = Field(default="storage/uploads")

    @property
    def database_url(self) -> str:
        return (
            f"mysql+aiomysql://{self.mysql_user}:{self.mysql_password}@"
            f"{self.mysql_host}:{self.mysql_port}/{self.mysql_db}"
        )

    @property
    def uploads_path(self) -> Path:
        return Path(self.uploads_dir)


class OpenAISettings(BaseSettings):
    """Configurações específicas para chamadas OpenAI."""

    model_config = SettingsConfigDict(extra="ignore")

    api_key: str = Field(default="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")
    model_bim: str = Field(default="gpt-4o-mini")
    model_image: str = Field(default="gpt-4o-mini")
    model_comparison: str = Field(default="gpt-4o-mini")
    timeout: int = Field(default=60)


class Settings(BaseSettings):
    """Container principal de configurações."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app: AppSettings = Field(default_factory=AppSettings)
    openai: OpenAISettings = Field(default_factory=OpenAISettings)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Recupera instância singleton das configurações."""

    return Settings()


SettingsDep = Annotated[Settings, Depends(get_settings)]

