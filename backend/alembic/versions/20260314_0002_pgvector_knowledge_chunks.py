"""pgvector knowledge chunks"""

from alembic import op
import sqlalchemy as sa

try:
    from pgvector.sqlalchemy import Vector
except Exception:  # pragma: no cover
    Vector = None


revision = "20260314_0002"
down_revision = "20260313_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == "postgresql":
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("chunk_id", sa.String(length=255), nullable=False),
        sa.Column("source_document", sa.String(length=255), nullable=False),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("embedding", Vector(384) if dialect == "postgresql" and Vector is not None else sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_knowledge_chunks_chunk_id"), "knowledge_chunks", ["chunk_id"], unique=True)
    op.create_index(op.f("ix_knowledge_chunks_source_document"), "knowledge_chunks", ["source_document"], unique=False)

    if dialect == "postgresql":
        op.execute(
            """
            CREATE INDEX IF NOT EXISTS ix_knowledge_chunks_embedding_hnsw
            ON knowledge_chunks USING hnsw (embedding vector_cosine_ops)
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == "postgresql":
        op.execute("DROP INDEX IF EXISTS ix_knowledge_chunks_embedding_hnsw")
    op.drop_index(op.f("ix_knowledge_chunks_source_document"), table_name="knowledge_chunks")
    op.drop_index(op.f("ix_knowledge_chunks_chunk_id"), table_name="knowledge_chunks")
    op.drop_table("knowledge_chunks")
