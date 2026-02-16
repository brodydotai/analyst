"""FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analyst.api.local_ui import router as local_ui_router
from analyst.api.routes import router
from analyst.local_store import init_local_db


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Analyst API",
        description="AI Equity Research System",
        version="0.1.0",
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include router
    app.include_router(router)
    app.include_router(local_ui_router)
    init_local_db()

    return app
