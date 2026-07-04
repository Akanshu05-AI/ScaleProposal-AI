export type AgentStatus =
    | "idle"
    | "running"
    | "completed"
    | "failed";

export interface WorkflowAgent {

    id: string;

    title: string;

    icon: string;

    task: string;

    status: AgentStatus;

    executionTime?: string;

    error?: string;

}