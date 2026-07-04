export interface ProposalRequest {
  company_name: string;
  project_type: string;
  requirements: string;
}

export interface WorkflowAgent {
  agent: string;
  icon: string;
  task: string;
  status: string;
  execution_time: string;
}

export interface ProposalResponse {
  status: string;
  proposal: string;

  workflow?: WorkflowAgent[];

  total_execution_time?: string;
}