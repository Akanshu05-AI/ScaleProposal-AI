import re
from abc import ABC, abstractmethod
from typing import Type, TypeVar, Optional
from pydantic import BaseModel

from app.services.gemini_service import AIService
from app.core.logging import logger

T = TypeVar("T", bound=BaseModel)


class BaseAgent(ABC):
    """
    Abstract Base Class for all AI Agents in ScaleProposal AI.
    Handles prompt safety sanitization, system instructions, and structured LLM invocation.
    """

    @property
    @abstractmethod
    def agent_name(self) -> str:
        """Human-readable name of the agent."""
        pass

    @property
    def system_instruction(self) -> Optional[str]:
        """Optional system instructions for the LLM agent role."""
        return None

    def sanitize_input(self, text: str) -> str:
        """
        Sanitize user inputs to mitigate prompt injection risks and remove control sequences.
        """
        if not text:
            return ""
        # Remove null bytes and non-printable control characters (except newline, tab, carriage return)
        clean = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
        # Trim whitespace
        return clean.strip()

    async def generate_text(self, prompt: str) -> str:
        """Execute text generation using AIService."""
        logger.info(f"[{self.agent_name}] Invoking text generation...")
        return await AIService.generate_text(
            prompt,
            system_instruction=self.system_instruction
        )

    async def generate_structured(self, prompt: str, schema: Type[T]) -> T:
        """Execute structured Pydantic object generation using AIService."""
        logger.info(f"[{self.agent_name}] Invoking structured generation for schema {schema.__name__}...")
        return await AIService.generate_structured(
            prompt,
            response_schema=schema,
            system_instruction=self.system_instruction
        )