def build_proposal_prompt(
    company_name: str,
    project_type: str,
    requirements: str
):
    return f"""
You are a professional AI Proposal Writer.

Generate a detailed proposal.

Company:
{company_name}

Project Type:
{project_type}

Requirements:
{requirements}

The proposal should contain:

1. Executive Summary
2. Problem Statement
3. Proposed Solution
4. Features
5. Tech Stack
6. Timeline
7. Deliverables
8. Estimated Cost
9. Why Choose Us

Return everything in markdown.
"""