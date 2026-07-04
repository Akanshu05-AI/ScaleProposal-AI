from app.agents.base_agent import BaseAgent


class PlannerAgent(BaseAgent):

    @property
    def agent_name(self):
        return "Planner Agent"

    def build_prompt(self, **kwargs):
        # Not used anymore
        return ""

    def run(
        self,
        company_name: str,
        project_type: str,
        requirements: str
    ):

        print("🧠 Planner Agent Running...")

        return {
            "company_name": company_name,
            "project_type": project_type,
            "requirements": requirements,
            "goal": f"Develop a {project_type} for {company_name}.",
            "deliverables": [
                "Requirement Analysis",
                "System Design",
                "Development",
                "Testing",
                "Deployment"
            ],
            "tech_stack": [
                "Next.js",
                "FastAPI",
                "Gemini AI",
                "SQLite"
            ]
        }