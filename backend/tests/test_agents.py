import pytest
from app.agents.planner_agent import PlannerAgent
from app.agents.pricing_agent import PricingAgent
from app.agents.risk_agent import RiskAgent
from app.agents.proposal_agent import ProposalAgent
from app.schemas.agent_outputs import PlannerOutput, PricingOutput, RiskOutput, ProposalOutput


@pytest.mark.asyncio
async def test_planner_agent():
    agent = PlannerAgent()
    assert agent.agent_name == "Planner Agent"
    
    result = await agent.run(
        company_name="Acme Corp",
        project_type="Enterprise AI Platform",
        requirements="Build an enterprise AI decision engine with real-time analytics."
    )

    assert isinstance(result, PlannerOutput)
    assert result.company_name == "TestCorp"
    assert len(result.deliverables) > 0
    assert len(result.recommended_stack) > 0


@pytest.mark.asyncio
async def test_pricing_agent():
    planner = PlannerAgent()
    planner_result = await planner.run("Acme", "AI App", "Build AI app.")

    pricing_agent = PricingAgent()
    assert pricing_agent.agent_name == "Pricing Agent"

    result = await pricing_agent.run(planner_output=planner_result)
    assert isinstance(result, PricingOutput)
    assert result.estimated_total > 0
    assert result.effort_hours > 0
    assert result.currency == "USD"


@pytest.mark.asyncio
async def test_risk_agent():
    planner = PlannerAgent()
    planner_result = await planner.run("Acme", "AI App", "Build AI app.")

    risk_agent = RiskAgent()
    assert risk_agent.agent_name == "Risk Agent"

    result = await risk_agent.run(planner_output=planner_result)
    assert isinstance(result, RiskOutput)
    assert len(result.risks) > 0
    assert result.risks[0].severity in ["Low", "Medium", "High", "Critical"]


@pytest.mark.asyncio
async def test_proposal_agent():
    planner_result = await PlannerAgent().run("Acme", "AI App", "Build AI app.")
    pricing_result = await PricingAgent().run(planner_result)
    risk_result = await RiskAgent().run(planner_result)

    proposal_agent = ProposalAgent()
    assert proposal_agent.agent_name == "Proposal Agent"

    result = await proposal_agent.run(
        planner_output=planner_result,
        pricing_output=pricing_result,
        risk_output=risk_result
    )

    assert isinstance(result, ProposalOutput)
    assert len(result.markdown_content) > 50
    assert "Executive" in result.executive_summary or "Mock" in result.executive_summary
