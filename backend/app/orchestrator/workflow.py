import time

from app.agents.planner_agent import PlannerAgent
from app.agents.pricing_agent import PricingAgent
from app.agents.risk_agent import RiskAgent
from app.agents.proposal_agent import ProposalAgent

from app.services.event_manager import event_manager


class ProposalWorkflow:

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
    ):

        overall_start = time.time()
        workflow = []

        print("\n========================================")
        print("🚀 Starting ScaleProposal AI Workflow")
        print("========================================\n")

        try:

            # ==================================================
            # Planner Agent
            # ==================================================

            await event_manager.publish({
                "agent": "planner",
                "status": "running",
            })

            planner_start = time.time()

            planner_output = self.planner.run(
                company_name=company_name,
                project_type=project_type,
                requirements=requirements,
            )

            planner_time = f"{time.time() - planner_start:.2f} sec"

            await event_manager.publish({
                "agent": "planner",
                "status": "completed",
                "executionTime": planner_time,
            })

            workflow.append({
                "agent": "Planner Agent",
                "icon": "🧠",
                "task": "Understanding client requirements",
                "status": "Completed",
                "execution_time": planner_time,
            })

            # ==================================================
            # Pricing Agent
            # ==================================================

            await event_manager.publish({
                "agent": "pricing",
                "status": "running",
            })

            pricing_start = time.time()

            pricing_output = self.pricing.run(
                project_plan=planner_output,
            )

            pricing_time = f"{time.time() - pricing_start:.2f} sec"

            await event_manager.publish({
                "agent": "pricing",
                "status": "completed",
                "executionTime": pricing_time,
            })

            workflow.append({
                "agent": "Pricing Agent",
                "icon": "💰",
                "task": "Estimating timeline & budget",
                "status": "Completed",
                "execution_time": pricing_time,
            })

            # ==================================================
            # Risk Agent
            # ==================================================

            await event_manager.publish({
                "agent": "risk",
                "status": "running",
            })

            risk_start = time.time()

            risk_output = self.risk.run(
                project_plan=planner_output,
            )

            risk_time = f"{time.time() - risk_start:.2f} sec"

            await event_manager.publish({
                "agent": "risk",
                "status": "completed",
                "executionTime": risk_time,
            })

            workflow.append({
                "agent": "Risk Agent",
                "icon": "⚠️",
                "task": "Identifying project risks",
                "status": "Completed",
                "execution_time": risk_time,
            })

            # ==================================================
            # Proposal Agent
            # ==================================================

            await event_manager.publish({
                "agent": "proposal",
                "status": "running",
            })

            proposal_start = time.time()

            final_proposal = self.proposal.run(
                planner_output=planner_output,
                pricing_output=pricing_output,
                risk_output=risk_output,
            )

            proposal_time = f"{time.time() - proposal_start:.2f} sec"

            await event_manager.publish({
                "agent": "proposal",
                "status": "completed",
                "executionTime": proposal_time,
            })

            workflow.append({
                "agent": "Proposal Agent",
                "icon": "✍️",
                "task": "Generating final proposal",
                "status": "Completed",
                "execution_time": proposal_time,
            })

            total_time = f"{time.time() - overall_start:.2f} sec"

            print("\n========================================")
            print("✅ Workflow Completed Successfully")
            print("========================================\n")

            return {
                "status": "success",
                "workflow": workflow,
                "proposal": final_proposal,
                "total_execution_time": total_time,
            }

        except Exception as e:

            failed_agent = "unknown"

            error_message = str(e)

            if "planner" in error_message.lower():
                failed_agent = "planner"
            elif "pricing" in error_message.lower():
                failed_agent = "pricing"
            elif "risk" in error_message.lower():
                failed_agent = "risk"
            elif "proposal" in error_message.lower():
                failed_agent = "proposal"

            await event_manager.publish({
                "agent": failed_agent,
                "status": "failed",
                "error": error_message,
            })

            print("\n========================================")
            print("❌ Workflow Failed")
            print(error_message)
            print("========================================\n")

            raise