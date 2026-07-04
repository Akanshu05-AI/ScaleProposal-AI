from fastapi import APIRouter

from app.schemas.proposal import ProposalRequest
from app.services.proposal_service import ProposalService

router = APIRouter()


@router.post("/proposal", tags=["Proposal"])
async def generate_proposal(request: ProposalRequest):

    result = await ProposalService.generate_proposal(
        company_name=request.company_name,
        project_type=request.project_type,
        requirements=request.requirements,
    )

    return result