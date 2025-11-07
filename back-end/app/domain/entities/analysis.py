"""Entidades e enums relacionados às análises de BIM e imagens."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Sequence
from uuid import UUID, uuid4


class AnalysisStatus(str, Enum):
    """Status de execução de uma análise."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class IssueSeverity(str, Enum):
    """Níveis de severidade para incongruências detectadas."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(slots=True)
class DetectedIssue:
    """Issue individual encontrada pela IA."""

    description: str
    severity: IssueSeverity
    confidence: float
    location_hint: Optional[str] = None


@dataclass(slots=True)
class BaseAnalysis:
    """Informações comuns às análises de BIM ou imagem."""

    id: UUID = field(default_factory=uuid4)
    status: AnalysisStatus = AnalysisStatus.PENDING
    raw_output: Optional[str] = None
    summary: Optional[str] = None
    issues: Sequence[DetectedIssue] = field(default_factory=tuple)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None


@dataclass(slots=True)
class BimAnalysis(BaseAnalysis):
    """Resultado da análise de arquivo BIM."""

    bim_source_uri: str = ""


@dataclass(slots=True)
class ImageAnalysis(BaseAnalysis):
    """Resultado da análise de imagem real."""

    image_source_uri: str = ""


@dataclass(slots=True)
class ComparisonResult:
    """Comparação entre as análises de BIM e da imagem."""

    id: UUID = field(default_factory=uuid4)
    similarity_score: float = 0.0
    completion_percentage: float = 0.0
    summary: Optional[str] = None
    mismatches: Sequence[str] = field(default_factory=tuple)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(slots=True)
class ProjectAnalysis:
    """Agregador geral contendo as três etapas de análise."""

    id: UUID = field(default_factory=uuid4)
    project_name: str = ""
    requested_by: Optional[str] = None
    bim_source_uri: str = ""
    image_source_uri: str = ""
    status: AnalysisStatus = AnalysisStatus.PENDING
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    bim_analysis: Optional[BimAnalysis] = None
    image_analysis: Optional[ImageAnalysis] = None
    comparison_result: Optional[ComparisonResult] = None
    notes: Optional[str] = None

    def mark_running(self) -> None:
        self.status = AnalysisStatus.RUNNING
        self.updated_at = datetime.now(timezone.utc)

    def mark_completed(
        self,
        bim_analysis: BimAnalysis,
        image_analysis: ImageAnalysis,
        comparison: ComparisonResult,
    ) -> None:
        self.status = AnalysisStatus.COMPLETED
        self.bim_analysis = bim_analysis
        self.image_analysis = image_analysis
        self.comparison_result = comparison
        self.updated_at = datetime.now(timezone.utc)

    def mark_failed(self, notes: str | None = None) -> None:
        self.status = AnalysisStatus.FAILED
        self.notes = notes
        self.updated_at = datetime.now(timezone.utc)

