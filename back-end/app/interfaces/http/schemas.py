"""Esquemas Pydantic expostos pela API HTTP."""

from __future__ import annotations

from datetime import datetime
from typing import Iterable, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.entities import (
    AnalysisStatus,
    BimAnalysis,
    ComparisonResult,
    DetectedIssue,
    ImageAnalysis,
    IssueSeverity,
    ProjectAnalysis,
)


class DetectedIssueSchema(BaseModel):
    """Schema para issues detectados em análises de BIM/imagem."""
    description: str
    severity: IssueSeverity
    confidence: float = Field(ge=0.0, le=1.0)
    location_hint: Optional[str] = None

    @classmethod
    def from_entity(cls, issue: DetectedIssue) -> "DetectedIssueSchema":
        return cls(
            description=issue.description,
            severity=issue.severity,
            confidence=issue.confidence,
            location_hint=issue.location_hint,
        )


class BaseAnalysisSchema(BaseModel):
    id: UUID
    status: AnalysisStatus
    summary: Optional[str]
    issues: list[DetectedIssueSchema]
    raw_output: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]


class BimAnalysisSchema(BaseAnalysisSchema):
    source_uri: str

    @classmethod
    def from_entity(cls, entity: BimAnalysis) -> "BimAnalysisSchema":
        return cls(
            id=entity.id,
            status=entity.status,
            summary=entity.summary,
            issues=[DetectedIssueSchema.from_entity(issue) for issue in entity.issues],
            raw_output=entity.raw_output,
            created_at=entity.created_at,
            completed_at=entity.completed_at,
            source_uri=entity.bim_source_uri,
        )


class ImageAnalysisSchema(BaseAnalysisSchema):
    source_uri: str

    @classmethod
    def from_entity(cls, entity: ImageAnalysis) -> "ImageAnalysisSchema":
        return cls(
            id=entity.id,
            status=entity.status,
            summary=entity.summary,
            issues=[DetectedIssueSchema.from_entity(issue) for issue in entity.issues],
            raw_output=entity.raw_output,
            created_at=entity.created_at,
            completed_at=entity.completed_at,
            source_uri=entity.image_source_uri,
        )


class ComparisonResultSchema(BaseModel):
    id: UUID
    summary: Optional[str]
    similarity_score: float = Field(ge=0.0, le=1.0)
    completion_percentage: float = Field(ge=0.0, le=1.0)
    mismatches: list[str]
    created_at: datetime

    @classmethod
    def from_entity(cls, entity: ComparisonResult) -> "ComparisonResultSchema":
        return cls(
            id=entity.id,
            summary=entity.summary,
            similarity_score=entity.similarity_score,
            completion_percentage=entity.completion_percentage,
            mismatches=list(entity.mismatches),
            created_at=entity.created_at,
        )


class ProjectAnalysisResponse(BaseModel):
    id: UUID
    project_name: str
    requested_by: Optional[str]
    bim_source_uri: str
    image_source_uri: str
    status: AnalysisStatus
    created_at: datetime
    updated_at: datetime
    notes: Optional[str]
    bim_analysis: Optional[BimAnalysisSchema]
    image_analysis: Optional[ImageAnalysisSchema]
    comparison_result: Optional[ComparisonResultSchema]

    @classmethod
    def from_entity(cls, entity: ProjectAnalysis) -> "ProjectAnalysisResponse":
        return cls(
            id=entity.id,
            project_name=entity.project_name,
            requested_by=entity.requested_by,
            bim_source_uri=entity.bim_source_uri,
            image_source_uri=entity.image_source_uri,
            status=entity.status,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            notes=entity.notes,
            bim_analysis=
            BimAnalysisSchema.from_entity(entity.bim_analysis)
            if entity.bim_analysis
            else None,
            image_analysis=
            ImageAnalysisSchema.from_entity(entity.image_analysis)
            if entity.image_analysis
            else None,
            comparison_result=
            ComparisonResultSchema.from_entity(entity.comparison_result)
            if entity.comparison_result
            else None,
        )


class ProjectAnalysisListItem(BaseModel):
    id: UUID
    project_name: str
    status: AnalysisStatus
    requested_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, entity: ProjectAnalysis) -> "ProjectAnalysisListItem":
        return cls(
            id=entity.id,
            project_name=entity.project_name,
            status=entity.status,
            requested_by=entity.requested_by,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )


class ProjectAnalysisListResponse(BaseModel):
    items: list[ProjectAnalysisListItem]

    @classmethod
    def from_entities(cls, entities: Iterable[ProjectAnalysis]) -> "ProjectAnalysisListResponse":
        return cls(items=[ProjectAnalysisListItem.from_entity(item) for item in entities])


# ============================================================================
# PROJECT SCHEMAS
# ============================================================================

class ProjectBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    location: str = Field(min_length=1, max_length=500)
    status: str = Field(default="active")


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    evidence_count: int = 0
    issues_count: int = 0

    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    evidences: list["EvidenceSummarySchema"] = []

    class Config:
        from_attributes = True


# ============================================================================
# EVIDENCE SCHEMAS
# ============================================================================

class EvidenceSummarySchema(BaseModel):
    id: UUID
    thumbnail_url: Optional[str] = None
    status: str
    issues_count: int = 0
    uploaded_at: datetime

    class Config:
        from_attributes = True


class EvidenceResponse(BaseModel):
    id: UUID
    project_id: UUID
    file_url: str
    thumbnail_url: Optional[str] = None
    description: Optional[str] = None
    status: str
    uploaded_at: datetime
    analyzed_at: Optional[datetime] = None
    issues_count: int = 0

    class Config:
        from_attributes = True


class EvidenceDetailResponse(EvidenceResponse):
    issues: list["IssueSchema"] = []

    class Config:
        from_attributes = True


class UploadEvidenceResponse(EvidenceResponse):
    pass


# ============================================================================
# ISSUE SCHEMAS (for evidences)
# ============================================================================

class IssueSchema(BaseModel):
    id: UUID
    type: str
    description: str
    confidence: float = Field(ge=0.0, le=1.0)
    severity: Optional[str] = None
    location: Optional[str | dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# REPORT SCHEMAS
# ============================================================================

class ReportResponse(BaseModel):
    project_id: UUID
    url: str
    format: str = "pdf"
    generated_at: datetime
    file_size: Optional[int] = None

    class Config:
        from_attributes = True


class GenerateReportResponse(BaseModel):
    status: str = "generating"


# ============================================================================
# IFC SCHEMAS
# ============================================================================

class IfcModelResponse(BaseModel):
    id: UUID
    project_id: UUID
    status: str
    schema: Optional[str] = None
    elements_count: Optional[int] = None
    error_message: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UploadIfcResponse(IfcModelResponse):
    pass
