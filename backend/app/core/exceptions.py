from typing import Optional, Any, Dict
from fastapi import HTTPException, status


class ScaleProposalException(Exception):
    """Base exception for ScaleProposal AI application."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class AIGenerationError(ScaleProposalException):
    """Raised when an AI model fails to generate valid structured content after retries."""
    pass


class AgentExecutionError(ScaleProposalException):
    """Raised when an agent execution step fails during workflow orchestration."""
    def __init__(self, agent_name: str, message: str, details: Optional[Dict[str, Any]] = None):
        self.agent_name = agent_name
        super().__init__(f"[{agent_name}] {message}", details)


class ProposalNotFoundError(ScaleProposalException):
    """Raised when a requested proposal ID or workflow ID does not exist."""
    pass


class ValidationError(ScaleProposalException):
    """Raised when request payload or input validation fails."""
    pass


def create_error_response(
    status_code: int,
    code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> HTTPException:
    """Utility to build consistent FastAPI HTTP error responses."""
    return HTTPException(
        status_code=status_code,
        detail={
            "error": {
                "code": code,
                "message": message,
                "details": details or {}
            }
        }
    )
