"""
app/models/database.py – SQLAlchemy engine + session factory + Base.
"""
from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _make_engine():
    settings = get_settings()
    connect_args = {}
    if settings.DATABASE_URL.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    return create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        echo=False,
    )


engine = _make_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables if they don't exist and run small migrations."""
    from app.models import activity, ai_interaction, weekly_target, map  # noqa: F401 – registers models
    Base.metadata.create_all(bind=engine)

    # Phase 8A Migration for entry_method
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info(activities)"))
        columns = [row[1] for row in res]
        if "entry_method" not in columns:
            conn.execute(text("ALTER TABLE activities ADD COLUMN entry_method VARCHAR(16) NOT NULL DEFAULT 'form'"))
            conn.commit()
