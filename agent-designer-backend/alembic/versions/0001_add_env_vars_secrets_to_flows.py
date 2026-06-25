"""add env_vars and secrets to flows

Revision ID: 0001_add_env_vars_secrets
Revises: 
Create Date: 2026-06-24

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_add_env_vars_secrets"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "flows",
        sa.Column("env_vars", sa.JSON(), nullable=True, server_default="[]"),
    )
    op.add_column(
        "flows",
        sa.Column("secrets", sa.JSON(), nullable=True, server_default="[]"),
    )


def downgrade() -> None:
    op.drop_column("flows", "secrets")
    op.drop_column("flows", "env_vars")
