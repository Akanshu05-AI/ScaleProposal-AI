from google import genai
from app.core.config import settings


class GeminiService:

    @staticmethod
    def generate(prompt: str) -> str:
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            return response.text

        except Exception as e:
            print("=" * 60)
            print("GEMINI ERROR")
            print(e)
            print("=" * 60)

            return f"Gemini Error: {str(e)}"