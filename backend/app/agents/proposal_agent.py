from app.agents.base_agent import BaseAgent
from app.schemas.agent_outputs import PlannerOutput, PricingOutput, RiskOutput, ProposalOutput


class ProposalAgent(BaseAgent):
    """
    Genuine AI Proposal Agent.
    Synthesizes structured analysis from PlannerAgent, PricingAgent, and RiskAgent into a complete,
    executive-ready business proposal document and structured Pydantic object.
    """

    @property
    def agent_name(self) -> str:
        return "Proposal Agent"

    @property
    def system_instruction(self) -> str:
        return (
            "You are a Senior Proposal Director and Enterprise Communications Executive at a top-tier "
            "digital transformation & AI consultancy. Your goal is to synthesize structured technical, "
            "pricing, and risk analyses into a compelling, professional, client-ready business proposal. "
            "Respect the exact figures, stack selections, timelines, and risk mitigations provided by "
            "upstream specialist agents without re-inventing or contradicting their data."
        )

    async def run(
        self,
        planner_output: PlannerOutput,
        pricing_output: PricingOutput,
        risk_output: RiskOutput
    ) -> ProposalOutput:
        # Deliverables summary
        deliverables_str = "\n".join(
            f"- **{d.title}** ({d.phase}): {d.description}"
            for d in planner_output.deliverables
        )
        # Phases summary
        phases_str = "\n".join(
            f"- **Phase {p.phase_number}: {p.phase_name}** ({p.duration_weeks} weeks)\n  " +
            "; ".join(p.key_activities)
            for p in planner_output.phases
        )
        # Risks summary
        risks_str = "\n".join(
            f"- **[{r.severity} Severity | {r.category}] {r.risk}**\n  *Impact:* {r.impact}\n  *Mitigation:* {r.mitigation}"
            for r in risk_output.risks
        )

        prompt = f"""
Synthesize the following structured outputs into a comprehensive, high-converting business proposal:

CLIENT & PROJECT INFORMATION:
- Company Name: {planner_output.company_name}
- Project Type: {planner_output.project_type}
- Technical Complexity: {planner_output.complexity}

PLANNER ANALYSIS:
- Summary: {planner_output.project_summary}
- Objectives: {", ".join(planner_output.objectives)}
- Technology Stack: {", ".join(planner_output.recommended_stack)}
- Dependencies: {", ".join(planner_output.dependencies) or "None"}
- Assumptions: {", ".join(planner_output.assumptions) or "Standard commercial assumptions"}

DELIVERABLES:
{deliverables_str}

IMPLEMENTATION PHASES:
{phases_str}

PRICING & FINANCIAL ANALYSIS:
- Timeline: {pricing_output.timeline}
- Total Effort: {pricing_output.effort_hours} hours
- Team Allocation: {", ".join(pricing_output.team_allocation)}
- Development Cost: ${pricing_output.development_cost:,.2f} {pricing_output.currency}
- Infrastructure Setup: ${pricing_output.infrastructure_cost:,.2f} {pricing_output.currency}
- Annual Maintenance & Support: ${pricing_output.maintenance_cost:,.2f} {pricing_output.currency}
- Estimated Total: ${pricing_output.estimated_total:,.2f} {pricing_output.currency}
- Pricing Range: {pricing_output.pricing_range}
- Financial Reasoning: {pricing_output.reasoning}

RISK ASSESSMENT:
- Overall Risk Score: {risk_output.overall_risk_level}
- Risk Summary: {risk_output.summary}
- Identified Risk Vectors:
{risks_str}

INSTRUCTIONS:
Generate a complete structured proposal. In `markdown_content`, provide the entire proposal formatted in clean GitHub-Flavored Markdown using clear `#`, `##`, `###` headers, bullet lists, bold text, and tables for pricing and timeline.

The proposal MUST contain all of these standard enterprise proposal sections:
1. Executive Summary
2. Client Problem & Context
3. Project Objectives
4. Proposed Technical Solution & Features
5. Technical Architecture & Tech Stack
6. Implementation Plan & Deliverables
7. Estimated Timeline & Milestones
8. Pricing & Financial Investment Breakdown
9. Risk Assessment & Mitigation Strategy
10. Project Assumptions & Governance
11. Post-Launch Support & SLA Maintenance
12. Why Partner With Us
13. Next Steps & Onboarding Call to Action
"""

        proposal_output = await self.generate_structured(prompt, schema=ProposalOutput)

        # Fallback formatting check: if markdown_content is sparse, synthesize clean markdown from fields
        if not proposal_output.markdown_content or len(proposal_output.markdown_content) < 300:
            proposal_output.markdown_content = self._format_markdown_fallback(
                planner_output, pricing_output, risk_output, proposal_output
            )

        return proposal_output

    def _format_markdown_fallback(
        self,
        planner: PlannerOutput,
        pricing: PricingOutput,
        risk: RiskOutput,
        proposal: ProposalOutput
    ) -> str:
        """Fallback helper to format structured ProposalOutput fields into pristine markdown."""
        md = []
        md.append(f"# 📄 Executive Business Proposal for {planner.company_name}\n")
        md.append(f"**Project Type:** {planner.project_type} | **Complexity:** {planner.complexity} | **Target Timeline:** {pricing.timeline}\n")
        md.append("---\n")

        md.append("## 1. Executive Summary\n")
        md.append(f"{proposal.executive_summary}\n\n")

        md.append("## 2. Problem Statement & Context\n")
        md.append(f"{proposal.client_problem}\n\n")

        md.append("## 3. Project Objectives\n")
        for obj in proposal.objectives or planner.objectives:
            md.append(f"- {obj}")
        md.append("\n")

        md.append("## 4. Proposed Solution & Core Features\n")
        md.append(f"{proposal.proposed_solution}\n\n")
        md.append("### Key Features:\n")
        for feat in proposal.key_features:
            md.append(f"- {feat}")
        md.append("\n")

        md.append("## 5. Technical Architecture & Technology Stack\n")
        md.append(f"{proposal.technical_architecture}\n\n")
        md.append("**Recommended Tech Stack:**\n")
        for tech in planner.recommended_stack:
            md.append(f"- `{tech}`")
        md.append("\n")

        md.append("## 6. Implementation Plan & Deliverables\n")
        md.append("| Phase | Duration | Deliverable | Description | Complexity |\n")
        md.append("| :--- | :--- | :--- | :--- | :--- |\n")
        for d in planner.deliverables:
            md.append(f"| {d.phase} | TBD | {d.title} | {d.description} | {d.complexity} |\n")
        md.append("\n")

        md.append("## 7. Financial Investment & Budget Allocation\n")
        md.append(f"**Estimated Total Investment:** `${pricing.estimated_total:,.2f} {pricing.currency}` (Range: {pricing.pricing_range})\n\n")
        md.append("| Cost Component | Investment Amount |\n")
        md.append("| :--- | :--- |\n")
        md.append(f"| Software Development & Engineering | `${pricing.development_cost:,.2f}` |\n")
        md.append(f"| Infrastructure & Cloud Provisioning | `${pricing.infrastructure_cost:,.2f}` |\n")
        md.append(f"| Annual Maintenance & Support | `${pricing.maintenance_cost:,.2f}` |\n")
        md.append(f"| **Total Estimated Investment** | **`${pricing.estimated_total:,.2f}`** |\n\n")
        md.append(f"**Team Allocation:** {', '.join(pricing.team_allocation)}\n\n")

        md.append("## 8. Risk Assessment & Mitigation Strategy\n")
        md.append(f"**Overall Risk Posture:** `{risk.overall_risk_level}`\n\n")
        md.append("| Risk Vector | Category | Severity | Impact | Mitigation Strategy |\n")
        md.append("| :--- | :--- | :--- | :--- | :--- |\n")
        for r in risk.risks:
            md.append(f"| {r.risk} | {r.category} | {r.severity} | {r.impact} | {r.mitigation} |\n")
        md.append("\n")

        md.append("## 9. Project Assumptions & Governance\n")
        for item in planner.assumptions + pricing.assumptions:
            md.append(f"- {item}")
        md.append("\n")

        md.append("## 10. Post-Launch Maintenance & Support\n")
        md.append(f"{proposal.maintenance_support}\n\n")

        md.append("## 11. Why Partner With Us\n")
        md.append(f"{proposal.why_choose_us}\n\n")

        md.append("## 12. Next Steps\n")
        for step in proposal.next_steps:
            md.append(f"- {step}")
        md.append("\n")

        return "".join(md)