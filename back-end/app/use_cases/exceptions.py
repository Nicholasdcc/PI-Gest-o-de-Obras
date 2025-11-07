"""Exceções para camada de casos de uso."""


class UseCaseError(Exception):
    """Erro genérico dentro de um caso de uso."""


class AnalysisExecutionError(UseCaseError):
    """Falha ao executar fluxos de análise."""

