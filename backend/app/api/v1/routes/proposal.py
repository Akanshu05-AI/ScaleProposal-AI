from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.api.v1.schemas.proposal_api import (
    ProposalCreateRequest,
    ProposalResponse,
    ProposalListResponse,
    ProposalSummaryResponse,
    AgentExecutionResponse,
)
from app.orchestrator.workflow import ProposalWorkflow
from app.repositories.proposal_repository import ProposalRepository
from app.core.exceptions import create_error_response, ProposalNotFoundError

router = APIRouter()


@router.post(
    "/proposals",
    response_model=ProposalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a new AI Proposal",
    tags=["Proposals"]
)
async def generate_proposal(
    request: ProposalCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Triggers the multi-agent workflow (Planner -> Pricing -> Risk -> Proposal),
    streams progress events over SSE, and persists the final proposal to SQLite/PostgreSQL.
    """
    try:
        workflow_engine = ProposalWorkflow()

        # Execute multi-agent python execution pipeline
        result = await workflow_engine.execute(
            company_name=request.company_name,
            project_type=request.project_type,
            requirements=request.requirements,
            workflow_id=request.workflow_id,
            budget=request.budget_target,
            deadline=request.deadline_target,
            industry=request.industry,
            target_audience=request.target_audience,
        )

        # Persist proposal and agent execution logs to database
        db_proposal = ProposalRepository.create_proposal(
            db=db,
            workflow_result=result,
            company_name=request.company_name,
            project_type=request.project_type,
            requirements=request.requirements,
            budget_target=request.budget_target,
            deadline_target=request.deadline_target,
        )

        return ProposalResponse(
            id=db_proposal.id,
            workflow_id=db_proposal.workflow_id,
            company_name=db_proposal.company_name,
            project_type=db_proposal.project_type,
            requirements=db_proposal.requirements,
            status=db_proposal.status,
            total_execution_time=db_proposal.total_execution_time,
            planner=db_proposal.planner_output,
            pricing=db_proposal.pricing_output,
            risk=db_proposal.risk_output,
            proposal=db_proposal.proposal_output,
            final_markdown=db_proposal.final_markdown,
            created_at=db_proposal.created_at,
        )

    except Exception as e:
        raise create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="WORKFLOW_GENERATION_FAILED",
            message=f"Proposal generation failed: {str(e)}"
        )


@router.get(
    "/proposals",
    response_model=ProposalListResponse,
    summary="List historical proposals",
    tags=["Proposals"]
)
def list_proposals(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve historical proposals list with optional keyword filtering."""
    proposals = ProposalRepository.list_proposals(db=db, limit=limit, offset=offset, search=search)
    
    summary_list = [
        ProposalSummaryResponse(
            id=p.id,
            workflow_id=p.workflow_id,
            company_name=p.company_name,
            project_type=p.project_type,
            cost=p.pricing_range or (f"${p.estimated_total:,.2f}" if p.estimated_total else "N/A"),
            timeline=p.timeline or "N/A",
            overall_risk_level=p.overall_risk_level or "Medium",
            status=p.status,
            created_at=p.created_at
        )
        for p in proposals
    ]

    return ProposalListResponse(
        total=len(summary_list),
        proposals=summary_list
    )


@router.get(
    "/proposals/{identifier}",
    response_model=ProposalResponse,
    summary="Get proposal details by ID or workflow_id",
    tags=["Proposals"]
)
def get_proposal(
    identifier: str,
    db: Session = Depends(get_db)
):
    """Retrieve a specific proposal by primary key ID or workflow_id."""
    db_proposal = ProposalRepository.get_by_id_or_workflow(db=db, identifier=identifier)
    if not db_proposal:
        raise create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            code="PROPOSAL_NOT_FOUND",
            message=f"Proposal with ID or workflow_id '{identifier}' not found."
        )

    return ProposalResponse(
        id=db_proposal.id,
        workflow_id=db_proposal.workflow_id,
        company_name=db_proposal.company_name,
        project_type=db_proposal.project_type,
        requirements=db_proposal.requirements,
        status=db_proposal.status,
        total_execution_time=db_proposal.total_execution_time,
        planner=db_proposal.planner_output,
        pricing=db_proposal.pricing_output,
        risk=db_proposal.risk_output,
        proposal=db_proposal.proposal_output,
        final_markdown=db_proposal.final_markdown,
        created_at=db_proposal.created_at,
    )


@router.delete(
    "/proposals/{identifier}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete proposal",
    tags=["Proposals"]
)
def delete_proposal(
    identifier: str,
    db: Session = Depends(get_db)
):
    """Delete a proposal record and linked execution step logs."""
    deleted = ProposalRepository.delete_proposal(db=db, identifier=identifier)
    if not deleted:
        raise create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            code="PROPOSAL_NOT_FOUND",
            message=f"Proposal with ID or workflow_id '{identifier}' not found."
        )
    return None


@router.get(
    "/proposals/{identifier}/agents",
    response_model=List[AgentExecutionResponse],
    summary="Get proposal agent execution logs",
    tags=["Proposals"]
)
def get_proposal_agent_executions(
    identifier: str,
    db: Session = Depends(get_db)
):
    """Fetch execution step details for all agents involved in generating a proposal."""
    db_proposal = ProposalRepository.get_by_id_or_workflow(db=db, identifier=identifier)
    if not db_proposal:
        raise create_error_response(
            status_code=status.HTTP_404_NOT_FOUND,
            code="PROPOSAL_NOT_FOUND",
            message=f"Proposal '{identifier}' not found."
        )

    logs = ProposalRepository.get_agent_executions(db=db, proposal_id=db_proposal.id)
    return [
        AgentExecutionResponse(
            id=log.id,
            agent_name=log.agent_name,
            status=log.status,
            execution_time=log.execution_time,
            created_at=log.created_at
        )
        for log in logs
    ]