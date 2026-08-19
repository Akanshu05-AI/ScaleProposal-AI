"use client";

import { useState } from "react";
import { useWorkflow } from "../../context/WorkflowContext";
import { apiService } from "../../services/api";
import { WorkflowStreamService } from "../../services/sse";
import { ProposalResponse } from "../../types/proposal";
import { Sparkles, Send, Layers } from "lucide-react";

interface ProposalFormProps {
  setProposalResponse: (proposal: ProposalResponse) => void;
  setLoading: (loading: boolean) => void;
  onRefreshHistory: () => void;
}

export default function ProposalForm({
  setProposalResponse,
  setLoading,
  onRefreshHistory,
}: ProposalFormProps) {
  const { updateAgent, resetWorkflow, setActiveWorkflowId } = useWorkflow();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form input states
  const [companyName, setCompanyName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [requirements, setRequirements] = useState("");
  const [budgetTarget, setBudgetTarget] = useState("");
  const [deadlineTarget, setDeadlineTarget] = useState("");
  const [industry, setIndustry] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !projectType || !requirements) return;

    setLoading(true);
    setIsSubmitting(true);
    setErrorMessage(null);
    resetWorkflow();

    // Generate isolated workflow session ID
    const workflowId = `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setActiveWorkflowId(workflowId);

    // Open isolated SSE stream connection BEFORE submitting request
    const unsubscribe = WorkflowStreamService.subscribe(
      workflowId,
      (event) => {
        if (event.agent && event.agent !== "workflow") {
          updateAgent(
            event.agent,
            event.status as any,
            event.executionTime,
            event.message
          );
        }
      },
      (err) => {
        console.warn("SSE stream interrupted:", err);
      }
    );

    try {
      updateAgent("planner", "running", undefined, "Analyzing requirements...");

      // Submit API request with structured payload
      const response = await apiService.createProposal({
        company_name: companyName,
        project_type: projectType,
        requirements: requirements,
        budget_target: budgetTarget || undefined,
        deadline_target: deadlineTarget || undefined,
        industry: industry || undefined,
        workflow_id: workflowId,
      });

      // Update proposal state with genuine structured backend outputs
      setProposalResponse(response);

      // Refresh proposals history sidebar
      onRefreshHistory();
    } catch (error: any) {
      console.error("Proposal Generation Error:", error);
      setErrorMessage(error.message || "Failed to generate proposal.");
      updateAgent("planner", "failed", undefined, undefined, error.message);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setTimeout(() => unsubscribe(), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Proposal Specs</h2>
            <p className="text-xs text-zinc-500">Configure client parameters</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-800/50">
          <Layers size={12} className="text-blue-400" />
          <span>4 AI Agents</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name & Project Type inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 px-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Project Type *
            </label>
            <input
              type="text"
              placeholder="e.g. AI Platform"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 px-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            />
          </div>
        </div>

        {/* Optional Industry & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Industry (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Fintech, Healthcare"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 px-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Target Budget (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. $15,000 - $25,000"
              value={budgetTarget}
              onChange={(e) => setBudgetTarget(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 px-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Requirements / Scope Textarea */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Project Requirements & Scope *
          </label>
          <textarea
            placeholder="Outline objectives, feature requirements, integrations, security needs, or constraints..."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            disabled={isSubmitting}
            rows={4}
            className="w-full p-3 rounded-lg bg-zinc-900/70 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            required
            minLength={10}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !companyName || !projectType || !requirements}
          className={`w-full flex items-center justify-center gap-2 h-10 font-medium text-xs transition-all duration-300 rounded-xl ${
            isSubmitting
              ? "bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.2)] active:scale-[0.98]"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              Orchestrating Multi-Agent AI...
            </span>
          ) : (
            <>
              <Send size={14} />
              <span>Generate AI Proposal</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}