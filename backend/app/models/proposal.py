import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String(64), unique=True, nullable=False, index=True)
    company_name = Column(String(100), nullable=False, index=True)
    project_type = Column(String(100), nullable=False, index=True)
    requirements = Column(Text, nullable=False)
    budget_target = Column(String(100), nullable=True)
    deadline_target = Column(String(100), nullable=True)
    status = Column(String(20), nullable=False, default="completed", index=True)

    # Financial / Summary metrics
    estimated_total = Column(Float, nullable=True)
    pricing_range = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)
    overall_risk_level = Column(String(20), nullable=True)
    total_execution_time = Column(String(20), nullable=True)

    # Structured JSON agent outputs
    planner_output = Column(JSON, nullable=True)
    pricing_output = Column(JSON, nullable=True)
    risk_output = Column(JSON, nullable=True)
    proposal_output = Column(JSON, nullable=True)
    final_markdown = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    agent_executions = relationship("AgentExecution", back_populates="proposal", cascade="all, delete-orphan")
