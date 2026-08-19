"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ProposalForm from "@/components/proposal/ProposalForm";
import WorkflowTimeline from "@/components/workflow/WorkflowTimeline";
import ProposalViewer from "@/components/proposal/ProposalViewer";
import HistorySidebar from "@/components/dashboard/HistorySidebar";
import { ProposalResponse, ProposalSummaryItem } from "@/types/proposal";
import { apiService } from "@/services/api";

export default function Home() {
  const [proposalResponse, setProposalResponse] = useState<ProposalResponse | null>(null);
  const [, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ProposalSummaryItem[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  // Fetch proposals history list from backend
  const loadHistory = useCallback(async () => {
    try {
      const data = await apiService.listProposals();
      setHistoryList(data.proposals || []);
    } catch (err) {
      console.warn("Could not connect to backend database history:", err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Load a historical proposal into the main viewer workspace
  const handleSelectProposal = async (id: string) => {
    setSelectedProposalId(id);
    setLoading(true);
    try {
      const detailedProposal = await apiService.getProposal(id);
      setProposalResponse(detailedProposal);
    } catch (err) {
      console.error("Failed to load selected proposal details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a historical proposal
  const handleDeleteProposal = async (id: string) => {
    try {
      await apiService.deleteProposal(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id && item.workflow_id !== id));
      if (selectedProposalId === id) {
        setSelectedProposalId(null);
        setProposalResponse(null);
      }
    } catch (err) {
      console.error("Failed to delete proposal:", err);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-8 selection:bg-blue-500/30 overflow-x-hidden relative">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-[1600px] space-y-8 relative z-10">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              ScaleProposal AI
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Production-Grade Multi-Agent Proposal Generation Platform
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-medium text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)] self-start sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Hybrid AI Engine Active
          </div>
        </div>

        <DashboardStats />

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-3 min-h-[450px]">
            <HistorySidebar
              history={historyList}
              onSelectProposal={handleSelectProposal}
              onDeleteProposal={handleDeleteProposal}
              activeProposalId={selectedProposalId}
            />
          </div>

          <div className="lg:col-span-4">
            <ProposalForm
              setProposalResponse={(response) => {
                setProposalResponse(response);
                setSelectedProposalId(response.id);
              }}
              setLoading={setLoading}
              onRefreshHistory={loadHistory}
            />
          </div>

          <div className="lg:col-span-5">
            <WorkflowTimeline />
          </div>
        </div>

        {/* Proposal Output Workspace */}
        <div className="pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Generated Blueprint Output Workspace
            </h3>
            {proposalResponse && (
              <span className="text-xs text-zinc-500 font-mono">
                Session: {proposalResponse.workflow_id}
              </span>
            )}
          </div>
          <ProposalViewer proposalResponse={proposalResponse} />
        </div>
      </div>
    </main>
  );
}