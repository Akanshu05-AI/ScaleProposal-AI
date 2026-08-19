from fastapi import APIRouter
from app.services.gemini_service import AIService

router = APIRouter()


@router.get("/ai/test", tags=["AI"])
async def test_ai():
    """Test endpoint verifying Gemini AI connection."""
    prompt = "Say hello to ScaleProposal AI and confirm multi-agent provider connection."
    response = await AIService.generate_text(prompt)
    return {
        "status": "success",
        "response": response
    }