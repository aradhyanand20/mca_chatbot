
"""baseline existing schema

Revision ID: c7bbf6efa28f
Revises:
Create Date: 2026-10-21 22:09:27.255498
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c7bbf6efa28f"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create the schema on a fresh database."""
    op.create_table(
        "user",
        sa.Column("id",
            sa.Integer(),
            sa.Sequence("user_id_seq", schema="public"),
            nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id", name="user_pkey"),
    )

    op.create_index(
        "ix_user_email",
        "user",
        ["email"],
        unique=True,
    )


def downgrade() -> None:
    """Remove the schema created by this migration."""
    op.drop_index("ix_user_email", table_name="user")
    op.drop_table("user")
