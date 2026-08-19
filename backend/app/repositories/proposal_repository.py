from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.models.proposal import Proposal
from app.models.agent_execution import AgentExecution
from app.core.logging import logger


class ProposalRepository:
    """Repository handling database persistence and query operations for proposals and agent executions."""

    @staticmethod
    def create_proposal(
        db: Session,
        workflow_result: Dict[str, Any],
        company_name: str,
        project_type: str,
        requirements: str,
        budget_target: Optional[str] = None,
        deadline_target: Optional[str] = None,
    ) -> Proposal:
        planner = workflow_result.get("planner")
        pricing = workflow_result.get("pricing")
        risk = workflow_result.get("risk")
        proposal = workflow_result.get("proposal")

        db_proposal = Proposal(
            workflow_id=workflow_result["workflow_id"],
            company_name=company_name,
            project_type=project_type,
            requirements=requirements,
            budget_target=budget_target,
            deadline_target=deadline_target,
            status="completed",
            estimated_total=pricing.estimated_total if pricing else None,
            pricing_range=pricing.pricing_range if pricing else None,
            timeline=pricing.timeline if pricing else None,
            overall_risk_level=risk.overall_risk_level if risk else None,
            total_execution_time=workflow_result.get("total_execution_time"),
            planner_output=planner.model_dump() if hasattr(planner, "model_dump") else planner,
            pricing_output=pricing.model_dump() if hasattr(pricing, "model_dump") else pricing,
            risk_output=risk.model_dump() if hasattr(risk, "model_dump") else risk,
            proposal_output=proposal.model_dump() if hasattr(proposal, "model_dump") else proposal,
            final_markdown=proposal.markdown_content if hasattr(proposal, "markdown_content") else str(proposal),
        )

        db.add(db_proposal)
        db.flush()

        # Create AgentExecution tracking logs
        steps = workflow_result.get("workflow_steps", [])
        for step in steps:
            agent_log = AgentExecution(
                proposal_id=db_proposal.id,
                agent_name=step.get("agent", "Agent"),
                status=step.get("status", "Completed"),
                execution_time=step.get("execution_time"),
            )
            db.add(agent_log)

        db.commit()
        db.refresh(db_proposal)
        logger.info(f"Persisted Proposal ID: {db_proposal.id} (Workflow: {db_proposal.workflow_id}) to database.")
        return db_proposal

    @staticmethod
    def get_by_id_or_workflow(db: Session, identifier: str) -> Optional[Proposal]:
        """Fetch proposal by either UUID primary key or workflow_id string."""
        return db.query(Proposal).filter(
            or_(Proposal.id == identifier, Proposal.workflow_id == identifier)
        ).first()

    @staticmethod
    def list_proposals(
        db: Session,
        limit: int = 50,
        offset: int = 0,
        search: Optional[str] = None
    ) -> List[Proposal]:
        """List historical proposals sorted by creation date descending with optional text search."""
        query = db.query(Proposal)
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Proposal.company_name.ilike(term),
                    Proposal.project_type.ilike(term),
                    Proposal.requirements.ilike(term),
                )
            )
        return query.order_by(desc(Proposal.created_at)).offset(offset).limit(limit).all()

    @staticmethod
    def delete_proposal(db: Session, identifier: str) -> bool:
        """Delete a proposal and its linked execution logs."""
        proposal = ProposalRepository.get_by_id_or_workflow(db, identifier)
        if not proposal:
            return False
        db.delete(proposal)
        db.commit()
        logger.info(f"Deleted Proposal ID: {identifier} from database.")
        return True

    @staticmethod
    def get_agent_executions(db: Session, proposal_id: str) -> List[AgentExecution]:
        """Retrieve execution logs for a proposal."""
        return db.query(AgentExecution).filter(
            AgentExecution.proposal_id == proposal_id
        ).order_by(AgentExecution.created_at.asc()).all()
