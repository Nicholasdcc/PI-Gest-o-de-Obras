"""Exceções específicas para integrações externas."""


class ExternalServiceError(Exception):
    """Erro genérico para falhas em serviços externos."""


class OpenAIServiceError(ExternalServiceError):
    """Falha ao processar resposta da API OpenAI."""

    def __init__(self, message: str, *, raw_output: str | None = None) -> None:
        super().__init__(message)
        self.raw_output = raw_output

