"""Cliente responsável por orquestrar prompts com o OpenAI."""

from __future__ import annotations

from collections.abc import Sequence

from openai import AsyncOpenAI
from openai.types.responses import Response

from app.core.config import Settings, get_settings
from app.domain.entities import (
    AnalysisStatus,
    BimAnalysis,
    ComparisonResult,
    DetectedIssue,
    ImageAnalysis,
    IssueSeverity,
)
from app.infrastructure.services.exceptions import OpenAIServiceError
from app.infrastructure.services.openai_schemas import (
    IssuePayload,
    BimAnalysisPayload,
    ComparisonPayload,
    ImageAnalysisPayload,
)


SYSTEM_PROMPT = (
    "Você é um assistente especializado em engenharia civil. Sempre responda em JSON válido conforme o schema fornecido."
)


class OpenAIService:
    """Serviço de alto nível para lidar com prompts específicos."""

    def __init__(
        self,
        *,
        client: AsyncOpenAI | None = None,
        settings: Settings | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        api_key = self._settings.openai.api_key
        if client is None:
            if not api_key:
                raise OpenAIServiceError("Chave da API OpenAI não configurada")
            client = AsyncOpenAI(api_key=api_key, timeout=self._settings.openai.timeout)
        self._client = client

    async def analyze_bim(self, *, bim_url: str, project_context: str | None = None) -> BimAnalysis:
        """Executa prompt para análise de arquivo BIM."""

        payload = await self._ask_openai(
            model=self._settings.openai.model_bim,
            user_prompt=self._bim_prompt(bim_url=bim_url, context=project_context),
        )
        parsed = BimAnalysisPayload.model_validate_json(payload)
        return self._to_bim_entity(parsed, source_uri=bim_url)

    async def analyze_image(self, *, image_url: str, project_context: str | None = None) -> ImageAnalysis:
        """Executa prompt para análise de imagem."""

        payload = await self._ask_openai(
            model=self._settings.openai.model_image,
            user_prompt=self._image_prompt(image_url=image_url, context=project_context),
        )
        parsed = ImageAnalysisPayload.model_validate_json(payload)
        return self._to_image_entity(parsed, source_uri=image_url)

    async def compare_results(
        self,
        *,
        project_name: str,
        bim_analysis: BimAnalysis,
        image_analysis: ImageAnalysis,
    ) -> ComparisonResult:
        """Compara os outputs consolidados."""

        payload = await self._ask_openai(
            model=self._settings.openai.model_comparison,
            user_prompt=self._comparison_prompt(
                project_name=project_name,
                bim_summary=bim_analysis.summary or "",
                image_summary=image_analysis.summary or "",
            ),
        )
        parsed = ComparisonPayload.model_validate_json(payload)
        return ComparisonResult(
            summary=parsed.summary,
            similarity_score=parsed.similarity_score,
            completion_percentage=parsed.completion_percentage,
            mismatches=tuple(parsed.mismatches),
        )

    async def _ask_openai(self, *, model: str, user_prompt: str) -> str:
        try:
            response: Response = await self._client.responses.create(
                model=model,
                input=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
            )
        except Exception as exc:  # pragma: no cover - erros de rede
            raise OpenAIServiceError("Falha na requisição ao OpenAI") from exc

        text = self._extract_text(response)
        if not text:
            raise OpenAIServiceError("Resposta vazia do OpenAI", raw_output=str(response))
        return text

    @staticmethod
    def _extract_text(response: Response) -> str:
        """Extrai conteúdo textual da resposta."""

        for output in response.output:
            if output.type == "message" and output.message:
                for item in output.message.content:
                    if item.type == "text":
                        return item.text
        return ""

    @staticmethod
    def _issues_to_entities(issues: Sequence[IssuePayload]) -> tuple[DetectedIssue, ...]:
        return tuple(
            DetectedIssue(
                description=issue.description,
                severity=IssueSeverity(issue.severity),
                confidence=issue.confidence,
                location_hint=issue.location_hint,
            )
            for issue in issues
        )

    def _to_bim_entity(self, payload: BimAnalysisPayload, *, source_uri: str) -> BimAnalysis:
        return BimAnalysis(
            bim_source_uri=source_uri,
            status=AnalysisStatus.COMPLETED,
            raw_output=payload.raw_output,
            summary=payload.summary,
            issues=self._issues_to_entities(payload.issues),
        )

    def _to_image_entity(self, payload: ImageAnalysisPayload, *, source_uri: str) -> ImageAnalysis:
        return ImageAnalysis(
            image_source_uri=source_uri,
            status=AnalysisStatus.COMPLETED,
            raw_output=payload.raw_output,
            summary=payload.summary,
            issues=self._issues_to_entities(payload.issues),
        )

    @staticmethod
    def _bim_prompt(*, bim_url: str, context: str | None) -> str:
        return (
            "Analise o arquivo BIM disponível no link a seguir: {bim_url}. "
            "{context_msg}\nRetorne resumo e incongruências."
        ).format(
            bim_url=bim_url,
            context_msg=f"Contexto do projeto: {context}." if context else "",
        )

    @staticmethod
    def _image_prompt(*, image_url: str, context: str | None) -> str:
        return (
            "Analise a imagem da obra disponível no link: {image_url}. "
            "{context_msg}\nDescreva condições observadas e discrepâncias visíveis."
        ).format(
            image_url=image_url,
            context_msg=f"Contexto do projeto: {context}." if context else "",
        )

    @staticmethod
    def _comparison_prompt(*, project_name: str, bim_summary: str, image_summary: str) -> str:
        return (
            "Projeto: {project}.\nResumo BIM: {bim}.\nResumo imagem: {image}.\n"
            "Compare e informe similaridade (0-1), porcentagem de conclusão (0-1) e divergências."
        ).format(project=project_name, bim=bim_summary, image=image_summary)

