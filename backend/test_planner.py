from app.agents.planner_agent import PlannerAgent

agent = PlannerAgent()

result = agent.run(
    company_name="ScaleOn",
    project_type="AI Proposal Platform",
    requirements="Create an AI platform that automatically generates business proposals."
)

print(result)