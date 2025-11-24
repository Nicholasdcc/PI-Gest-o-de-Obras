"""Modelos ORM que representam as tabelas de persistência."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum, Float, ForeignKey, JSON, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.entities import AnalysisStatus
from app.infrastructure.db.base import Base


analysis_status_enum = Enum(
    AnalysisStatus,
    values_callable=lambda enum: [item.value for item in enum],
    name="analysis_status",
    native_enum=False,
)


# Project status enum
class ProjectStatus:
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"


project_status_enum = Enum(
    "active", "paused", "completed", "archived",
    name="project_status",
    native_enum=False,
)


# Evidence status enum  
evidence_status_enum = Enum(
    "pending", "processing", "completed", "error",
    name="evidence_status",
    native_enum=False,
)


class ProjectModel(Base):
    """Modelo para projetos de construção."""
    __tablename__ = "projects"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(project_status_enum, nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    evidences: Mapped[list["EvidenceModel"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    ifc_model: Mapped[Optional["IfcModel"]] = relationship(
        back_populates="project",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class EvidenceModel(Base):
    """Modelo para evidências (imagens) de projetos."""
    __tablename__ = "evidences"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(evidence_status_enum, nullable=False, default="pending")
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    project: Mapped[ProjectModel] = relationship(back_populates="evidences")
    issues: Mapped[list["IssueModel"]] = relationship(
        back_populates="evidence",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class IssueModel(Base):
    """Modelo para problemas identificados nas evidências."""
    __tablename__ = "issues"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    evidence_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("evidences.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[Optional[str]] = mapped_column(String(50))
    location: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    evidence: Mapped[EvidenceModel] = relationship(back_populates="issues")


class IfcModel(Base):
    """Modelo para arquivos IFC de projetos."""
    __tablename__ = "ifc_models"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("processing", "ready", "error", name="ifc_status"), 
        nullable=False, 
        default="processing"
    )
    schema: Mapped[Optional[str]] = mapped_column(String(50))
    elements_count: Mapped[Optional[int]] = mapped_column()
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    project: Mapped[ProjectModel] = relationship(back_populates="ifc_model")


class IfcElementModel(Base):
    """Modelo para elementos de um arquivo IFC."""
    __tablename__ = "ifc_elements"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    ifc_model_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("ifc_models.id", ondelete="CASCADE"), nullable=False
    )
    ifc_id: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(100))
    properties: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    ifc_model: Mapped[IfcModel] = relationship(back_populates="elements")


class IfcComparisonModel(Base):
    """Modelo para comparações/análises de IFC."""
    __tablename__ = "ifc_comparisons"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    ifc_model_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("ifc_models.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(
        Enum("low", "medium", "high", name="comparison_severity"),
        nullable=False
    )
    element_id: Mapped[Optional[str]] = mapped_column(String(255))
    details: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    ifc_model: Mapped[IfcModel] = relationship(back_populates="comparisons")


# Update IfcModel to include elements and comparisons relationships
IfcModel.elements = relationship(
    "IfcElementModel",
    back_populates="ifc_model",
    cascade="all, delete-orphan",
    lazy="selectin",
)
IfcModel.comparisons = relationship(
    "IfcComparisonModel",
    back_populates="ifc_model",
    cascade="all, delete-orphan",
    lazy="selectin",
)


class ProjectAnalysisModel(Base):
    __tablename__ = "project_analyses"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    project_name: Mapped[str] = mapped_column(String(255), nullable=False)
    requested_by: Mapped[Optional[str]] = mapped_column(String(255))
    bim_source_uri: Mapped[str] = mapped_column(Text, nullable=False)
    image_source_uri: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[AnalysisStatus] = mapped_column(analysis_status_enum, nullable=False)
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
        lazy="selectin",
    )
    image_analysis: Mapped[Optional["ImageAnalysisModel"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        uselist=False,
        lazy="selectin",
    )
    comparison_result: Mapped[Optional["ComparisonResultModel"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        uselist=False,
        lazy="selectin",
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
    status: Mapped[AnalysisStatus] = mapped_column(analysis_status_enum, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    project: Mapped[ProjectAnalysisModel] = relationship(back_populates="bim_analysis", lazy="selectin")


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
    status: Mapped[AnalysisStatus] = mapped_column(analysis_status_enum, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    project: Mapped[ProjectAnalysisModel] = relationship(back_populates="image_analysis", lazy="selectin")


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

    project: Mapped[ProjectAnalysisModel] = relationship(back_populates="comparison_result", lazy="selectin")

