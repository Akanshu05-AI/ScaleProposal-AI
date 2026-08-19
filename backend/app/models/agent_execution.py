import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    proposal_id = Column(String(36), ForeignKey("proposals.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(50), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="completed")
    execution_time = Column(String(20), nullable=True)
    
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("Proposal", back_populates="agent_executions")
