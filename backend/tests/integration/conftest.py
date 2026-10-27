"""Applies pending Alembic migrations against DATABASE_URL once per test session.

Runs before any integration test imports `app.main`, so the `users` and
`notes` tables -- and the one seeded owner row -- already exist against the
real PostgreSQL service these tests run against.
"""

import os
import pathlib

import pytest
from alembic import command
from alembic.config import Config

_BACKEND_DIR = pathlib.Path(__file__).resolve().parents[2]

os.environ.setdefault("OWNER_EMAIL", "owner@example.com")
os.environ.setdefault("OWNER_PASSWORD", "correct-horse-battery-staple")


@pytest.fixture(scope="session", autouse=True)
def _migrate_database() -> None:
    cfg = Config(str(_BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(_BACKEND_DIR / "migrations"))
    command.upgrade(cfg, "head")
