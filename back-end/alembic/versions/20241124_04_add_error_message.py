"""add error_message to ifc_models

Revision ID: 20241124_04
Revises: 20241124_03
Create Date: 2024-11-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20241124_04'
down_revision: Union[str, None] = '20241124_03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add error_message column to ifc_models table."""
    op.add_column('ifc_models', sa.Column('error_message', sa.Text(), nullable=True))


def downgrade() -> None:
    """Remove error_message column from ifc_models table."""
    op.drop_column('ifc_models', 'error_message')
