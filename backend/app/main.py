from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import ScaleProposalException, create_error_response
from app.database.database import engine, Base

# API Routes
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.proposal import router as proposal_router
from app.api.v1.routes.workflow import router as workflow_router
from app.api.v1.routes.ai import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("===================================")
    logger.info("🚀 ScaleProposal AI Backend Starting")
    logger.info("===================================")
    
    # Initialize database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")

    yield

    logger.info("===================================")
    logger.info("🛑 ScaleProposal AI Backend Stopped")
    logger.info("===================================")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Grade Hybrid Multi-Agent Proposal Generation API",
    version=settings.VERSION,
    lifespan=lifespan,
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(ScaleProposalException)
async def custom_exception_handler(request: Request, exc: ScaleProposalException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": {
                "code": exc.__class__.__name__,
                "message": exc.message,
                "details": exc.details
            }
        }
    )


# API Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(proposal_router, prefix=settings.API_V1_STR)
app.include_router(workflow_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Home"])
async def root():
    return {
        "application": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "message": "🚀 Welcome to ScaleProposal AI Backend API",
    }


@app.get("/ping", tags=["Health"])
async def ping():
    return {
        "status": "healthy",
        "message": "Backend is running successfully."
    }