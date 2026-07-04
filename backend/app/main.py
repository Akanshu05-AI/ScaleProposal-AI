from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# API Routes
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.proposal import router as proposal_router
from app.api.v1.routes.workflow import router as workflow_router


# ---------------------------------------------------
# Application Lifespan
# ---------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n===================================")
    print("🚀 ScaleProposal AI Backend Started")
    print("===================================\n")

    yield

    print("\n===================================")
    print("🛑 ScaleProposal AI Backend Stopped")
    print("===================================\n")


# ---------------------------------------------------
# FastAPI Application
# ---------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    description="Hybrid Multi-Agent Proposal Generation API",
    version=settings.VERSION,
    lifespan=lifespan,
)


# ---------------------------------------------------
# CORS
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------
# API Routes
# ---------------------------------------------------

app.include_router(
    health_router,
    prefix=settings.API_V1_STR,
    tags=["Health"],
)

app.include_router(
    proposal_router,
    prefix=settings.API_V1_STR,
    tags=["Proposal"],
)

app.include_router(
    workflow_router,
    prefix=settings.API_V1_STR,
    tags=["Workflow"],
)


# ---------------------------------------------------
# Root Endpoint
# ---------------------------------------------------

@app.get("/", tags=["Home"])
async def root():
    return {
        "application": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "message": "🚀 Welcome to ScaleProposal AI Backend",
    }


# ---------------------------------------------------
# Health Check
# ---------------------------------------------------

@app.get("/ping", tags=["Health"])
async def ping():
    return {
        "status": "healthy",
        "message": "Backend is running successfully."
    }