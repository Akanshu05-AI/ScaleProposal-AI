import pytest
from app.orchestrator.workflow import ProposalWorkflow


@pytest.mark.asyncio
async def test_proposal_workflow_execution():
    workflow = ProposalWorkflow()
    result = await workflow.execute(
        company_name="ScaleOn Test",
        project_type="Automated Proposal Generator",
        requirements="Develop a production-grade multi-agent business proposal generator.",
        workflow_id="wf-test-12345"
    )

    assert result["status"] == "completed"
    assert result["workflow_id"] == "wf-test-12345"
    assert result["planner"] is not None
    assert result["pricing"] is not None
    assert result["risk"] is not None
    assert result["proposal"] is not None
    assert len(result["workflow_steps"]) == 4
