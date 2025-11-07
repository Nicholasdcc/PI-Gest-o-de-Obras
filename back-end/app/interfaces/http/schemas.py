"""Esquemas Pydantic expostos pela API HTTP."""

from __future__ import annotations

from datetime import datetime
from typing import Iterable, Optional
from uuid import UUID

from pydantic import AnyHttpUrl, BaseModel, Field

from app.domain.entities import (
    AnalysisStatus,
    BimAnalysis,
    ComparisonResult,
    DetectedIssue,
    ImageAnalysis,
    IssueSeverity,
    ProjectAnalysis,
)


class IssueSchema(BaseModel):
    description: str
    severity: IssueSeverity
    confidence: float = Field(ge=0.0, le=1.0)
    location_hint: Optional[str] = None

    @classmethod
    def from_entity(cls, issue: DetectedIssue) -> "IssueSchema":
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
    issues: list[IssueSchema]
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
            issues=[IssueSchema.from_entity(issue) for issue in entity.issues],
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
            issues=[IssueSchema.from_entity(issue) for issue in entity.issues],
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


class AnalyzeProjectPayload(BaseModel):
    project_name: str
    bim_url: AnyHttpUrl
    image_url: AnyHttpUrl
    requested_by: Optional[str] = None
    context: Optional[str] = None

