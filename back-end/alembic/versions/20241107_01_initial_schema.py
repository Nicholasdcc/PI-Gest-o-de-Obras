"""initial schema

Revision ID: 20241107_01
Revises: 
Create Date: 2024-11-07 00:00:00.000000

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20241107_01"
down_revision = None
branch_labels = None
depends_on = None


analysis_status_enum = sa.Enum(
    "pending",
    "running",
    "completed",
    "failed",
    name="analysis_status",
    native_enum=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    analysis_status_enum.create(bind, checkfirst=True)
    op.create_table(
        "project_analyses",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("project_name", sa.String(length=255), nullable=False),
        sa.Column("requested_by", sa.String(length=255), nullable=True),
        sa.Column("bim_source_uri", sa.Text(), nullable=False),
        sa.Column("image_source_uri", sa.Text(), nullable=False),
        sa.Column("status", analysis_status_enum, nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    op.create_table(
        "bim_analyses",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "project_id",
            sa.Uuid(as_uuid=True),
            sa.ForeignKey("project_analyses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("raw_output", sa.Text(), nullable=True),
        sa.Column("compliance_notes", sa.Text(), nullable=True),
        sa.Column("issues", sa.JSON(), nullable=False, server_default=None),
        sa.Column("status", analysis_status_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "image_analyses",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "project_id",
            sa.Uuid(as_uuid=True),
            sa.ForeignKey("project_analyses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("raw_output", sa.Text(), nullable=True),
        sa.Column("observed_conditions", sa.Text(), nullable=True),
        sa.Column("issues", sa.JSON(), nullable=False, server_default=None),
        sa.Column("status", analysis_status_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "comparison_results",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "project_id",
            sa.Uuid(as_uuid=True),
            sa.ForeignKey("project_analyses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("similarity_score", sa.Float(), nullable=False),
        sa.Column("completion_percentage", sa.Float(), nullable=False),
        sa.Column("mismatches", sa.JSON(), nullable=False, server_default=None),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("comparison_results")
    op.drop_table("image_analyses")
    op.drop_table("bim_analyses")
    op.drop_table("project_analyses")
    analysis_status_enum.drop(op.get_bind(), checkfirst=True)

