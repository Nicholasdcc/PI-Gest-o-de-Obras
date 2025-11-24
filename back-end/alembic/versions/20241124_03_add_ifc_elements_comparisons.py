"""Add IFC elements and comparisons tables

Revision ID: 20241124_03
Revises: 20241124_02
Create Date: 2024-11-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '20241124_03'
down_revision: Union[str, None] = '20241124_02'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ifc_elements table
    op.create_table(
        'ifc_elements',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('ifc_model_id', sa.Uuid(), nullable=False),
        sa.Column('ifc_id', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=500), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=100), nullable=True),
        sa.Column('properties', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['ifc_model_id'], ['ifc_models.id'], ondelete='CASCADE')
    )
    
    # Create ifc_comparisons table
    op.create_table(
        'ifc_comparisons',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('ifc_model_id', sa.Uuid(), nullable=False),
        sa.Column('type', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.Enum('low', 'medium', 'high', name='comparison_severity'), nullable=False),
        sa.Column('element_id', sa.String(length=255), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['ifc_model_id'], ['ifc_models.id'], ondelete='CASCADE')
    )
    
    # Create indexes
    op.create_index('idx_ifc_elements_model_id', 'ifc_elements', ['ifc_model_id'])
    op.create_index('idx_ifc_comparisons_model_id', 'ifc_comparisons', ['ifc_model_id'])


def downgrade() -> None:
    op.drop_index('idx_ifc_comparisons_model_id', 'ifc_comparisons')
    op.drop_index('idx_ifc_elements_model_id', 'ifc_elements')
    op.drop_table('ifc_comparisons')
    op.drop_table('ifc_elements')
