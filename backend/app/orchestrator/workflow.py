import time
import uuid
from typing import Dict, Any, Optional

from app.agents.planner_agent import PlannerAgent
from app.agents.pricing_agent import PricingAgent
from app.agents.risk_agent import RiskAgent
from app.agents.proposal_agent import ProposalAgent

from app.services.event_manager import event_manager
from app.core.logging import logger
from app.core.exceptions import AgentExecutionError


class ProposalWorkflow:
    """
    Multi-Agent Proposal Generation Workflow Orchestrator.
    Manages sequential execution of Planner, Pricing, Risk, and Proposal agents,
    publishing isolated real-time progress events per workflow_id.
    """

    def __init__(self):
        self.planner = PlannerAgent()
        self.pricing = PricingAgent()
        self.risk = RiskAgent()
        self.proposal = ProposalAgent()

    async def execute(
        self,
        company_name: str,
        project_type: str,
        requirements: str,
        workflow_id: Optional[str] = None,
        budget: Optional[str] = None,
        deadline: Optional[str] = None,
        industry: Optional[str] = None,
        target_audience: Optional[str] = None,
    ) -> Dict[str, Any]:
        
        workflow_id = workflow_id or f"wf-{uuid.uuid4().hex[:12]}"
        overall_start = time.time()
        workflow_steps = []

        logger.info(f"🚀 Starting Proposal Workflow [ID: {workflow_id}] for '{company_name}' ({project_type})")

        try:
            # ==================================================
            # Step 1: Planner Agent
            # ==================================================
            await event_manager.publish(workflow_id, {
                "agent": "planner",
                "status": "running",
                "message": "Analyzing project scope, deliverables, and technology stack..."
            })
            p_start = time.time()
            planner_output = await self.planner.run(
                company_name=company_name,
                project_type=project_type,
                requirements=requirements,
                budget=budget,
                deadline=deadline,
                industry=industry,
                target_audience=target_audience,
            )
            p_time = f"{time.time() - p_start:.2f}s"

            await event_manager.publish(workflow_id, {
                "agent": "planner",
                "status": "completed",
                "executionTime": p_time,
                "data": planner_output.model_dump()
            })
            workflow_steps.append({
                "agent": "Planner Agent",
                "icon": "🧠",
                "task": "Requirement & Scope Planning",
                "status": "Completed",
                "execution_time": p_time,
            })

            # ==================================================
            # Step 2: Pricing Agent
            # ==================================================
            await event_manager.publish(workflow_id, {
                "agent": "pricing",
                "status": "running",
                "message": "Calculating effort hours, team allocation, and cost matrix..."
            })
            pr_start = time.time()
            pricing_output = await self.pricing.run(planner_output=planner_output)
            pr_time = f"{time.time() - pr_start:.2f}s"

            await event_manager.publish(workflow_id, {
                "agent": "pricing",
                "status": "completed",
                "executionTime": pr_time,
                "data": pricing_output.model_dump()
            })
            workflow_steps.append({
                "agent": "Pricing Agent",
                "icon": "💰",
                "task": "Effort & Cost Estimation",
                "status": "Completed",
                "execution_time": pr_time,
            })

            # ==================================================
            # Step 3: Risk Agent
            # ==================================================
            await event_manager.publish(workflow_id, {
                "agent": "risk",
                "status": "running",
                "message": "Assessing security, technical, timeline, and operational risks..."
            })
            r_start = time.time()
            risk_output = await self.risk.run(planner_output=planner_output, pricing_output=pricing_output)
            r_time = f"{time.time() - r_start:.2f}s"

            await event_manager.publish(workflow_id, {
                "agent": "risk",
                "status": "completed",
                "executionTime": r_time,
                "data": risk_output.model_dump()
            })
            workflow_steps.append({
                "agent": "Risk Agent",
                "icon": "⚠️",
                "task": "Risk Assessment & Mitigation",
                "status": "Completed",
                "execution_time": r_time,
            })

            # ==================================================
            # Step 4: Proposal Agent
            # ==================================================
            await event_manager.publish(workflow_id, {
                "agent": "proposal",
                "status": "running",
                "message": "Synthesizing executive proposal document..."
            })
            prop_start = time.time()
            proposal_output = await self.proposal.run(
                planner_output=planner_output,
                pricing_output=pricing_output,
                risk_output=risk_output
            )
            prop_time = f"{time.time() - prop_start:.2f}s"

            await event_manager.publish(workflow_id, {
                "agent": "proposal",
                "status": "completed",
                "executionTime": prop_time,
                "data": proposal_output.model_dump()
            })
            workflow_steps.append({
                "agent": "Proposal Agent",
                "icon": "✍️",
                "task": "Final Proposal Synthesis",
                "status": "Completed",
                "execution_time": prop_time,
            })

            total_duration = f"{time.time() - overall_start:.2f}s"

            # Publish final workflow completion event
            await event_manager.publish(workflow_id, {
                "agent": "workflow",
                "status": "finished",
                "executionTime": total_duration
            })

            logger.info(f"✅ Workflow [ID: {workflow_id}] Completed Successfully in {total_duration}")

            return {
                "workflow_id": workflow_id,
                "status": "completed",
                "total_execution_time": total_duration,
                "planner": planner_output,
                "pricing": pricing_output,
                "risk": risk_output,
                "proposal": proposal_output,
                "workflow_steps": workflow_steps,
            }

        except Exception as e:
            logger.error(f"❌ Workflow [ID: {workflow_id}] Failed: {e}", exc_info=True)
            await event_manager.publish(workflow_id, {
                "agent": "workflow",
                "status": "failed",
                "error": str(e)
            })
            raise AgentExecutionError("WorkflowExecution", str(e))