"""Add IFC models table

Revision ID: 20241124_02
Revises: 20241124_01
Create Date: 2024-11-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '20241124_02'
down_revision: Union[str, None] = '20241124_01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ifc_models table
    op.create_table(
        'ifc_models',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('project_id', sa.Uuid(), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('processing', 'ready', 'error', name='ifc_status'), nullable=False),
        sa.Column('schema', sa.String(length=50), nullable=True),
        sa.Column('elements_count', sa.Integer(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE')
    )
    
    # Create index
    op.create_index('idx_ifc_models_project_id', 'ifc_models', ['project_id'], unique=True)


def downgrade() -> None:
    op.drop_index('idx_ifc_models_project_id', 'ifc_models')
    op.drop_table('ifc_models')
