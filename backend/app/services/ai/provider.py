from abc import ABC, abstractmethod
from typing import Type, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class AIProvider(ABC):
    """Abstract base class for AI model providers."""

    @abstractmethod
    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Generate plain text or markdown response asynchronously."""
        pass

    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        """Generate structured Pydantic object response asynchronously."""
        pass
