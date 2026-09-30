"""FastAPI application factory and configuration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.projects import router as projects_router

app = FastAPI(
    title="AI Full-Stack Starter API",
    description="FastAPI backend for project management",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Dev frontend
        "http://localhost:3000",  # Alt dev frontend
        "https://example.com",  # Production frontend (update as needed)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(projects_router)


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {"message": "AI Full-Stack Starter API"}
