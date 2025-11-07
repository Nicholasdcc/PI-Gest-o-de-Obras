"""Conversões entre modelos ORM e entidades de domínio."""

from __future__ import annotations

from typing import Sequence

from app.domain.entities import (
    AnalysisStatus,
    BimAnalysis,
    ComparisonResult,
    DetectedIssue,
    ImageAnalysis,
    IssueSeverity,
    ProjectAnalysis,
)
from app.infrastructure.db import models


def project_model_to_domain(model: models.ProjectAnalysisModel) -> ProjectAnalysis:
    return ProjectAnalysis(
        id=model.id,
        project_name=model.project_name,
        requested_by=model.requested_by,
        bim_source_uri=model.bim_source_uri,
        image_source_uri=model.image_source_uri,
        status=model.status,
        created_at=model.created_at,
        updated_at=model.updated_at,
        bim_analysis=bim_model_to_domain(model.bim_analysis) if model.bim_analysis else None,
        image_analysis=image_model_to_domain(model.image_analysis) if model.image_analysis else None,
        comparison_result=
        comparison_model_to_domain(model.comparison_result)
        if model.comparison_result
        else None,
        notes=model.notes,
    )


def bim_model_to_domain(model: models.BimAnalysisModel | None) -> BimAnalysis | None:
    if model is None:
        return None
    return BimAnalysis(
        id=model.id,
        bim_source_uri=model.project.bim_source_uri if model.project else "",
        status=model.status,
        raw_output=model.raw_output,
        summary=model.summary,
        issues=_issues_from_json(model.issues),
        created_at=model.created_at,
        completed_at=model.completed_at,
    )


def image_model_to_domain(model: models.ImageAnalysisModel | None) -> ImageAnalysis | None:
    if model is None:
        return None
    return ImageAnalysis(
        id=model.id,
        image_source_uri=model.project.image_source_uri if model.project else "",
        status=model.status,
        raw_output=model.raw_output,
        summary=model.summary,
        issues=_issues_from_json(model.issues),
        created_at=model.created_at,
        completed_at=model.completed_at,
    )


def comparison_model_to_domain(
    model: models.ComparisonResultModel | None,
) -> ComparisonResult | None:
    if model is None:
        return None
    return ComparisonResult(
        id=model.id,
        similarity_score=model.similarity_score,
        completion_percentage=model.completion_percentage,
        summary=model.summary,
        mismatches=tuple(model.mismatches or []),
        created_at=model.created_at,
    )


def update_project_model_from_entity(
    entity: ProjectAnalysis, model: models.ProjectAnalysisModel
) -> None:
    model.project_name = entity.project_name
    model.requested_by = entity.requested_by
    model.bim_source_uri = entity.bim_source_uri
    model.image_source_uri = entity.image_source_uri
    model.status = entity.status
    model.notes = entity.notes

    if entity.bim_analysis:
        model.bim_analysis = model.bim_analysis or models.BimAnalysisModel(project=model)
        update_bim_model_from_entity(entity.bim_analysis, model.bim_analysis)
    elif model.bim_analysis:
        model.bim_analysis = None

    if entity.image_analysis:
        model.image_analysis = model.image_analysis or models.ImageAnalysisModel(project=model)
        update_image_model_from_entity(entity.image_analysis, model.image_analysis)
    elif model.image_analysis:
        model.image_analysis = None

    if entity.comparison_result:
        model.comparison_result = (
            model.comparison_result or models.ComparisonResultModel(project=model)
        )
        update_comparison_model_from_entity(
            entity.comparison_result, model.comparison_result
        )
    elif model.comparison_result:
        model.comparison_result = None


def update_bim_model_from_entity(
    entity: BimAnalysis, model: models.BimAnalysisModel
) -> None:
    model.summary = entity.summary
    model.raw_output = entity.raw_output
    model.compliance_notes = getattr(entity, "compliance_notes", None)
    model.issues = _issues_to_json(entity.issues)
    model.status = entity.status
    model.created_at = entity.created_at
    model.completed_at = entity.completed_at


def update_image_model_from_entity(
    entity: ImageAnalysis, model: models.ImageAnalysisModel
) -> None:
    model.summary = entity.summary
    model.raw_output = entity.raw_output
    model.observed_conditions = getattr(entity, "observed_conditions", None)
    model.issues = _issues_to_json(entity.issues)
    model.status = entity.status
    model.created_at = entity.created_at
    model.completed_at = entity.completed_at


def update_comparison_model_from_entity(
    entity: ComparisonResult, model: models.ComparisonResultModel
) -> None:
    model.summary = entity.summary
    model.similarity_score = entity.similarity_score
    model.completion_percentage = entity.completion_percentage
    model.mismatches = list(entity.mismatches)
    model.created_at = entity.created_at


def _issues_to_json(issues: Sequence[DetectedIssue]) -> list[dict]:
    return [
        {
            "description": issue.description,
            "severity": issue.severity.value,
            "confidence": issue.confidence,
            "location_hint": issue.location_hint,
        }
        for issue in issues
    ]


def _issues_from_json(payload: list[dict] | None) -> tuple[DetectedIssue, ...]:
    if not payload:
        return tuple()
    issues: list[DetectedIssue] = []
    for data in payload:
        severity = data.get("severity", IssueSeverity.MEDIUM)
        if not isinstance(severity, IssueSeverity):
            severity = IssueSeverity(severity)
        issues.append(
            DetectedIssue(
                description=data.get("description", ""),
                severity=severity,
                confidence=float(data.get("confidence", 0.0)),
                location_hint=data.get("location_hint"),
            )
        )
    return tuple(issues)

