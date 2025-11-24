"""Cliente responsável por orquestrar prompts com o OpenAI."""

from __future__ import annotations

import logging
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


logger = logging.getLogger(__name__)


class OpenAIService:
    """Serviço de alto nível para lidar com prompts específicos."""

    def __init__(
        self,
        *,
        client: AsyncOpenAI | None = None,
        settings: Settings | None = None,
    ) -> None:
        self._settings = settings or get_settings()
        self._use_mock = False
        api_key = self._settings.openai.api_key
        self._client = client

        if self._client is None:
            if api_key:
                try:
                    self._client = AsyncOpenAI(api_key=api_key, timeout=self._settings.openai.timeout)
                    logger.info("✅ Cliente OpenAI inicializado com sucesso! Modelo imagem: %s", self._settings.openai.model_image)
                except Exception as exc:  # pragma: no cover - erro de inicialização
                    logger.error("❌ Falha ao inicializar cliente OpenAI, usando fallback mock. Detalhe: %s", exc)
                    self._use_mock = True
            else:
                logger.warning("⚠️ Chave OpenAI ausente. Serviço usará respostas mockadas.")
                self._use_mock = True

        if self._client is None:
            self._use_mock = True
            logger.warning("⚠️ MODO MOCK ATIVO - Cliente OpenAI não disponível")

    async def analyze_bim(
        self, *, bim_source: str, project_context: str | None = None
    ) -> BimAnalysis:
        """Executa prompt para análise de arquivo BIM."""

        if self._use_mock:
            return self._mock_bim_analysis(source_uri=bim_source)

        try:
            payload = await self._ask_openai(
                model=self._settings.openai.model_bim,
                user_prompt=self._bim_prompt(source=bim_source, context=project_context),
            )
            parsed = BimAnalysisPayload.model_validate_json(payload)
            return self._to_bim_entity(parsed, source_uri=bim_source)
        except OpenAIServiceError as exc:
            logger.warning("OpenAI indisponível para análise BIM. Utilizando fallback mock. Detalhe: %s", exc)
            return self._mock_bim_analysis(source_uri=bim_source)

    async def analyze_image(
        self, *, image_source: str, project_context: str | None = None
    ) -> ImageAnalysis:
        """Executa prompt para análise de imagem."""

        if self._use_mock:
            logger.warning("🎭 Usando análise MOCK para imagem: %s", image_source)
            return self._mock_image_analysis(source_uri=image_source)

        logger.info("🤖 Enviando imagem para OpenAI (modelo: %s): %s", self._settings.openai.model_image, image_source)
        try:
            payload = await self._ask_openai(
                model=self._settings.openai.model_image,
                user_prompt=self._image_prompt(source=image_source, context=project_context),
            )
            logger.info("✅ Resposta recebida da OpenAI com sucesso!")
            parsed = ImageAnalysisPayload.model_validate_json(payload)
            return self._to_image_entity(parsed, source_uri=image_source)
        except OpenAIServiceError as exc:
            logger.error("❌ OpenAI indisponível para análise de imagem. Utilizando fallback mock. Detalhe: %s", exc)
            return self._mock_image_analysis(source_uri=image_source)

    async def compare_results(
        self,
        *,
        project_name: str,
        bim_analysis: BimAnalysis,
        image_analysis: ImageAnalysis,
    ) -> ComparisonResult:
        """Compara os outputs consolidados."""

        if self._use_mock:
            return self._mock_comparison(project_name=project_name)

        try:
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
        except OpenAIServiceError as exc:
            logger.warning("OpenAI indisponível para comparação. Utilizando fallback mock. Detalhe: %s", exc)
            return self._mock_comparison(project_name=project_name)

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
    def _bim_prompt(*, source: str, context: str | None) -> str:
        return (
            "Analise o arquivo BIM disponível em: {source}. "
            "{context_msg}\nRetorne resumo e incongruências."
        ).format(
            source=source,
            context_msg=f"Contexto do projeto: {context}." if context else "",
        )

    @staticmethod
    def _image_prompt(*, source: str, context: str | None) -> str:
        return (
            "Analise a imagem da obra localizada em: {source}. "
            "{context_msg}\nDescreva condições observadas e discrepâncias visíveis."
        ).format(
            source=source,
            context_msg=f"Contexto do projeto: {context}." if context else "",
        )

    @staticmethod
    def _comparison_prompt(*, project_name: str, bim_summary: str, image_summary: str) -> str:
        return (
            "Projeto: {project}.\nResumo BIM: {bim}.\nResumo imagem: {image}.\n"
            "Compare e informe similaridade (0-1), porcentagem de conclusão (0-1) e divergências."
        ).format(project=project_name, bim=bim_summary, image=image_summary)

    @staticmethod
    def _mock_bim_analysis(*, source_uri: str) -> BimAnalysis:
        return BimAnalysis(
            bim_source_uri=source_uri,
            status=AnalysisStatus.COMPLETED,
            summary="Análise simulada: estrutura principal em conformidade, atenção a pequenos ajustes de acabamento.",
            raw_output="mock_bim_analysis",
            issues=(
                DetectedIssue(
                    description="Necessário reforço de guarda-corpo na plataforma central.",
                    severity=IssueSeverity.MEDIUM,
                    confidence=0.65,
                    location_hint="Plataforma central",
                ),
            ),
        )

    @staticmethod
    def _mock_image_analysis(*, source_uri: str) -> ImageAnalysis:
        return ImageAnalysis(
            image_source_uri=source_uri,
            status=AnalysisStatus.COMPLETED,
            summary="Análise simulada: obra apresenta progresso satisfatório, com pequenas não conformidades visuais.",
            raw_output="mock_image_analysis",
            issues=(
                DetectedIssue(
                    description="Materiais depositados próximos à saída de emergência.",
                    severity=IssueSeverity.LOW,
                    confidence=0.6,
                    location_hint="Saída Leste",
                ),
            ),
        )

    @staticmethod
    def _mock_comparison(*, project_name: str) -> ComparisonResult:
        return ComparisonResult(
            summary=(
                f"Comparação simulada para o projeto {project_name}: divergências pontuais identificadas,"
                " com progresso geral aderente ao planejado."
            ),
            similarity_score=0.82,
            completion_percentage=0.78,
            mismatches=(
                "Acabamento de piso ainda não concluído no setor C",
                "Iluminação provisória instalada em vez da definitiva",
            ),
        )

