from fastapi import APIRouter, HTTPException
from app.schemas.proposal import ProposalRequest
from app.orchestrator.workflow import ProposalWorkflow

router = APIRouter()

@router.post("/proposal", tags=["Proposal"])
async def generate_proposal(request: ProposalRequest):
    try:
        # Instantiate your custom multi-agent workflow orchestrator class
        workflow_engine = ProposalWorkflow()
        
        # Execute the sequential python agent processing tree
        result = await workflow_engine.execute(
            company_name=request.company_name,
            project_type=request.project_type,
            requirements=request.requirements,
        )
        
        # Ensure that intermediate dict outputs are explicitly broken out 
        # instead of hiding behind a single string return payload
        return {
            "status": "success",
            "proposal": result.get("proposal"),
            "planner_data": result.get("workflow")[0].get("status") if len(result.get("workflow", [])) > 0 else {},
            "pricing_data": result.get("workflow")[1].get("status") if len(result.get("workflow", [])) > 1 else {},
            "risk_data": result.get("workflow")[2].get("status") if len(result.get("workflow", [])) > 2 else {},
            "workflow": result.get("workflow"),
            "total_execution_time": result.get("total_execution_time")
        }

    except Exception as e:
        print(f"\n❌ Proposal Generation Failed via API Route:\n{e}\n")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )