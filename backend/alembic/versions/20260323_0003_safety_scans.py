"""safety scans for digital safety assistant"""

from alembic import op
import sqlalchemy as sa


revision = "20260323_0003"
down_revision = "20260314_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "safety_scans",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("scan_type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("verdict", sa.String(length=50), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("advice", sa.Text(), nullable=False),
        sa.Column("input_text", sa.Text(), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("findings_json", sa.JSON(), nullable=False),
        sa.Column("extracted_urls_json", sa.JSON(), nullable=False),
        sa.Column("parsed_email_json", sa.JSON(), nullable=True),
        sa.Column("limitations_json", sa.JSON(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_safety_scans_user_id"), "safety_scans", ["user_id"], unique=False)
    op.create_index(op.f("ix_safety_scans_scan_type"), "safety_scans", ["scan_type"], unique=False)
    op.create_index(op.f("ix_safety_scans_verdict"), "safety_scans", ["verdict"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_safety_scans_verdict"), table_name="safety_scans")
    op.drop_index(op.f("ix_safety_scans_scan_type"), table_name="safety_scans")
    op.drop_index(op.f("ix_safety_scans_user_id"), table_name="safety_scans")
    op.drop_table("safety_scans")
