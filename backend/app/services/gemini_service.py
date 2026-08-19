from typing import Type, TypeVar, Optional
from pydantic import BaseModel

from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.provider import AIProvider

T = TypeVar("T", bound=BaseModel)


class AIService:
    """
    Unified AI Service Facade managing AI provider interactions across agents.
    Provides async non-blocking generation for text and structured schemas.
    """

    _provider: Optional[AIProvider] = None

    @classmethod
    def get_provider(cls) -> AIProvider:
        """Get or initialize default AI Provider (GeminiProvider)."""
        if cls._provider is None:
            cls._provider = GeminiProvider()
        return cls._provider

    @classmethod
    def set_provider(cls, provider: AIProvider) -> None:
        """Set or mock AI Provider (useful for unit testing)."""
        cls._provider = provider

    @classmethod
    async def generate_text(cls, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Generate text/markdown using configured AI provider."""
        provider = cls.get_provider()
        return await provider.generate_text(prompt, system_instruction=system_instruction)

    @classmethod
    async def generate_structured(
        cls,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        """Generate structured Pydantic object using configured AI provider."""
        provider = cls.get_provider()
        return await provider.generate_structured(
            prompt,
            response_schema=response_schema,
            system_instruction=system_instruction
        )


# Backward compatibility alias
GeminiService = AIService