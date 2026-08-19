import pytest
from typing import Type, TypeVar
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.database import Base
from app.services.ai.provider import AIProvider
from app.services.gemini_service import AIService
from app.schemas.agent_outputs import (
    PlannerOutput, DeliverableItem, PhaseItem,
    PricingOutput, RiskOutput, RiskItem, ProposalOutput
)

T = TypeVar("T", bound=BaseModel)


class MockAIProvider(AIProvider):
    """Mock AI Provider returning deterministic structured Pydantic schemas for tests."""

    async def generate_text(self, prompt: str, system_instruction: str = None) -> str:
        return "Mock text response from MockAIProvider"

    async def generate_structured(self, prompt: str, response_schema: Type[T], system_instruction: str = None) -> T:
        if response_schema == PlannerOutput:
            return PlannerOutput(
                company_name="TestCorp",
                project_type="AI Platform",
                project_summary="A modern test AI platform summary.",
                objectives=["Objective 1", "Objective 2"],
                deliverables=[
                    DeliverableItem(title="Requirement Specs", description="Spec docs", phase="Phase 1", complexity="Low"),
                    DeliverableItem(title="Core Architecture", description="Design system", phase="Phase 2", complexity="Medium"),
                ],
                phases=[
                    PhaseItem(phase_number=1, phase_name="Discovery", duration_weeks=2, key_activities=["Req Gathering"]),
                    PhaseItem(phase_number=2, phase_name="Engineering", duration_weeks=4, key_activities=["Development"]),
                ],
                recommended_stack=["Next.js", "FastAPI", "SQLite"],
                dependencies=["Auth0"],
                assumptions=["Client provides API key"],
                complexity="Medium"
            )
        elif response_schema == PricingOutput:
            return PricingOutput(
                currency="USD",
                development_cost=10000.0,
                infrastructure_cost=2000.0,
                maintenance_cost=1000.0,
                estimated_total=13000.0,
                pricing_range="$12,000 - $14,000",
                effort_hours=160,
                team_allocation=["Lead Architect", "Full-Stack Dev"],
                timeline="6 Weeks",
                reasoning="Calculated based on 160 effort hours at standard rates.",
                assumptions=["Standard working hours"]
            )
        elif response_schema == RiskOutput:
            return RiskOutput(
                overall_risk_level="Low",
                summary="Project has low overall risk with well-defined mitigations.",
                risks=[
                    RiskItem(
                        risk="API Rate Limiting",
                        category="Integration",
                        severity="Low",
                        probability="Low",
                        impact="Potential slow response time",
                        mitigation="Implement caching and retries"
                    )
                ]
            )
        elif response_schema == ProposalOutput:
            return ProposalOutput(
                executive_summary="Mock Executive Summary",
                client_problem="Mock Client Problem",
                objectives=["Mock Objective"],
                proposed_solution="Mock Proposed Solution",
                key_features=["Feature 1"],
                technical_architecture="Mock Architecture",
                technology_stack=["FastAPI", "Next.js"],
                implementation_plan=["Milestone 1"],
                timeline="6 Weeks",
                deliverables=["Deliverable 1"],
                pricing_summary="$13,000 total investment",
                risks_and_mitigation=["Rate limit mitigation"],
                assumptions=["Commercial assumptions"],
                maintenance_support="24/7 SLA",
                why_choose_us="Industry expertise",
                next_steps=["Kickoff call"],
                markdown_content="# Mock Proposal Document\n\nExecutive summary text goes here."
            )
        raise ValueError(f"No mock response configured for schema {response_schema.__name__}")


@pytest.fixture(autouse=True)
def set_mock_ai_provider():
    """Autouse fixture injecting MockAIProvider for all tests."""
    mock_provider = MockAIProvider()
    AIService.set_provider(mock_provider)
    yield
    AIService.set_provider(None)


@pytest.fixture
def db_session():
    """In-memory SQLite database session fixture using StaticPool for single connection memory reuse."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
