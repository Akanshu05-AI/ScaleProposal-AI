from typing import Optional
from app.agents.base_agent import BaseAgent
from app.schemas.agent_outputs import PlannerOutput


class PlannerAgent(BaseAgent):
    """
    Genuine AI Planner Agent.
    Analyzes project scope, company context, and requirements to generate structured
    deliverables, phases, technology stack, complexity ratings, and dependency mappings.
    """

    @property
    def agent_name(self) -> str:
        return "Planner Agent"

    @property
    def system_instruction(self) -> str:
        return (
            "You are a Lead Software Architect and Enterprise Solutions Consultant. "
            "Your objective is to analyze client business and technical requirements, break down "
            "the project scope into modular deliverables and logical implementation phases, "
            "select an optimal modern technology stack, evaluate architectural complexity, "
            "and identify critical integration dependencies and project assumptions."
        )

    async def run(
        self,
        company_name: str,
        project_type: str,
        requirements: str,
        budget: Optional[str] = None,
        deadline: Optional[str] = None,
        industry: Optional[str] = None,
        target_audience: Optional[str] = None,
    ) -> PlannerOutput:
        clean_company = self.sanitize_input(company_name)
        clean_project = self.sanitize_input(project_type)
        clean_reqs = self.sanitize_input(requirements)
        clean_budget = self.sanitize_input(budget or "Flexible")
        clean_deadline = self.sanitize_input(deadline or "Standard Timeline")
        clean_industry = self.sanitize_input(industry or "General Industry")
        clean_audience = self.sanitize_input(target_audience or "End Users")

        prompt = f"""
Analyze the following client proposal request and generate a detailed, structured project plan:

CLIENT CONTEXT:
- Company Name: {clean_company}
- Industry: {clean_industry}
- Project Type: {clean_project}
- Target Audience: {clean_audience}
- Budget Target: {clean_budget}
- Desired Deadline/Timeline: {clean_deadline}

DETAILED PROJECT REQUIREMENTS:
{clean_reqs}

INSTRUCTIONS:
1. Provide a comprehensive technical summary of the project.
2. Outline 3 to 5 core business and engineering objectives.
3. Break the project down into concrete, actionable deliverables with descriptions and phases.
4. Structure the development lifecycle into sequential phases (e.g. Phase 1: Discovery & Architecture, Phase 2: Core Engineering, Phase 3: Testing & Deployment).
5. Recommend a modern, production-grade technology stack (Frontend, Backend, Database, Cloud/AI services).
6. List critical technical dependencies (third-party APIs, authentication providers, external data sources).
7. Document engineering and architectural assumptions.
8. Assess overall project complexity (Low, Medium, High, or Critical).
"""

        planner_output = await self.generate_structured(prompt, schema=PlannerOutput)
        return planner_output