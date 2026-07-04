from pydantic import BaseModel


class ProposalRequest(BaseModel):
    company_name: str
    project_type: str
    requirements: str