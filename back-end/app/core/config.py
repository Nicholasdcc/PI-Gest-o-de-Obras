"""Configurações gerais da aplicação."""

from functools import lru_cache
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
    mysql_host: str = Field(default="mysql")
    mysql_port: int = Field(default=3306)
    mysql_db: str = Field(default="metro_bim")

    @property
    def database_url(self) -> str:
        return (
            f"mysql+aiomysql://{self.mysql_user}:{self.mysql_password}@"
            f"{self.mysql_host}:{self.mysql_port}/{self.mysql_db}"
        )


class OpenAISettings(BaseSettings):
    """Configurações específicas para chamadas OpenAI."""

    model_config = SettingsConfigDict(env_prefix="OPENAI_", env_file=".env", extra="ignore")

    api_key: str = Field(default="")
    model_bim: str = Field(default="gpt-4.1")
    model_image: str = Field(default="gpt-4.1-mini")
    model_comparison: str = Field(default="gpt-4.1-mini")
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

