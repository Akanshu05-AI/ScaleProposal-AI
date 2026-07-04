"use client";

import { useEffect, useState, useRef } from "react";
import StatsCard from "./StatsCard";
import { useWorkflow } from "@/context/WorkflowContext";

export default function DashboardStats() {
  const { agents } = useWorkflow();

  // Live state for your proposal metrics
  const [proposalCount, setProposalCount] = useState(0);
  const [proposalSubtitle, setProposalSubtitle] = useState("+0 this week");

  // Ref lock to prevent double-triggering state changes
  const hasTriggered = useRef(false);

  // Identify the proposal agent and check if it's completed
  const proposalAgent = agents.find(
    (a) => a.id === "proposal" || a.title?.toLowerCase().includes("proposal")
  );
  const isFinished = proposalAgent?.status === "completed";

  useEffect(() => {
    if (isFinished && !hasTriggered.current) {
      hasTriggered.current = true;
      
      setProposalCount(1);
      setProposalSubtitle("+1 this week");
    }

    if (proposalAgent?.status === "idle" || proposalAgent?.status === "running") {
      hasTriggered.current = false;
    }
  }, [isFinished, proposalAgent?.status]);

  // Compute Live Average Execution Time dynamically from active context agents
  const calculateLiveAverage = () => {
    const completedAgents = agents.filter(
      (a) => a.status === "completed" && a.executionTime
    );

    if (completedAgents.length === 0) return "0.0s";

    const totalSum = completedAgents.reduce((sum, agent) => {
      const numericValue = parseFloat(agent.executionTime || "0");
      return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    const average = totalSum / completedAgents.length;
    return `${average.toFixed(1)}s`;
  };

  const liveAverageTime = calculateLiveAverage();

  // Helper count parameter (Moved UP here to fix the initialization error)
  const completedAgentsCount = agents.filter((a) => a.status === "completed").length;

  // Dynamic helper subtitle context based on workflow engine activity
  const isRunning = agents.some((a) => a.status === "running");
  const averageTimeSubtitle = isRunning 
    ? "Calculating live..." 
    : completedAgentsCount > 0 
    ? "Pipeline execution mean" 
    : "System ready";

  return (
    <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Proposals Generated"
        value={String(proposalCount)}
        subtitle={proposalSubtitle}
      />

      <StatsCard
        title="AI Agents"
        value="4"
        subtitle="Active Orchestrators"
      />

      <StatsCard
        title="Average Time"
        value={liveAverageTime}
        subtitle={averageTimeSubtitle}
      />

      <StatsCard
        title="AI Model"
        value="Gemini"
        subtitle="Multi-Agent System"
      />
    </div>
  );
}