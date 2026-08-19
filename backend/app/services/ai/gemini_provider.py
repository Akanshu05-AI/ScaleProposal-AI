import asyncio
import json
from typing import Type, TypeVar, Optional
from pydantic import BaseModel, ValidationError as PydanticValidationError
from google import genai
from google.genai import types

from app.services.ai.provider import AIProvider
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import AIGenerationError

T = TypeVar("T", bound=BaseModel)


class GeminiProvider(AIProvider):
    """
    Production-grade Gemini AI Provider using `google-genai` SDK.
    Supports persistent client reuse, non-blocking async execution,
    structured Pydantic response generation, and exponential backoff retries.
    """

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        self._client: Optional[genai.Client] = None

    @property
    def client(self) -> genai.Client:
        """Lazy-loaded persistent Gemini Client instance."""
        if self._client is None:
            if not self.api_key:
                logger.warning("GEMINI_API_KEY is missing. Gemini provider calls may fail.")
            self._client = genai.Client(api_key=self.api_key or "DUMMY_KEY")
        return self._client

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Generate plain text or markdown response using Gemini API with retries."""
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        )

        last_error = None
        retries = settings.AI_MAX_RETRIES

        for attempt in range(1, retries + 1):
            try:
                # Execute in threadpool to prevent blocking FastAPI event loop
                response = await asyncio.to_thread(
                    self.client.models.generate_content,
                    model=self.model_name,
                    contents=prompt,
                    config=config,
                )

                if response and response.text:
                    return response.text.strip()
                raise AIGenerationError("Empty response returned from Gemini API.")

            except Exception as e:
                last_error = e
                logger.warning(f"Gemini generate_text attempt {attempt}/{retries} failed: {e}")
                if attempt < retries:
                    await asyncio.sleep(settings.AI_RETRY_BACKOFF_FACTOR ** attempt)

        logger.error(f"Gemini generate_text failed after {retries} retries: {last_error}")
        raise AIGenerationError(f"Gemini generation failed: {str(last_error)}")

    async def generate_structured(
        self,
        prompt: str,
        response_schema: Type[T],
        system_instruction: Optional[str] = None
    ) -> T:
        """
        Generate structured response matching Pydantic schema T.
        Enforces JSON output and validates response against schema with fallback repair.
        """
        schema_json_str = json.dumps(response_schema.model_json_schema(), indent=2)

        enhanced_system_instruction = (
            f"{system_instruction or ''}\n\n"
            f"CRITICAL REQUIREMENT: You MUST respond ONLY with a valid JSON object matching the following JSON Schema:\n"
            f"```json\n{schema_json_str}\n```\n"
            f"Do NOT wrap JSON in additional prose or markdown text outside the JSON block."
        )

        config = types.GenerateContentConfig(
            system_instruction=enhanced_system_instruction,
            response_mime_type="application/json",
            response_schema=response_schema,
            temperature=0.3,
        )

        last_error = None
        retries = settings.AI_MAX_RETRIES

        for attempt in range(1, retries + 1):
            try:
                response = await asyncio.to_thread(
                    self.client.models.generate_content,
                    model=self.model_name,
                    contents=prompt,
                    config=config,
                )

                if not response or not response.text:
                    raise AIGenerationError("Empty text response received from Gemini.")

                raw_text = response.text.strip()

                # Clean markdown block markers if present
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()

                # Validate Pydantic Model
                validated_object = response_schema.model_validate_json(raw_text)
                return validated_object

            except (PydanticValidationError, json.JSONDecodeError) as ve:
                last_error = ve
                logger.warning(f"Structured output schema validation failed (attempt {attempt}/{retries}): {ve}")
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini generate_structured attempt {attempt}/{retries} failed: {e}")

            if attempt < retries:
                await asyncio.sleep(settings.AI_RETRY_BACKOFF_FACTOR ** attempt)

        logger.error(f"Gemini generate_structured failed after {retries} retries: {last_error}")
        raise AIGenerationError(f"Failed to generate structured data for schema {response_schema.__name__}: {str(last_error)}")
