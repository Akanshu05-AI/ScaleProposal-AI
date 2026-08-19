from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ProposalCreateRequest(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=100, description="Client company name")
    project_type: str = Field(..., min_length=1, max_length=100, description="Target project classification")
    requirements: str = Field(..., min_length=10, max_length=5000, description="Detailed project requirements")
    budget_target: Optional[str] = Field(None, max_length=100, description="Optional budget target")
    deadline_target: Optional[str] = Field(None, max_length=100, description="Optional target deadline")
    industry: Optional[str] = Field(None, max_length=100, description="Optional industry context")
    target_audience: Optional[str] = Field(None, max_length=100, description="Optional target user audience")
    workflow_id: Optional[str] = Field(None, description="Optional custom workflow session ID")


class ProposalSummaryResponse(BaseModel):
    id: str
    workflow_id: str
    company_name: str
    project_type: str
    cost: Optional[str] = None
    timeline: Optional[str] = None
    overall_risk_level: Optional[str] = None
    status: str
    created_at: datetime


class ProposalListResponse(BaseModel):
    total: int
    proposals: List[ProposalSummaryResponse]


class ProposalResponse(BaseModel):
    id: str
    workflow_id: str
    company_name: str
    project_type: str
    requirements: str
    status: str
    total_execution_time: Optional[str] = None
    planner: Optional[Dict[str, Any]] = None
    pricing: Optional[Dict[str, Any]] = None
    risk: Optional[Dict[str, Any]] = None
    proposal: Optional[Dict[str, Any]] = None
    final_markdown: Optional[str] = None
    created_at: datetime


class AgentExecutionResponse(BaseModel):
    id: str
    agent_name: str
    status: str
    execution_time: Optional[str] = None
    created_at: datetime
