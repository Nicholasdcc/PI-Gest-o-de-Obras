"""Esquemas Pydantic para normalizar respostas do OpenAI."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.domain.entities import IssueSeverity


class IssuePayload(BaseModel):
    description: str
    severity: IssueSeverity
    confidence: float = Field(ge=0.0, le=1.0)
    location_hint: Optional[str] = None


class AnalysisPayload(BaseModel):
    summary: str
    issues: list[IssuePayload] = Field(default_factory=list)
    raw_output: Optional[str] = None


class BimAnalysisPayload(AnalysisPayload):
    compliance_notes: Optional[str] = None


class ImageAnalysisPayload(AnalysisPayload):
    observed_conditions: Optional[str] = None


class ComparisonPayload(BaseModel):
    summary: str
    similarity_score: float = Field(ge=0.0, le=1.0)
    completion_percentage: float = Field(ge=0.0, le=1.0)
    mismatches: list[str] = Field(default_factory=list)

    @field_validator("completion_percentage")
    @classmethod
    def clamp_completion(cls, value: float) -> float:
        return min(max(value, 0.0), 1.0)

