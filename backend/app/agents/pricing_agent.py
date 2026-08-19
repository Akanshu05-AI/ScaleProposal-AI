from app.agents.base_agent import BaseAgent
from app.schemas.agent_outputs import PlannerOutput, PricingOutput


class PricingAgent(BaseAgent):
    """
    Genuine AI Pricing Agent.
    Evaluates project scope, architectural complexity, deliverables, and tech stack from
    PlannerOutput to estimate effort hours, team roles, delivery timeline, and itemized cost estimates.
    """

    @property
    def agent_name(self) -> str:
        return "Pricing Agent"

    @property
    def system_instruction(self) -> str:
        return (
            "You are a Senior Technology Estimator and Solutions Pricing Director. "
            "Your role is to analyze structured project plans (deliverables, tech stack, complexity) "
            "and calculate accurate engineering effort hours, recommended team roles, delivery timeline, "
            "and itemized cost estimates (development cost, cloud infrastructure, annual maintenance). "
            "Do NOT use arbitrary string lengths or rule-of-thumb heuristics. Base estimates on "
            "actual feature complexity, integrations, team velocity, and industry standard rates."
        )

    async def run(self, planner_output: PlannerOutput) -> PricingOutput:
        # Format planner data for prompt context
        deliverables_str = "\n".join(
            f"- [{d.phase}] {d.title} (Complexity: {d.complexity}): {d.description}"
            for d in planner_output.deliverables
        )
        phases_str = "\n".join(
            f"- Phase {p.phase_number}: {p.phase_name} ({p.duration_weeks} weeks)"
            for p in planner_output.phases
        )
        stack_str = ", ".join(planner_output.recommended_stack)
        deps_str = ", ".join(planner_output.dependencies) or "None specified"

        prompt = f"""
Analyze the following structured project plan and calculate a realistic commercial pricing & effort matrix:

PROJECT SPECIFICATIONS:
- Company Name: {planner_output.company_name}
- Project Type: {planner_output.project_type}
- Overall Complexity: {planner_output.complexity}
- Technical Stack: {stack_str}
- Integration Dependencies: {deps_str}

PROJECT SUMMARY:
{planner_output.project_summary}

DELIVERABLES TO ESTIMATE:
{deliverables_str}

PROPOSED PHASES:
{phases_str}

INSTRUCTIONS:
1. Estimate total engineering effort hours required based on deliverable scope and complexity.
2. Recommend a dedicated team composition (e.g. 1 Lead Architect, 2 Full-Stack Engineers, 1 QA Specialist).
3. Determine realistic overall delivery timeline in weeks/months.
4. Calculate development cost based on effort hours and specialized skills required.
5. Estimate cloud infrastructure, hosting, and AI API costs.
6. Estimate annual/monthly maintenance & support cost.
7. Provide a pricing range (e.g., "$15,000 - $18,000") reflecting risk contingency.
8. Explain the financial and effort allocation reasoning clearly.
"""

        pricing_output = await self.generate_structured(prompt, schema=PricingOutput)

        # Deterministic Math Verification: ensure estimated_total matches sum of component costs
        calc_total = (
            pricing_output.development_cost
            + pricing_output.infrastructure_cost
            + pricing_output.maintenance_cost
        )
        if pricing_output.estimated_total <= 0 or abs(pricing_output.estimated_total - calc_total) > 1000:
            pricing_output.estimated_total = round(calc_total, 2)

        return pricing_output