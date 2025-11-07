"""Modelos ORM que representam as tabelas de persistência."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, Float, ForeignKey, JSON, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.entities import AnalysisStatus
from app.infrastructure.db.base import Base


class ProjectAnalysisModel(Base):
    __tablename__ = "project_analyses"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_name: Mapped[str] = mapped_column(String(255), nullable=False)
    requested_by: Mapped[Optional[str]] = mapped_column(String(255))
    bim_source_uri: Mapped[str] = mapped_column(Text, nullable=False)
    image_source_uri: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AnalysisStatus] = mapped_column(Enum(AnalysisStatus), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    bim_analysis: Mapped[Optional["BimAnalysisModel"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        uselist=False,
    )
    image_analysis: Mapped[Optional["ImageAnalysisModel"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        uselist=False,
    )
    comparison_result: Mapped[Optional["ComparisonResultModel"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        uselist=False,
    )


class BimAnalysisModel(Base):
    __tablename__ = "bim_analyses"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("project_analyses.id", ondelete="CASCADE")
    )
    summary: Mapped[Optional[str]] = mapped_column(Text)
    raw_output: Mapped[Optional[str]] = mapped_column(Text)
    compliance_notes: Mapped[Optional[str]] = mapped_column(Text)
    issues: Mapped[list[dict]] = mapped_column(JSON, default=list)
    status: Mapped[AnalysisStatus] = mapped_column(Enum(AnalysisStatus), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    project: Mapped[ProjectAnalysisModel] = relationship(back_populates="bim_analysis")


class ImageAnalysisModel(Base):
    __tablename__ = "image_analyses"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("project_analyses.id", ondelete="CASCADE")
    )
    summary: Mapped[Optional[str]] = mapped_column(Text)
    raw_output: Mapped[Optional[str]] = mapped_column(Text)
    observed_conditions: Mapped[Optional[str]] = mapped_column(Text)
    issues: Mapped[list[dict]] = mapped_column(JSON, default=list)
    status: Mapped[AnalysisStatus] = mapped_column(Enum(AnalysisStatus), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    project: Mapped[ProjectAnalysisModel] = relationship(back_populates="image_analysis")


class ComparisonResultModel(Base):
    __tablename__ = "comparison_results"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("project_analyses.id", ondelete="CASCADE")
    )
    summary: Mapped[Optional[str]] = mapped_column(Text)
    similarity_score: Mapped[float] = mapped_column(Float, nullable=False)
    completion_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    mismatches: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    project: Mapped[ProjectAnalysisModel] = relationship(back_populates="comparison_result")

