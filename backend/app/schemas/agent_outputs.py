from typing import List, Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Planner Agent Schemas
# -------------------------------------------------------------

class DeliverableItem(BaseModel):
    title: str = Field(description="Name of the deliverable item")
    description: str = Field(description="Brief explanation of the deliverable")
    phase: str = Field(description="Phase in which this deliverable is completed")
    complexity: str = Field(default="Medium", description="Complexity level: Low, Medium, High, or Critical")


class PhaseItem(BaseModel):
    phase_number: int = Field(description="Sequential phase number (1, 2, 3...)")
    phase_name: str = Field(description="Name of the project phase")
    duration_weeks: int = Field(description="Estimated duration of this phase in weeks")
    key_activities: List[str] = Field(default_factory=list, description="List of key engineering activities")


class PlannerOutput(BaseModel):
    company_name: str = Field(description="Client company name")
    project_type: str = Field(description="Target project classification/type")
    project_summary: str = Field(description="High-level technical project summary")
    objectives: List[str] = Field(default_factory=list, description="Core business & technical objectives")
    deliverables: List[DeliverableItem] = Field(default_factory=list, description="Structured project deliverables")
    phases: List[PhaseItem] = Field(default_factory=list, description="Structured implementation phases")
    recommended_stack: List[str] = Field(default_factory=list, description="Recommended technology stack components")
    dependencies: List[str] = Field(default_factory=list, description="Key external systems, APIs, or data dependencies")
    assumptions: List[str] = Field(default_factory=list, description="Planning assumptions made")
    complexity: str = Field(default="Medium", description="Overall project complexity (Low, Medium, High, Critical)")


# -------------------------------------------------------------
# Pricing Agent Schemas
# -------------------------------------------------------------

class PricingOutput(BaseModel):
    currency: str = Field(default="USD", description="Currency symbol/code, e.g. USD")
    development_cost: float = Field(description="Calculated software development cost")
    infrastructure_cost: float = Field(description="Estimated cloud & infrastructure setup cost")
    maintenance_cost: float = Field(description="Estimated annual/monthly maintenance & support cost")
    estimated_total: float = Field(description="Total estimated baseline cost")
    pricing_range: str = Field(description="Formatted price range, e.g. '$12,000 - $15,000'")
    effort_hours: int = Field(description="Total calculated engineering effort in hours")
    team_allocation: List[str] = Field(default_factory=list, description="Recommended team composition")
    timeline: str = Field(description="Overall project timeline duration, e.g. '6 Weeks'")
    reasoning: str = Field(description="AI explanation of pricing & effort calculation reasoning")
    assumptions: List[str] = Field(default_factory=list, description="Financial & pricing assumptions")


# -------------------------------------------------------------
# Risk Agent Schemas
# -------------------------------------------------------------

class RiskItem(BaseModel):
    risk: str = Field(description="Title/summary of the risk vector")
    category: str = Field(description="Risk category: Technical, Security, Integration, AI/Model, Timeline, Operational, Budget")
    severity: str = Field(description="Severity: Low, Medium, High, Critical")
    probability: str = Field(description="Probability: Low, Medium, High")
    impact: str = Field(description="Description of potential business/technical impact")
    mitigation: str = Field(description="Recommended risk mitigation strategy")


class RiskOutput(BaseModel):
    overall_risk_level: str = Field(default="Medium", description="Overall project risk score (Low, Medium, High, Critical)")
    summary: str = Field(description="Executive risk analysis summary")
    risks: List[RiskItem] = Field(default_factory=list, description="List of identified risk vectors with mitigations")


# -------------------------------------------------------------
# Proposal Agent Schemas
# -------------------------------------------------------------

class ProposalOutput(BaseModel):
    executive_summary: str = Field(description="High-impact executive summary")
    client_problem: str = Field(description="Client problem statement & context")
    objectives: List[str] = Field(default_factory=list, description="Project goals and target metrics")
    proposed_solution: str = Field(description="Detailed description of proposed technical solution")
    key_features: List[str] = Field(default_factory=list, description="Core application features & capabilities")
    technical_architecture: str = Field(description="Architectural breakdown & system design explanation")
    technology_stack: List[str] = Field(default_factory=list, description="Final technology stack components")
    implementation_plan: List[str] = Field(default_factory=list, description="Execution methodology & milestones")
    timeline: str = Field(description="Project execution timeline breakdown")
    deliverables: List[str] = Field(default_factory=list, description="Summary list of project deliverables")
    pricing_summary: str = Field(description="Financial breakdown summary")
    risks_and_mitigation: List[str] = Field(default_factory=list, description="Key project risks and mitigations summary")
    assumptions: List[str] = Field(default_factory=list, description="Commercial & technical assumptions")
    maintenance_support: str = Field(description="Post-launch maintenance, SLAs, and support breakdown")
    why_choose_us: str = Field(description="Value proposition and competitive edge")
    next_steps: List[str] = Field(default_factory=list, description="Immediate call to action and onboarding steps")
    markdown_content: str = Field(description="Complete client-ready formatted Markdown business proposal")
