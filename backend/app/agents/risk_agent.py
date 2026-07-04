from app.agents.base_agent import BaseAgent


class RiskAgent(BaseAgent):

    @property
    def agent_name(self):
        return "Risk Agent"

    def build_prompt(self, **kwargs):
        return ""

    def run(self, project_plan):

        print("⚠️ Risk Agent Running...")

        risks = []

        requirements = project_plan["requirements"].lower()

        if "ai" in requirements:

            risks.append(
                "AI responses may occasionally be inaccurate."
            )

        if "login" in requirements:

            risks.append(
                "Authentication vulnerabilities."
            )

        if "payment" in requirements:

            risks.append(
                "Payment gateway integration risks."
            )

        if not risks:

            risks.append(
                "Standard project delivery risks."
            )

        return {
            "risks": risks
        }