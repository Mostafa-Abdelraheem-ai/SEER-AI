"""initial"""

from alembic import op
import sqlalchemy as sa


revision = "20260313_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_table(
        "analyses",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("input_text", sa.Text(), nullable=False),
        sa.Column("channel", sa.String(length=50), nullable=False),
        sa.Column("attack_prediction", sa.String(length=100), nullable=False),
        sa.Column("tactic_prediction", sa.String(length=100), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("recommended_action", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_analyses_user_id"), "analyses", ["user_id"], unique=False)
    op.create_table(
        "triggered_rules",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("analysis_id", sa.String(), nullable=False),
        sa.Column("rule_name", sa.String(length=255), nullable=False),
        sa.Column("rule_score", sa.Float(), nullable=False),
        sa.Column("matched_text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["analysis_id"], ["analyses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_triggered_rules_analysis_id"), "triggered_rules", ["analysis_id"], unique=False)
    op.create_table(
        "retrieved_chunks",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("analysis_id", sa.String(), nullable=False),
        sa.Column("source_document", sa.String(length=255), nullable=False),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("relevance_score", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["analysis_id"], ["analyses.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_retrieved_chunks_analysis_id"), "retrieved_chunks", ["analysis_id"], unique=False)
    op.create_table(
        "incident_reports",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("analysis_id", sa.String(), nullable=False),
        sa.Column("severity", sa.String(length=50), nullable=False),
        sa.Column("report_text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["analysis_id"], ["analyses.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("analysis_id"),
    )
    op.create_index(op.f("ix_incident_reports_analysis_id"), "incident_reports", ["analysis_id"], unique=True)
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("action", sa.String(length=255), nullable=False),
        sa.Column("details", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_audit_logs_user_id"), table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index(op.f("ix_incident_reports_analysis_id"), table_name="incident_reports")
    op.drop_table("incident_reports")
    op.drop_index(op.f("ix_retrieved_chunks_analysis_id"), table_name="retrieved_chunks")
    op.drop_table("retrieved_chunks")
    op.drop_index(op.f("ix_triggered_rules_analysis_id"), table_name="triggered_rules")
    op.drop_table("triggered_rules")
    op.drop_index(op.f("ix_analyses_user_id"), table_name="analyses")
    op.drop_table("analyses")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
