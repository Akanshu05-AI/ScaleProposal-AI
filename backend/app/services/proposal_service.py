from app.orchestrator.workflow import ProposalWorkflow


class ProposalService:
    """
    Service layer responsible for executing
    the complete Hybrid Multi-Agent Workflow.
    """

    @staticmethod
    async def generate_proposal(
        company_name: str,
        project_type: str,
        requirements: str,
    ):

        print("\n========================================")
        print("📨 New Proposal Request Received")
        print("========================================")
        print(f"Company     : {company_name}")
        print(f"Project     : {project_type}")
        print("========================================\n")

        try:

            workflow = ProposalWorkflow()

            result = await workflow.execute(
                company_name=company_name,
                project_type=project_type,
                requirements=requirements,
            )

            print("\n========================================")
            print("✅ Proposal Generated Successfully")
            print("========================================\n")

            return {
                "status": "success",
                "company_name": company_name,
                "project_type": project_type,
                "total_execution_time": result["total_execution_time"],
                "workflow": result["workflow"],
                "proposal": result["proposal"],
            }

        except Exception as e:

            print("\n========================================")
            print("❌ Proposal Generation Failed")
            print("========================================")
            print(e)
            print("========================================\n")

            raise Exception(f"Proposal Generation Failed: {str(e)}")