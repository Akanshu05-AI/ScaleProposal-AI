export type AgentStatus = "idle" | "running" | "completed" | "failed";

export interface WorkflowAgent {
  id: string;
  title: string;
  icon: string;
  task: string;
  status: AgentStatus;
  executionTime?: string;
  message?: string;
  error?: string;
}

export interface WorkflowEvent {
  workflow_id: string;
  agent: string;
  status: string;
  message?: string;
  executionTime?: string;
  error?: string;
  data?: any;
}