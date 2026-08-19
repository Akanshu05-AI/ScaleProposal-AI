export interface DeliverableItem {
  title: string;
  description: string;
  phase: string;
  complexity: string;
}

export interface PhaseItem {
  phase_number: number;
  phase_name: string;
  duration_weeks: number;
  key_activities: string[];
}

export interface PlannerOutput {
  company_name: string;
  project_type: string;
  project_summary: string;
  objectives: string[];
  deliverables: DeliverableItem[];
  phases: PhaseItem[];
  recommended_stack: string[];
  dependencies: string[];
  assumptions: string[];
  complexity: string;
}

export interface PricingOutput {
  currency: string;
  development_cost: number;
  infrastructure_cost: number;
  maintenance_cost: number;
  estimated_total: number;
  pricing_range: string;
  effort_hours: number;
  team_allocation: string[];
  timeline: string;
  reasoning: string;
  assumptions: string[];
}

export interface RiskItem {
  risk: string;
  category: string;
  severity: string;
  probability: string;
  impact: string;
  mitigation: string;
}

export interface RiskOutput {
  overall_risk_level: string;
  summary: string;
  risks: RiskItem[];
}

export interface ProposalOutput {
  executive_summary: string;
  client_problem: string;
  objectives: string[];
  proposed_solution: string;
  key_features: string[];
  technical_architecture: string;
  technology_stack: string[];
  implementation_plan: string[];
  timeline: string;
  deliverables: string[];
  pricing_summary: string;
  risks_and_mitigation: string[];
  assumptions: string[];
  maintenance_support: string;
  why_choose_us: string;
  next_steps: string[];
  markdown_content: string;
}

export interface ProposalResponse {
  id: string;
  workflow_id: string;
  company_name: string;
  project_type: string;
  requirements: string;
  status: string;
  total_execution_time?: string;
  planner?: PlannerOutput;
  pricing?: PricingOutput;
  risk?: RiskOutput;
  proposal?: ProposalOutput;
  final_markdown?: string;
  created_at: string;
}

export interface ProposalSummaryItem {
  id: string;
  workflow_id: string;
  company_name: string;
  project_type: string;
  cost?: string;
  timeline?: string;
  overall_risk_level?: string;
  status: string;
  created_at: string;
}

export interface ProposalListResponse {
  total: number;
  proposals: ProposalSummaryItem[];
}

export interface ProposalCreatePayload {
  company_name: string;
  project_type: string;
  requirements: string;
  budget_target?: string;
  deadline_target?: string;
  industry?: string;
  target_audience?: string;
  workflow_id?: string;
}

export type ProposalRequest = ProposalCreatePayload;