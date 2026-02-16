"""Local SQLite storage for report viewing, testing logs, and feedback."""

from __future__ import annotations

import json
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path("data/analyst_local.db")


def _now_iso() -> str:
    """Return an ISO timestamp in UTC."""
    return datetime.now(tz=timezone.utc).isoformat()


def _connect() -> sqlite3.Connection:
    """Create a SQLite connection with row dict support."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_local_db() -> None:
    """Initialize local SQLite schema used by the monitoring UI."""
    with closing(_connect()) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker TEXT NOT NULL,
                title TEXT NOT NULL,
                period TEXT NOT NULL,
                playbook TEXT,
                content TEXT NOT NULL,
                source TEXT DEFAULT 'manual',
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS test_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                suite TEXT NOT NULL,
                status TEXT NOT NULL,
                details TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS system_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                level TEXT NOT NULL,
                category TEXT NOT NULL,
                message TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS feedback_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author TEXT NOT NULL,
                rating INTEGER,
                feedback TEXT NOT NULL,
                context TEXT,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.commit()


def list_reports(limit: int = 200) -> list[dict[str, Any]]:
    """Return recent locally stored reports."""
    with closing(_connect()) as conn:
        rows = conn.execute(
            """
            SELECT id, ticker, title, period, playbook, source, created_at
            FROM reports
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


def get_report(report_id: int) -> dict[str, Any] | None:
    """Get one locally stored report by id."""
    with closing(_connect()) as conn:
        row = conn.execute(
            """
            SELECT id, ticker, title, period, playbook, content, source, created_at
            FROM reports
            WHERE id = ?
            """,
            (report_id,),
        ).fetchone()
    return dict(row) if row else None


def create_report(
    ticker: str,
    title: str,
    period: str,
    content: str,
    playbook: str | None = None,
    source: str = "manual",
) -> dict[str, Any]:
    """Create a new local report record."""
    created_at = _now_iso()
    with closing(_connect()) as conn:
        cursor = conn.execute(
            """
            INSERT INTO reports (ticker, title, period, playbook, content, source, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (ticker.upper(), title, period, playbook, content, source, created_at),
        )
        conn.commit()
        report_id = cursor.lastrowid
    report = get_report(report_id)
    if not report:
        raise RuntimeError("Failed to fetch newly created report")
    return report


def list_test_runs(limit: int = 200) -> list[dict[str, Any]]:
    """Return recent test runs."""
    with closing(_connect()) as conn:
        rows = conn.execute(
            """
            SELECT id, suite, status, details, created_at
            FROM test_runs
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


def create_test_run(suite: str, status: str, details: str | None = None) -> dict[str, Any]:
    """Create a local test run entry."""
    created_at = _now_iso()
    with closing(_connect()) as conn:
        cursor = conn.execute(
            """
            INSERT INTO test_runs (suite, status, details, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (suite, status.upper(), details, created_at),
        )
        conn.commit()
        run_id = cursor.lastrowid
        row = conn.execute(
            "SELECT id, suite, status, details, created_at FROM test_runs WHERE id = ?",
            (run_id,),
        ).fetchone()
    if not row:
        raise RuntimeError("Failed to fetch newly created test run")
    return dict(row)


def list_system_logs(limit: int = 300) -> list[dict[str, Any]]:
    """Return recent system logs."""
    with closing(_connect()) as conn:
        rows = conn.execute(
            """
            SELECT id, level, category, message, metadata, created_at
            FROM system_logs
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    parsed = []
    for row in rows:
        entry = dict(row)
        metadata = entry.get("metadata")
        if metadata:
            try:
                entry["metadata"] = json.loads(metadata)
            except json.JSONDecodeError:
                entry["metadata"] = {"raw": metadata}
        parsed.append(entry)
    return parsed


def create_system_log(
    level: str,
    category: str,
    message: str,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Create a local monitoring log entry."""
    created_at = _now_iso()
    with closing(_connect()) as conn:
        cursor = conn.execute(
            """
            INSERT INTO system_logs (level, category, message, metadata, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                level.upper(),
                category,
                message,
                json.dumps(metadata) if metadata is not None else None,
                created_at,
            ),
        )
        conn.commit()
        log_id = cursor.lastrowid
        row = conn.execute(
            """
            SELECT id, level, category, message, metadata, created_at
            FROM system_logs
            WHERE id = ?
            """,
            (log_id,),
        ).fetchone()
    if not row:
        raise RuntimeError("Failed to fetch newly created system log")
    entry = dict(row)
    if entry.get("metadata"):
        entry["metadata"] = json.loads(entry["metadata"])
    return entry


def list_feedback_entries(limit: int = 200) -> list[dict[str, Any]]:
    """Return recent feedback entries."""
    with closing(_connect()) as conn:
        rows = conn.execute(
            """
            SELECT id, author, rating, feedback, context, created_at
            FROM feedback_entries
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]


def create_feedback_entry(
    author: str,
    feedback: str,
    rating: int | None = None,
    context: str | None = None,
) -> dict[str, Any]:
    """Create a local feedback entry used for iterative improvement."""
    created_at = _now_iso()
    with closing(_connect()) as conn:
        cursor = conn.execute(
            """
            INSERT INTO feedback_entries (author, rating, feedback, context, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (author, rating, feedback, context, created_at),
        )
        conn.commit()
        feedback_id = cursor.lastrowid
        row = conn.execute(
            """
            SELECT id, author, rating, feedback, context, created_at
            FROM feedback_entries
            WHERE id = ?
            """,
            (feedback_id,),
        ).fetchone()
    if not row:
        raise RuntimeError("Failed to fetch newly created feedback entry")
    return dict(row)
