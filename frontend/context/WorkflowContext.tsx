"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { WorkflowAgent, AgentStatus } from "@/types/workflow";

interface WorkflowContextType {
  agents: WorkflowAgent[];
  activeWorkflowId: string | null;
  setActiveWorkflowId: (id: string | null) => void;
  updateAgent: (
    id: string,
    status: AgentStatus,
    executionTime?: string,
    message?: string,
    error?: string
  ) => void;
  resetWorkflow: () => void;
}

const defaultAgents: WorkflowAgent[] = [
  {
    id: "planner",
    title: "Planner Agent",
    icon: "🧠",
    task: "Requirement Analysis & Scope Breakdown",
    status: "idle",
  },
  {
    id: "pricing",
    title: "Pricing Agent",
    icon: "💰",
    task: "Cost, Effort & Timeline Matrix",
    status: "idle",
  },
  {
    id: "risk",
    title: "Risk Agent",
    icon: "⚠️",
    task: "Security & Operational Risk Audit",
    status: "idle",
  },
  {
    id: "proposal",
    title: "Proposal Agent",
    icon: "✍️",
    task: "Executive Proposal Synthesis",
    status: "idle",
  },
];

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<WorkflowAgent[]>(
    defaultAgents.map((agent) => ({ ...agent }))
  );
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  const updateAgent = (
    id: string,
    status: AgentStatus,
    executionTime?: string,
    message?: string,
    error?: string
  ) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id !== id) {
          return agent;
        }
        return {
          ...agent,
          status,
          executionTime: executionTime ?? agent.executionTime,
          message: message ?? agent.message,
          error: error ?? agent.error,
        };
      })
    );
  };

  const resetWorkflow = () => {
    setAgents(
      defaultAgents.map((agent) => ({
        ...agent,
        status: "idle",
        executionTime: undefined,
        message: undefined,
        error: undefined,
      }))
    );
  };

  return (
    <WorkflowContext.Provider
      value={{
        agents,
        activeWorkflowId,
        setActiveWorkflowId,
        updateAgent,
        resetWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error("WorkflowProvider missing");
  }
  return context;
}