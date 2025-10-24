from langchain_ollama import OllamaEmbeddings
from langchain_postgres.vectorstores import PGVector
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from server.ai.config import settings
from server.ai.vector_store.data import build_faq_documents

COLLECTION_NAME = "fintech_faq_llama2_pgvector"


def _get_embeddings():
    return OllamaEmbeddings(model="nomic-embed-text", base_url=settings.OLLAMA_HOST)


def _ensure_pgvector_extension(engine: Engine):
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))


def _collection_exists(engine: Engine) -> bool:
    try:
        with engine.begin() as conn:
            res = conn.execute(
                text("SELECT 1 FROM langchain_pg_collection WHERE name = :name LIMIT 1"),
                {"name": COLLECTION_NAME},
            ).fetchone()
            return res is not None
    except SQLAlchemyError:
        return False


def _init_vector_store_and_index_if_needed() -> PGVector:
    dsn = f"postgresql+psycopg://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    engine = create_engine(dsn, pool_pre_ping=True)
    _ensure_pgvector_extension(engine)

    embeddings = _get_embeddings()

    # If the collection exists, just open it; otherwise create and index documents
    if _collection_exists(engine):
        return PGVector(
            embeddings=embeddings,
            collection_name=COLLECTION_NAME,
            connection=dsn,
            use_jsonb=True,
        )

    # Create collection and add our FAQ docs
    print("Creating collection and indexing documents...", flush=True)
    vs = PGVector.from_documents(
        documents=build_faq_documents(),
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        connection=dsn,
        use_jsonb=True,
    )
    return vs


def get_retriever():
    # Switched to pgvector retriever backed by Postgres
    vs = _init_vector_store_and_index_if_needed()
    # You can tune k and search kwargs as needed
    return vs.as_retriever(search_kwargs={"k": 4})
