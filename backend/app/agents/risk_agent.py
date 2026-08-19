from typing import Optional
from app.agents.base_agent import BaseAgent
from app.schemas.agent_outputs import PlannerOutput, PricingOutput, RiskOutput


class RiskAgent(BaseAgent):
    """
    Genuine AI Risk Agent.
    Evaluates project scope, technology stack, dependencies, deliverables, and timeline to identify
    technical, security, integration, AI model, timeline, budget, and operational risks.
    Provides actionable risk mitigations for every identified vector.
    """

    @property
    def agent_name(self) -> str:
        return "Risk Agent"

    @property
    def system_instruction(self) -> str:
        return (
            "You are a Lead Cybersecurity Risk Analyst and Enterprise System Auditor. "
            "Your objective is to conduct a thorough risk assessment on proposed software projects. "
            "Identify vectors across Technical, Security, Integration, AI/Model, Timeline, Operational, "
            "and Financial categories. For every identified risk vector, specify severity, probability, "
            "business impact, and a concrete, actionable engineering mitigation strategy. "
            "Do NOT use simple keyword matching."
        )

    async def run(
        self,
        planner_output: PlannerOutput,
        pricing_output: Optional[PricingOutput] = None
    ) -> RiskOutput:
        deliverables_str = "\n".join(
            f"- {d.title}: {d.description} (Phase: {d.phase})"
            for d in planner_output.deliverables
        )
        stack_str = ", ".join(planner_output.recommended_stack)
        deps_str = ", ".join(planner_output.dependencies) or "None specified"
        timeline_str = pricing_output.timeline if pricing_output else "Standard Timeline"
        budget_str = f"${pricing_output.estimated_total:,.2f}" if pricing_output else "Not provided"

        prompt = f"""
Conduct a comprehensive risk assessment for the following proposed software application:

PROJECT OVERVIEW:
- Company Name: {planner_output.company_name}
- Project Type: {planner_output.project_type}
- Technical Complexity: {planner_output.complexity}
- Technology Stack: {stack_str}
- Integration Dependencies: {deps_str}
- Delivery Timeline Target: {timeline_str}
- Estimated Total Budget: {budget_str}

PROJECT SUMMARY:
{planner_output.project_summary}

PLANNED DELIVERABLES:
{deliverables_str}

INSTRUCTIONS:
1. Identify 4 to 8 critical risk vectors across categories: Technical, Security, Integration, AI/Model, Timeline, Operational, Budget.
2. For each risk vector, assign:
   - Category (Technical, Security, Integration, AI/Model, Timeline, Operational, Budget)
   - Severity (Low, Medium, High, Critical)
   - Probability (Low, Medium, High)
   - Impact explanation
   - Specific mitigation strategy
3. Provide an executive summary of the overall risk posture.
4. Rate the overall project risk level (Low, Medium, High, Critical).
"""

        risk_output = await self.generate_structured(prompt, schema=RiskOutput)
        return risk_output