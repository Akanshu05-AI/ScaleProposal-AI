from app.agents.base_agent import BaseAgent


class ProposalAgent(BaseAgent):

    @property
    def agent_name(self):
        return "Proposal Agent"

    def build_prompt(
        self,
        planner_output,
        pricing_output,
        risk_output
    ):

        return f"""
You are a senior AI Proposal Writer working for a professional software consulting company.

Your task is to generate a polished, client-ready business proposal based on the structured analysis provided below.

==========================
CLIENT INFORMATION
==========================

Company Name:
{planner_output["company_name"]}

Project Type:
{planner_output["project_type"]}

Requirements:
{planner_output["requirements"]}

==========================
PROJECT PLAN
==========================

Project Goal:
{planner_output["goal"]}

Deliverables:
{", ".join(planner_output["deliverables"])}

Suggested Tech Stack:
{", ".join(planner_output["tech_stack"])}

==========================
PROJECT ESTIMATION
==========================

Estimated Timeline:
{pricing_output["timeline"]}

Estimated Budget:
{pricing_output["budget"]}

Recommended Team Size:
{pricing_output["team_size"]}

==========================
RISK ANALYSIS
==========================

Potential Risks:
{chr(10).join("- " + risk for risk in risk_output["risks"])}

==========================
INSTRUCTIONS
==========================

Generate a premium business proposal.

The proposal must include:

# Executive Summary

# Understanding Client Requirements

# Proposed Solution

# Key Features

# Technology Stack

# Project Deliverables

# Estimated Timeline

# Budget Estimation

# Risk Assessment & Mitigation

# Why Choose Us

# Conclusion

Write in a professional consulting tone.

Return the response in clean Markdown format.
"""

    def run(
        self,
        planner_output,
        pricing_output,
        risk_output
    ):

        print("✍️ Proposal Agent Running...")

        return self.generate(
            planner_output=planner_output,
            pricing_output=pricing_output,
            risk_output=risk_output
        )