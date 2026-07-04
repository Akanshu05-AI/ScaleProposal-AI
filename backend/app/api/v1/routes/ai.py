from fastapi import APIRouter

from app.services.gemini_service import gemini_service

router = APIRouter()


@router.get("/ai/test")
def test_ai():

    prompt = """
    Say hello to ScaleProposal AI.
    """

    response = gemini_service.generate(prompt)

    return {
        "response": response
    }