from app.agents.base_agent import BaseAgent


class PricingAgent(BaseAgent):

    @property
    def agent_name(self):
        return "Pricing Agent"

    def build_prompt(self, **kwargs):
        return ""

    def run(self, project_plan):

        print("💰 Pricing Agent Running...")

        req_length = len(project_plan["requirements"])

        if req_length < 200:

            return {
                "timeline": "2 Weeks",
                "budget": "$2,000",
                "team_size": 2
            }

        elif req_length < 500:

            return {
                "timeline": "1 Month",
                "budget": "$5,000",
                "team_size": 4
            }

        else:

            return {
                "timeline": "2 Months",
                "budget": "$10,000",
                "team_size": 6
            }